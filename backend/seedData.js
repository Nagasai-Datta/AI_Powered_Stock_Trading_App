// Single source of truth for the simulated market.
// The market engine reads these as starting prices and brings them to life.
// Prices are plausible NSE levels — they don't need to be "today's" price
// because this is our own controlled, simulated market.

const seedStocks = [
  // IT
  { ticker: "INFY", name: "Infosys Ltd", sector: "IT", seed: 1555.45 },
  { ticker: "TCS", name: "Tata Consultancy Services", sector: "IT", seed: 3194.8 },
  { ticker: "WIPRO", name: "Wipro Ltd", sector: "IT", seed: 577.75 },
  { ticker: "HCLTECH", name: "HCL Technologies", sector: "IT", seed: 1480.2 },
  { ticker: "TECHM", name: "Tech Mahindra", sector: "IT", seed: 1290.6 },

  // Banking & Financials
  { ticker: "HDFCBANK", name: "HDFC Bank", sector: "Banking", seed: 1650.3 },
  { ticker: "ICICIBANK", name: "ICICI Bank", sector: "Banking", seed: 1140.85 },
  { ticker: "SBIN", name: "State Bank of India", sector: "Banking", seed: 815.4 },
  { ticker: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking", seed: 1780.0 },
  { ticker: "AXISBANK", name: "Axis Bank", sector: "Banking", seed: 1095.25 },

  // Energy
  { ticker: "RELIANCE", name: "Reliance Industries", sector: "Energy", seed: 2950.4 },
  { ticker: "ONGC", name: "Oil & Natural Gas Corp", sector: "Energy", seed: 270.8 },
  { ticker: "NTPC", name: "NTPC Ltd", sector: "Energy", seed: 360.15 },
  { ticker: "POWERGRID", name: "Power Grid Corp", sector: "Energy", seed: 320.5 },
  { ticker: "BPCL", name: "Bharat Petroleum", sector: "Energy", seed: 290.65 },

  // FMCG
  { ticker: "HUL", name: "Hindustan Unilever", sector: "FMCG", seed: 2450.4 },
  { ticker: "ITC", name: "ITC Ltd", sector: "FMCG", seed: 435.1 },
  { ticker: "NESTLEIND", name: "Nestle India", sector: "FMCG", seed: 2480.9 },
  { ticker: "BRITANNIA", name: "Britannia Industries", sector: "FMCG", seed: 4850.0 },

  // Auto
  { ticker: "MARUTI", name: "Maruti Suzuki India", sector: "Auto", seed: 11200.0 },
  { ticker: "M&M", name: "Mahindra & Mahindra", sector: "Auto", seed: 2850.7 },
  { ticker: "TATAMOTORS", name: "Tata Motors", sector: "Auto", seed: 980.35 },
  { ticker: "BAJAJ-AUTO", name: "Bajaj Auto", sector: "Auto", seed: 9200.5 },

  // Pharma
  { ticker: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Pharma", seed: 1720.6 },
  { ticker: "CIPLA", name: "Cipla Ltd", sector: "Pharma", seed: 1480.25 },
  { ticker: "DRREDDY", name: "Dr. Reddy's Labs", sector: "Pharma", seed: 1280.9 },

  // Metals
  { ticker: "TATASTEEL", name: "Tata Steel", sector: "Metals", seed: 145.6 },
  { ticker: "JSWSTEEL", name: "JSW Steel", sector: "Metals", seed: 920.4 },
  { ticker: "HINDALCO", name: "Hindalco Industries", sector: "Metals", seed: 645.15 },
];

// A pre-built portfolio for the one-click Demo account (tickers must exist above).
const demoHoldings = [
  { ticker: "INFY", qty: 25, avgCost: 1490.0 },
  { ticker: "RELIANCE", qty: 10, avgCost: 2780.0 },
  { ticker: "HDFCBANK", qty: 15, avgCost: 1605.0 },
  { ticker: "TCS", qty: 8, avgCost: 3050.0 },
  { ticker: "ITC", qty: 120, avgCost: 410.0 },
  { ticker: "TATAMOTORS", qty: 40, avgCost: 910.0 },
  { ticker: "SUNPHARMA", qty: 18, avgCost: 1660.0 },
  { ticker: "SBIN", qty: 50, avgCost: 760.0 },
  { ticker: "MARUTI", qty: 2, avgCost: 10800.0 },
  { ticker: "TATASTEEL", qty: 200, avgCost: 138.0 },
];

module.exports = { seedStocks, demoHoldings };
