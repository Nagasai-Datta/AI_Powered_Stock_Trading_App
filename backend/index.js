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

// app.get("/holdings", async (req, res) => {
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//   ];
//   tempHoldings.forEach((item) => {
//     let newHol = new HoldingsModel({
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.day,
//       day: item.day,
//     });
//     newHol.save();
//   });
//   res.send("done!");
// });
// app.get("/positions", async (req, res) => {
//   let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({
//       product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

//     newPosition.save();
//   });
//   res.send("Done!");
// });

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
    avg: 2 * req.body.price,
    price: await req.body.price,
  });
  newHolding.save();
  res.send("order Saved!");
});
app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({}); //fecth all data from positions model
  res.json(allOrders);
});
app.listen(PORT, () => {
  console.log("App started");
  mongoose.connect(url);
});
