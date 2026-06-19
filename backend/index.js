require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const { HoldingsModel } = require("./model/HoldingsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { TransactionModel } = require("./model/TransactionModel");
const { UserModel } = require("./model/UserModel");
const { seedStocks, demoHoldings } = require("./seedData");
const engine = require("./marketEngine");
const { applyBuy, applySell, summarize, round2 } = require("./portfolioLogic");

const PORT = process.env.PORT || 8080;
const url = process.env.MONGO_URL;

const app = express();

// Start the simulated market as soon as the process boots.
engine.init();

// --------------------- MIDDLEWARE ---------------------
app.use(
  cors({
    origin: true, // reflects request origin; works with credentials
    credentials: true,
  })
);
app.use(bodyParser.json());

// In production the dashboard (Vercel) and API (Render) are on different
// domains, so the session cookie must be SameSite=None; Secure to be sent
// cross-site. Locally over http we keep Lax/non-secure so it still works.
const isProd = process.env.NODE_ENV === "production";
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --------------------- PASSPORT ---------------------
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return done(null, false, { message: "Incorrect password" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Not authenticated" });
}

const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  cash: round2(u.cash),
  isDemo: u.isDemo,
});

// --------------------- AUTH ROUTES ---------------------
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    req.login(newUser, (err) => {
      if (err)
        return res.status(500).json({ message: "Login after signup failed" });
      return res.json({
        message: "Signup successful",
        user: publicUser(newUser),
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Login successful", user: publicUser(req.user) });
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/me", ensureAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// --------------------- DEMO MODE ---------------------
// One-click entry into a pre-seeded account, no signup required.
const DEMO_EMAIL = "demo@tradeit.app";

async function ensureDemoSeed(user) {
  const existing = await HoldingsModel.countDocuments({ userId: user._id });
  if (existing > 0) return;
  const sectorOf = Object.fromEntries(
    seedStocks.map((s) => [s.ticker, s.sector])
  );
  for (const h of demoHoldings) {
    await HoldingsModel.create({
      userId: user._id,
      ticker: h.ticker,
      sector: sectorOf[h.ticker],
      qty: h.qty,
      avgCost: h.avgCost,
    });
    await TransactionModel.create({
      userId: user._id,
      ticker: h.ticker,
      side: "BUY",
      qty: h.qty,
      price: h.avgCost,
    });
  }
}

app.post("/demo/login", async (req, res) => {
  try {
    let demo = await UserModel.findOne({ email: DEMO_EMAIL });
    if (!demo) {
      const hashed = await bcrypt.hash("demo-account", 10);
      demo = await UserModel.create({
        username: "Demo Investor",
        email: DEMO_EMAIL,
        password: hashed,
        cash: 50000,
        isDemo: true,
      });
    }
    await ensureDemoSeed(demo);
    req.login(demo, (err) => {
      if (err) return res.status(500).json({ message: "Demo login failed" });
      res.json({ message: "Demo session started", user: publicUser(demo) });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --------------------- MARKET DATA ---------------------
app.get("/quotes", (req, res) => {
  res.json(engine.getQuotes());
});

app.get("/quotes/:ticker", (req, res) => {
  const q = engine.getQuote(req.params.ticker);
  if (!q) return res.status(404).json({ message: "Unknown ticker" });
  res.json(q);
});

// Watchlist mirrors the market; the frontend can show all or a subset.
app.get("/allWatchLists", (req, res) => {
  res.json(engine.getQuotes());
});

// --------------------- HOLDINGS / PORTFOLIO ---------------------
app.get("/holdings", ensureAuth, async (req, res) => {
  try {
    const holdings = await HoldingsModel.find({
      userId: req.user._id,
      qty: { $gt: 0 },
    });
    const enriched = holdings.map((h) => {
      const price = engine.getPrice(h.ticker) ?? h.avgCost;
      const value = price * h.qty;
      const cost = h.avgCost * h.qty;
      return {
        ticker: h.ticker,
        sector: h.sector,
        qty: h.qty,
        avgCost: round2(h.avgCost),
        price: round2(price),
        value: round2(value),
        pnl: round2(value - cost),
        pnlPct: cost ? round2(((value - cost) / cost) * 100) : 0,
      };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/portfolio/summary", ensureAuth, async (req, res) => {
  try {
    const holdings = await HoldingsModel.find({
      userId: req.user._id,
      qty: { $gt: 0 },
    });
    const summary = summarize(
      holdings.map((h) => ({
        ticker: h.ticker,
        sector: h.sector,
        qty: h.qty,
        avgCost: h.avgCost,
      })),
      engine.getPrice
    );
    summary.cash = round2(req.user.cash);
    summary.netWorth = round2(summary.currentValue + req.user.cash);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/funds", ensureAuth, async (req, res) => {
  try {
    const holdings = await HoldingsModel.find({
      userId: req.user._id,
      qty: { $gt: 0 },
    });
    let invested = 0;
    for (const h of holdings) invested += h.avgCost * h.qty;
    res.json({
      cash: round2(req.user.cash),
      invested: round2(invested),
      openingBalance: round2(req.user.cash + invested),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add (fake) funds to the user's cash balance after a mock payment.
app.post("/funds/add", ensureAuth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      return res.status(400).json({ message: "Enter a valid amount" });

    const user = await UserModel.findById(req.user._id);
    user.cash = round2(user.cash + amount);
    await user.save();

    res.json({ message: "Funds added", cash: round2(user.cash) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/transactions", ensureAuth, async (req, res) => {
  try {
    const txns = await TransactionModel.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --------------------- ORDERS (write to the ledger) ---------------------
// Body: { ticker, side: "BUY"|"SELL", qty, price? }
// Price defaults to the live market price; a passed price acts as a limit/fill.
app.post("/order", ensureAuth, async (req, res) => {
  try {
    const { ticker, side, qty } = req.body;
    const quantity = Number(qty);
    const tradeSide = String(side || "").toUpperCase();

    if (!engine.hasTicker(ticker))
      return res.status(400).json({ message: "Unknown ticker" });
    if (!Number.isFinite(quantity) || quantity <= 0)
      return res
        .status(400)
        .json({ message: "Quantity must be a positive number" });
    if (tradeSide !== "BUY" && tradeSide !== "SELL")
      return res.status(400).json({ message: "Side must be BUY or SELL" });

    const price =
      req.body.price != null ? Number(req.body.price) : engine.getPrice(ticker);
    if (!Number.isFinite(price) || price <= 0)
      return res.status(400).json({ message: "Invalid price" });

    const sectorOf = Object.fromEntries(
      seedStocks.map((s) => [s.ticker, s.sector])
    );
    let holding = await HoldingsModel.findOne({ userId: req.user._id, ticker });
    const user = await UserModel.findById(req.user._id);

    if (tradeSide === "BUY") {
      const cost = round2(price * quantity);
      if (cost > user.cash)
        return res.status(400).json({ message: "Insufficient funds" });

      const updated = applyBuy(holding, quantity, price);
      if (!holding) {
        holding = new HoldingsModel({
          userId: req.user._id,
          ticker,
          sector: sectorOf[ticker],
        });
      }
      holding.qty = updated.qty;
      holding.avgCost = updated.avgCost;
      await holding.save();

      user.cash = round2(user.cash - cost);
      await user.save();

      await TransactionModel.create({
        userId: req.user._id,
        ticker,
        side: "BUY",
        qty: quantity,
        price,
      });
    } else {
      if (!holding || quantity > holding.qty)
        return res.status(400).json({ message: "Cannot sell more than held" });

      const result = applySell(holding, quantity, price);
      holding.qty = result.qty;
      holding.avgCost = result.avgCost;
      await holding.save();

      user.cash = round2(user.cash + price * quantity);
      await user.save();

      await TransactionModel.create({
        userId: req.user._id,
        ticker,
        side: "SELL",
        qty: quantity,
        price,
        realized: result.realized,
      });
    }

    res.json({ message: "Order executed", cash: round2(user.cash) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --------------------- CHATBOT (stock advice on live data) ---------------------
app.post("/chat", ensureAuth, async (req, res) => {
  try {
    const { question } = req.body;
    const holdings = await HoldingsModel.find({
      userId: req.user._id,
      qty: { $gt: 0 },
    });
    const positions = holdings.map((h) => {
      const price = engine.getPrice(h.ticker) ?? h.avgCost;
      return {
        ticker: h.ticker,
        sector: h.sector,
        qty: h.qty,
        avgCost: round2(h.avgCost),
        price: round2(price),
        pnlPct: h.avgCost ? round2(((price - h.avgCost) / h.avgCost) * 100) : 0,
      };
    });

    const prompt = `You are a portfolio analysis assistant inside a stock app.
Use ONLY the data below. Give clear, concise, explainable analysis and
suggestions (what looks strong, weak, concentrated, or risky). Frame ideas as
analysis to consider, not as guaranteed calls. Do not invent prices.

User's live holdings (price is current, avgCost is what they paid):
${JSON.stringify(positions, null, 2)}

Question: ${question}`;

    const dsRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // Use OpenRouter's free router by default: it auto-selects an
        // available free model, so a single model being retired won't
        // break the chatbot. Override with AI_MODEL to pin a specific one.
        model: process.env.AI_MODEL || "openrouter/free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer =
      dsRes.data.choices[0]?.message?.content || "Couldn't analyze.";
    res.json({ answer });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(500)
      .json({ answer: "Something went wrong with the AI service." });
  }
});

// --------------------- START ---------------------
mongoose
  .connect(url)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB connection error:", err));

module.exports = app;
