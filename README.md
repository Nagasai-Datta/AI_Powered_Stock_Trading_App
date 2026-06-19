# TradeIT — AI-Powered Stock Trading App

🔗 **Live app:** https://ai-powered-stock-trading-app-fronte.vercel.app

A full-stack paper-trading platform where you can sign up, get a live (simulated) market, build a portfolio, place buy/sell orders, and ask an AI assistant to analyze your holdings — all without risking real money.

---

## What it does

- **Sign up / log in** with your own account, or jump into a pre-seeded demo portfolio.
- **Live market** that ticks in real time (prices update every few seconds via a built-in market engine).
- **Trading dashboard** showing your net worth, total profit/loss, an equity curve, sector allocation, top movers, and a concentration-risk warning.
- **Watchlist** with live prices, mini price charts, search, and one-click Buy/Sell.
- **Holdings, Orders, Positions, and Funds** pages — every trade writes to a real ledger in the database.
- **AI assistant** that looks at your actual live holdings and gives plain-English analysis (what's strong, weak, over-concentrated, or risky).
- **Dark / light theme** toggle that remembers your choice.
- **Works across browsers** — login holds up in Chrome, Safari, and Firefox (see the note at the bottom).

---

## Tech stack

**Frontend (landing + dashboard)**

- React (Create React App) + React Router
- Recharts for the charts, MUI for some UI pieces
- Axios for talking to the API

**Backend**

- Node.js + Express
- MongoDB Atlas with Mongoose
- Passport.js (local strategy) + sessions for login, JWT for cross-domain auth
- bcrypt for password hashing

**AI Chatbot**

- OpenRouter API powers the portfolio chatbot

**Hosting**

- Landing page & dashboard on Vercel
- Backend API on Render
- Database on MongoDB Atlas

---

## Project structure

The repo is three apps that work together:

```
AI_Powered_Stock_Trading_App/
├── frontend/      → Landing page: marketing pages, login & signup
│   └── src/landing_page/...
│
├── dashboard/     → The trading terminal (everything after you log in)
│   └── src/
│       ├── components/   → Summary, Holdings, Orders, Watchlist, Chatbot, etc.
│       ├── hooks/        → useQuotes (shares live prices across the app)
│       ├── theme/        → dark/light theme
│       └── api.js        → all calls to the backend
│
└── backend/       → Express API + simulated market
    ├── index.js          → server, auth, and all the routes
    ├── marketEngine.js    → generates the live ticking prices
    ├── portfolioLogic.js  → buy/sell math and portfolio summaries
    ├── seedData.js        → starting stocks + demo holdings
    ├── model/             → Mongoose models (User, Holdings, Orders, ...)
    └── schemas/           → the database schemas
```

**Entire flow:** you log in on the **frontend**, which sends you to the **dashboard**. The dashboard talks to the **backend** for prices, holdings, orders, and AI analysis. The backend reads and writes everything to **MongoDB**.

---

## Running it locally

**You'll need:** Node.js installed, and a MongoDB connection string (a free MongoDB Atlas cluster works), plus an OpenRouter API key if you want the chatbot.

Each of the three apps runs on its own. Open three terminal tabs.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values (see below)
npm run dev               # starts on http://localhost:8080
```

### 2. Frontend (landing page)

```bash
cd frontend
npm install
cp .env.example .env      # fill in the values
npm start                 # starts on http://localhost:3000
```

### 3. Dashboard

```bash
cd dashboard
npm install
cp .env.example .env      # fill in the values
npm start                 # it'll offer another port (e.g. 3001) since 3000 is taken — say yes
```

Then open the landing page, sign up, and you'll land in the dashboard.

---

## Environment variables

Each app ships with a `.env.example` — copy it to `.env` and fill in your own values. Nothing secret is committed.

**backend/.env**

- `MONGO_URL` — your MongoDB connection string
- `SESSION_SECRET` — any long random string (signs the login session and token)
- `API_KEY` — your OpenRouter key for the chatbot
- `PORT` — `8080` is fine locally

**frontend/.env**

- `REACT_APP_BACKEND_URL` — where the backend runs (e.g. `http://localhost:8080`)
- `REACT_APP_DASHBOARD_URL` — where the dashboard runs (e.g. `http://localhost:3001`)

**dashboard/.env**

- `REACT_APP_BACKEND_URL` — the backend URL
- `REACT_APP_FRONTEND_URL` — the landing page URL (used for sign-out)

> Note: React only reads `REACT_APP_` variables at build time, so restart the app after changing them.

---

## Deployment

- **Backend** → Render (set the same env vars in the service's Environment tab; add `NODE_ENV=production`).
- **Landing page & Dashboard** → Vercel (two separate projects, each with its own env vars).
- **Database** → MongoDB Atlas.

Deploy the backend first, then the two frontends, so the URLs they point at already exist.

## Author

Built by Naga Sai Datta.
