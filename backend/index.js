require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel"); // new User model

const PORT = process.env.PORT || 8080;
const url = process.env.MONGO_URL;

const app = express();

// Middlewares
// app.use(cors()); //{ origin: "http://localhost:3000", credentials: true }

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests from any localhost origin or no origin (Postman, curl)
      if (!origin || origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(null, true); // allow all origins dynamically
      }
    },
    credentials: true, // allow cookies/session
  })
);
app.use(bodyParser.json());
app.use(
  session({ secret: "mysecretkey", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

// --------------------- PASSPORT CONFIG ---------------------
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
  const user = await UserModel.findById(id);
  done(null, user);
});

// --------------------- AUTH ROUTES ---------------------
// Signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new UserModel({ username, email, password: hashedPassword });
  await newUser.save();

  // Log user in immediately after signup
  req.login(newUser, (err) => {
    if (err)
      return res.status(500).json({ message: "Login after signup failed" });
    return res.json({ message: "Signup successful", user: newUser });
  });
});

// Login
app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Login successful", user: req.user });
});

// Logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ message: "Logged out successfully" });
  });
});

// --------------------- EXISTING APP ROUTES ---------------------
app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.post("/newOrder", async (req, res) => {
  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });
  await newOrder.save();

  let newHolding = new HoldingsModel({
    name: req.body.name,
    qty: req.body.qty,
    avg: req.body.price,
    price: req.body.price,
  });
  await newHolding.save();

  res.send("order Saved!");
});

app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({});
  res.json(allOrders);
});

app.get("/allOrders/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const userOrders = await OrdersModel.find({ name: uid });
    res.json(userOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/newOrderSell", async (req, res) => {
  const { name, qty, price, mode } = req.body;

  try {
    let newOrder = new OrdersModel({ name, qty, price, mode });
    await newOrder.save();

    await HoldingsModel.updateOne({ name }, { qty: qty });

    res
      .status(200)
      .json({ message: "Sell order placed and holdings updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/deleteOrder/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const deletedHolding = await HoldingsModel.findOneAndDelete({ name: uid });
    res.json({
      message: "holdings deleted successfully",
      holding: deletedHolding,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------- START SERVER ---------------------
mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB connection error:", err));
