const { Schema } = require("mongoose");

// One row per (user, ticker). Stores only what the user actually committed:
// quantity and weighted-average cost. The *current* price is never stored here
// — it always comes live from the market engine.
const HoldingsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  ticker: { type: String, required: true },
  sector: { type: String },
  qty: { type: Number, required: true, default: 0 },
  avgCost: { type: Number, required: true, default: 0 },
});

HoldingsSchema.index({ userId: 1, ticker: 1 }, { unique: true });

module.exports = { HoldingsSchema };
