import React, { useState, useContext, useEffect } from "react";
import GeneralContext from "./GeneralContext";
import { useQuotes } from "../hooks/useQuotes";
import { placeOrder, getFunds } from "../api";

const inr = (n) =>
  "\u20B9" +
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const BuyActionWindow = ({ uid }) => {
  const { bySymbol } = useQuotes();
  const { closeBuyWindow } = useContext(GeneralContext);
  const stock = bySymbol[uid];
  const live = stock?.price || 0;

  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(live);
  const [cash, setCash] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (live && !price) setPrice(live);
  }, [live, price]);
  useEffect(() => {
    getFunds()
      .then((f) => setCash(f.cash))
      .catch(() => {});
  }, []);

  const cost = Number(qty) * (Number(price) || live);
  const tooExpensive = cash != null && cost > cash;

  const handleBuy = async () => {
    setBusy(true);
    setError("");
    try {
      await placeOrder(uid, "BUY", Number(qty), Number(price) || live);
      closeBuyWindow();
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tt-scope tt-modal-backdrop" onClick={closeBuyWindow}>
      <div className="tt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tt-modal-head">
          <div>
            <div className="tt-modal-tkr">{uid}</div>
            <div className="tt-modal-name">{stock?.name || ""}</div>
          </div>
          <span className="tt-side-badge buy">Buy</span>
        </div>

        <div className="tt-modal-body">
          <div className="tt-ltp">
            <span className="tt-muted" style={{ fontSize: 12 }}>
              LTP
            </span>
            <span className="v tt-num">{inr(live)}</span>
            {stock && (
              <span
                className={`tt-num ${
                  stock.changePct >= 0 ? "tt-up" : "tt-down"
                }`}
                style={{ fontSize: 13 }}
              >
                {stock.changePct >= 0 ? "+" : ""}
                {stock.changePct}%
              </span>
            )}
          </div>

          <div className="tt-field-row">
            <div className="tt-field">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="tt-field">
              <label>Price</label>
              <input
                type="number"
                step="0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="tt-summary">
            <span className="tt-muted">Estimated cost</span>
            <span className="tt-num">{inr(cost)}</span>
          </div>
          {cash != null && (
            <div className="tt-summary">
              <span className="tt-muted">Available funds</span>
              <span className={`tt-num ${tooExpensive ? "tt-down" : ""}`}>
                {inr(cash)}
              </span>
            </div>
          )}
        </div>

        {error && <div className="tt-modal-err">{error}</div>}
        {tooExpensive && !error && (
          <div className="tt-modal-err">Not enough funds for this order.</div>
        )}

        <div className="tt-modal-foot">
          <button
            className="tt-act-buy"
            disabled={busy || tooExpensive}
            onClick={handleBuy}
          >
            {busy ? "Placing\u2026" : "Buy"}
          </button>
          <button className="tt-act-cancel" onClick={closeBuyWindow}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
