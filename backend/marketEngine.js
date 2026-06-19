// The "market engine".
// Holds the current price of every stock in memory and nudges each price a
// little every few seconds so it behaves like a live ticker. It also keeps a
// short rolling price history per stock, which is what the sparklines and the
// portfolio chart draw from.
//
// Note: this is in-memory. On Render's free tier the process sleeps when idle
// and cold-starts fresh, which simply re-seeds the market. That's expected.

const { seedStocks } = require("./seedData");

const TICK_MS = 3000; // how often prices move
const HISTORY_LEN = 60; // points kept per stock (rolling window)
const SEED_HISTORY_POINTS = 40; // points generated at boot so charts have shape
const VOL = 0.004; // ~0.4% max move per tick
const DAY_BAND = 0.15; // price stays within +/-15% of the day's open

let market = {}; // ticker -> live state
let timer = null;

const round2 = (n) => Math.round(n * 100) / 100;
const randNudge = () => (Math.random() - 0.5) * 2 * VOL;

// Build a believable price history ending at the seed price, so the very first
// render already shows a line with shape instead of a flat horizontal segment.
function buildSeedHistory(price) {
  const pts = [];
  let p = price;
  for (let i = 0; i < SEED_HISTORY_POINTS; i++) {
    pts.push(round2(p));
    p = p / (1 + randNudge());
  }
  return pts.reverse(); // last element ~= current price
}

function init() {
  market = {};
  for (const s of seedStocks) {
    market[s.ticker] = {
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      open: s.seed, // reference point for the day's % change
      price: s.seed,
      history: buildSeedHistory(s.seed),
    };
  }
  if (timer) clearInterval(timer);
  timer = setInterval(tick, TICK_MS);
  return market;
}

function tick() {
  for (const t of Object.keys(market)) {
    const st = market[t];
    let next = st.price * (1 + randNudge());
    const hi = st.open * (1 + DAY_BAND);
    const lo = st.open * (1 - DAY_BAND);
    if (next > hi) next = hi;
    if (next < lo) next = lo;
    st.price = round2(next);
    st.history.push(st.price);
    if (st.history.length > HISTORY_LEN) st.history.shift();
  }
}

function formatQuote(st) {
  const change = round2(st.price - st.open);
  const changePct = round2(((st.price - st.open) / st.open) * 100);
  return {
    ticker: st.ticker,
    name: st.name,
    sector: st.sector,
    price: st.price,
    open: st.open,
    change,
    changePct,
    history: st.history.slice(),
  };
}

function getQuotes() {
  return Object.values(market).map(formatQuote);
}

function getQuote(ticker) {
  const st = market[ticker];
  return st ? formatQuote(st) : null;
}

function getPrice(ticker) {
  const st = market[ticker];
  return st ? st.price : null;
}

function hasTicker(ticker) {
  return Boolean(market[ticker]);
}

// Allow tests to advance the simulation deterministically.
function _tickOnce() {
  tick();
}

module.exports = {
  init,
  getQuotes,
  getQuote,
  getPrice,
  hasTicker,
  _tickOnce,
  TICK_MS,
};
