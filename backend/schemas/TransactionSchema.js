const { Schema } = require("mongoose");

// The ledger: an append-only record of every executed trade.
// Holdings are the running position; transactions are the immutable history.
const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  ticker: { type: String, required: true },
  side: { type: String, enum: ["BUY", "SELL"], required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  realized: { type: Number, default: 0 }, // realised P&L, only on sells
  createdAt: { type: Date, default: Date.now },
});

module.exports = { TransactionSchema };
