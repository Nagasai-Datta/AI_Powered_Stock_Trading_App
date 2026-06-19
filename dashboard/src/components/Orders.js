import React, { useEffect, useState } from "react";
import { getTransactions } from "../api";

const inr = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

const Orders = () => {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    getTransactions()
      .then((d) => { if (alive) { setRows(d); setError(false); } })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);

  if (loaded && error)
    return <div className="tt-scope tt-empty">Couldn't load your orders. Sign in and refresh.</div>;
  if (!loaded)
    return <div className="tt-scope tt-page"><div className="tt-skeleton" style={{ height: 200 }} /></div>;
  if (rows.length === 0)
    return (
      <div className="tt-scope tt-page">
        <h2>Orders</h2>
        <p className="tt-muted">No orders yet. Every buy and sell you make is recorded here.</p>
      </div>
    );

  return (
    <div className="tt-scope tt-page">
      <h2>Order history ({rows.length})</h2>
      <table className="tt-table">
        <thead>
          <tr>
            <th>Time</th><th>Instrument</th><th>Side</th><th>Qty</th><th>Price</th><th>Realised P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t._id}>
              <td>{fmt(t.createdAt)}</td>
              <td>{t.ticker}</td>
              <td className={t.side === "BUY" ? "tt-side-buy" : "tt-side-sell"}>{t.side}</td>
              <td className="tt-num">{t.qty}</td>
              <td className="tt-num">{inr(t.price)}</td>
              <td className={`tt-num ${t.realized >= 0 ? "tt-up" : "tt-down"}`}>
                {t.side === "SELL" ? (t.realized >= 0 ? "+" : "") + inr(t.realized) : "\u2014"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
