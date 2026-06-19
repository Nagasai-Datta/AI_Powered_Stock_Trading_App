// Pure functions for position maths. No database, no engine — just arithmetic,
// so they can be unit-tested in isolation and reused by the order route.

const round2 = (n) => Math.round(n * 100) / 100;

// Weighted-average cost when adding to a position.
function applyBuy(position, qty, price) {
  const prevQty = position ? position.qty : 0;
  const prevAvg = position ? position.avgCost : 0;
  const newQty = prevQty + qty;
  const newAvg =
    newQty === 0 ? 0 : round2((prevQty * prevAvg + qty * price) / newQty);
  return { qty: newQty, avgCost: newAvg };
}

// Reduce a position on sell; realised P&L = (sellPrice - avgCost) * qty.
function applySell(position, qty, price) {
  const prevQty = position ? position.qty : 0;
  if (qty > prevQty) {
    throw new Error("Cannot sell more than currently held");
  }
  const avg = position ? position.avgCost : 0;
  const realized = round2((price - avg) * qty);
  const newQty = prevQty - qty;
  return { qty: newQty, avgCost: newQty === 0 ? 0 : avg, realized };
}

// Build a portfolio summary from holdings + a price lookup.
// getPrice(ticker) -> current price (number) or null.
function summarize(holdings, getPrice) {
  let invested = 0;
  let currentValue = 0;
  const bySector = {};
  const positions = [];

  for (const h of holdings) {
    if (!h.qty) continue;
    const price = getPrice(h.ticker);
    if (price == null) continue;
    const cost = h.avgCost * h.qty;
    const value = price * h.qty;
    invested += cost;
    currentValue += value;
    bySector[h.sector || "Other"] =
      (bySector[h.sector || "Other"] || 0) + value;
    positions.push({
      ticker: h.ticker,
      qty: h.qty,
      avgCost: h.avgCost,
      price,
      value: round2(value),
      pnl: round2(value - cost),
      pnlPct: cost ? round2(((value - cost) / cost) * 100) : 0,
    });
  }

  const pnl = round2(currentValue - invested);
  const pnlPct = invested ? round2((pnl / invested) * 100) : 0;

  // Concentration: largest single position as a share of the book.
  let topWeight = 0;
  let topTicker = null;
  for (const p of positions) {
    const w = currentValue ? p.value / currentValue : 0;
    if (w > topWeight) {
      topWeight = w;
      topTicker = p.ticker;
    }
  }

  const allocation = Object.entries(bySector)
    .map(([sector, value]) => ({
      sector,
      value: round2(value),
      pct: currentValue ? round2((value / currentValue) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const movers = [...positions].sort((a, b) => b.pnlPct - a.pnlPct);

  return {
    invested: round2(invested),
    currentValue: round2(currentValue),
    pnl,
    pnlPct,
    positionCount: positions.length,
    concentration: {
      ticker: topTicker,
      pct: round2(topWeight * 100),
      warning: topWeight > 0.25,
    },
    allocation,
    topGainers: movers.slice(0, 3),
    topLosers: movers.slice(-3).reverse(),
  };
}

module.exports = { applyBuy, applySell, summarize, round2 };
