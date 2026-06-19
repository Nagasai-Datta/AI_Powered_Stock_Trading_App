import React, { useState, useContext, useEffect } from "react";
import GeneralContext from "./GeneralContext";
import { useQuotes } from "../hooks/useQuotes";
import { placeOrder } from "../api";
import "./BuyActionWindow.css";

const SellActionWindow = ({ uid }) => {
  const { bySymbol } = useQuotes();
  const { closeSellWindow } = useContext(GeneralContext);
  const live = bySymbol[uid]?.price || 0;

  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(live);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (live && !price) setPrice(live);
  }, [live, price]);

  const proceeds = (Number(qty) * Number(price || live)).toFixed(2);

  const handleSell = async () => {
    setBusy(true);
    setError("");
    try {
      await placeOrder(uid, "SELL", Number(qty), Number(price) || live);
      closeSellWindow();
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input type="number" step="0.05" value={price} onChange={(e) => setPrice(e.target.value)} />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Estimated proceeds &#8377;{proceeds}</span>
        {error && <span style={{ color: "#ff5c5c", fontSize: 13 }}>{error}</span>}
        <div>
          <button className="btn btn-blue" disabled={busy} onClick={handleSell}>
            {busy ? "Placing…" : "Sell"}
          </button>
          <button className="btn btn-grey" onClick={closeSellWindow}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;
