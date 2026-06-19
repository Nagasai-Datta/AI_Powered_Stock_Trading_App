const { model } = require("mongoose");
const { TransactionSchema } = require("../schemas/TransactionSchema");

const TransactionModel = model("Transaction", TransactionSchema);

module.exports = { TransactionModel };
