import React, { useEffect, useState } from "react";
import { getHoldings } from "../api";
import { useQuotes } from "../hooks/useQuotes";

const inr = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const Positions = () => {
  const { bySymbol } = useQuotes();
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const h = await getHoldings();
        if (alive) { setRows(h); setError(false); }
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoaded(true);
      }
    };
    load();
    const t = setInterval(load, 6000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (loaded && error)
    return <div className="tt-scope tt-empty">Couldn't load positions. Sign in and refresh.</div>;
  if (!loaded)
    return <div className="tt-scope tt-page"><div className="tt-skeleton" style={{ height: 200 }} /></div>;
  if (rows.length === 0)
    return (
      <div className="tt-scope tt-page">
        <h2>Positions</h2>
        <p className="tt-muted">No open positions. Your live holdings appear here with today's movement.</p>
      </div>
    );

  return (
    <div className="tt-scope tt-page">
      <h2>Positions ({rows.length})</h2>
      <table className="tt-table">
        <thead>
          <tr>
            <th>Instrument</th><th>Qty</th><th>Avg cost</th><th>LTP</th><th>Day chg.</th><th>P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const q = bySymbol[r.ticker];
            const price = q?.price ?? r.price;
            const dayPct = q?.changePct ?? 0;
            const value = price * r.qty;
            const pnl = value - r.avgCost * r.qty;
            return (
              <tr key={r.ticker}>
                <td>{r.ticker}<span className="tt-tag">{r.sector}</span></td>
                <td className="tt-num">{r.qty}</td>
                <td className="tt-num">{inr(r.avgCost)}</td>
                <td className="tt-num">{inr(price)}</td>
                <td className={`tt-num ${dayPct >= 0 ? "tt-up" : "tt-down"}`}>
                  {dayPct >= 0 ? "+" : ""}{dayPct}%
                </td>
                <td className={`tt-num ${pnl >= 0 ? "tt-up" : "tt-down"}`}>
                  {pnl >= 0 ? "+" : ""}{inr(pnl)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Positions;
