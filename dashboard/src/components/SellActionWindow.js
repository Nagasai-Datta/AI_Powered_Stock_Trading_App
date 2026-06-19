import React, { useState, useContext, useEffect } from "react";
import GeneralContext from "./GeneralContext";
import { useQuotes } from "../hooks/useQuotes";
import { placeOrder, getHoldings } from "../api";

const inr = (n) =>
  "\u20B9" +
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const SellActionWindow = ({ uid }) => {
  const { bySymbol } = useQuotes();
  const { closeSellWindow } = useContext(GeneralContext);
  const stock = bySymbol[uid];
  const live = stock?.price || 0;

  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(live);
  const [held, setHeld] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (live && !price) setPrice(live);
  }, [live, price]);
  useEffect(() => {
    getHoldings()
      .then((h) => setHeld(h.find((x) => x.ticker === uid)?.qty || 0))
      .catch(() => {});
  }, [uid]);

  const proceeds = Number(qty) * (Number(price) || live);
  const tooMany = held != null && Number(qty) > held;

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
    <div className="tt-scope tt-modal-backdrop" onClick={closeSellWindow}>
      <div className="tt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tt-modal-head">
          <div>
            <div className="tt-modal-tkr">{uid}</div>
            <div className="tt-modal-name">{stock?.name || ""}</div>
          </div>
          <span className="tt-side-badge sell">Sell</span>
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
            <span className="tt-muted">Estimated proceeds</span>
            <span className="tt-num">{inr(proceeds)}</span>
          </div>
          {held != null && (
            <div className="tt-summary">
              <span className="tt-muted">You hold</span>
              <span className={`tt-num ${tooMany ? "tt-down" : ""}`}>
                {held} shares
              </span>
            </div>
          )}
        </div>

        {error && <div className="tt-modal-err">{error}</div>}
        {tooMany && !error && (
          <div className="tt-modal-err">You only hold {held} shares.</div>
        )}

        <div className="tt-modal-foot">
          <button
            className="tt-act-sell"
            disabled={busy || tooMany}
            onClick={handleSell}
          >
            {busy ? "Placing\u2026" : "Sell"}
          </button>
          <button className="tt-act-cancel" onClick={closeSellWindow}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;
