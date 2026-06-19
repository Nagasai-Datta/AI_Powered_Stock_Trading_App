const { model } = require("mongoose");
const { HoldingsSchema } = require("../schemas/HoldingSchema");

const HoldingsModel = model("Holding", HoldingsSchema);

module.exports = { HoldingsModel };
