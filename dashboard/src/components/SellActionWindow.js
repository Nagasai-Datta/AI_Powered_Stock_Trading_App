import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";
const API_URL = process.env.REACT_APP_BACKEND_URL;
const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const { closeSellWindow } = useContext(GeneralContext); // FIXED CONTEXT
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/allOrders/${uid}`)
      .then((res) => setAllOrders(res.data))
      .catch((err) => console.error(err));
  }, [uid]);

  const handleSellClick = async () => {
    try {
      const userOrder = allOrders.find((order) => order.name === uid);

      if (!userOrder || userOrder.qty < stockQuantity) {
        alert("You do not have enough stocks to sell!");
        return;
      }

      const remainingQty = userOrder.qty - stockQuantity;

      // POST: create sell order + update holdings
      await axios.post(`${API_URL}/newOrderSell`, {
        name: uid,
        qty: remainingQty,
        price: stockPrice,
        mode: "SELL",
      });

      // DELETE if fully sold
      if (remainingQty === 0) {
        await axios.delete(`${API_URL}/deleteOrder/${uid}`);
      }

      closeSellWindow(); // CLOSE SELL WINDOW
    } catch (err) {
      console.error("Error placing sell order:", err);
    }
  };

  const handleCancelClick = () => {
    closeSellWindow(); // FIXED
  };

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              min="1"
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              step="0.05"
              onChange={(e) => setStockPrice(Number(e.target.value))}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <button className="btn btn-danger" onClick={handleSellClick}>
          Sell
        </button>
        <button className="btn btn-grey" onClick={handleCancelClick}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SellActionWindow;
