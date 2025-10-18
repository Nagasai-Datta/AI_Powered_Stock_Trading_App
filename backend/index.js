require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const url = process.env.MONGO_URL;
const app = express();
//middlewares cors and body parser
app.use(cors());
app.use(bodyParser.json());

app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({}); //fecth all data from holdings model
  res.json(allHoldings);
});
app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({}); //fecth all data from positions model
  res.json(allPositions);
});
app.post("/newOrder", async (req, res) => {
  let newOrder = new OrdersModel({
    name: await req.body.name,
    qty: await req.body.qty,
    price: await req.body.price,
    mode: await req.body.mode,
  });
  newOrder.save();
  let newHolding = new HoldingsModel({
    name: await req.body.name,
    qty: await req.body.qty,
    avg: await req.body.price,
    price: avg,
  });
  newHolding.save();
  res.send("order Saved!");
});
app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({}); //fecth all data from positions model
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
  const { name, qty, price, mode } = await req.body;

  try {
    // Create new sell order (transaction history)
    let newOrder = new OrdersModel({
      name: await req.body.name,
      qty: await req.body.qty,
      price: await req.body.price,
      mode: await req.body.mode,
    });
    await newOrder.save();

    // Update user's current holdings

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

app.listen(PORT, () => {
  console.log("App started");
  mongoose.connect(url);
});
