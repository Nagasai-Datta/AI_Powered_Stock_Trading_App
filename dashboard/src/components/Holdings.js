import React, { useEffect, useState } from "react";
import { getHoldings } from "../api";
import { useQuotes } from "../hooks/useQuotes";

const inr = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const Holdings = () => {
  const { bySymbol } = useQuotes();
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState({ key: "value", dir: -1 });

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

  const live = rows.map((r) => {
    const price = bySymbol[r.ticker]?.price ?? r.price;
    const value = price * r.qty;
    const cost = r.avgCost * r.qty;
    return { ...r, price, value, pnl: value - cost, pnlPct: cost ? ((value - cost) / cost) * 100 : 0 };
  });
  const totalValue = live.reduce((a, r) => a + r.value, 0);
  const totalCost = live.reduce((a, r) => a + r.avgCost * r.qty, 0);
  const totalPnl = totalValue - totalCost;
  const withWeight = live.map((r) => ({ ...r, weight: totalValue ? (r.value / totalValue) * 100 : 0 }));
  const sorted = [...withWeight].sort((a, b) => {
    const v = a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0;
    return v * sort.dir;
  });
  const setSortKey = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: -1 }));
  const arrow = (k) => (sort.key === k ? (sort.dir < 0 ? " \u2193" : " \u2191") : "");

  if (loaded && error)
    return <div className="tt-scope tt-empty">Couldn't load holdings. Sign in and refresh.</div>;
  if (!loaded)
    return <div className="tt-scope tt-page"><div className="tt-skeleton" style={{ height: 240 }} /></div>;
  if (rows.length === 0)
    return (
      <div className="tt-scope tt-page">
        <h2>Holdings</h2>
        <p className="tt-muted">No holdings yet. Buy a stock from the watchlist to get started.</p>
      </div>
    );

  return (
    <div className="tt-scope tt-page">
      <h2>Holdings ({rows.length})</h2>
      <table className="tt-table">
        <thead>
          <tr>
            <th onClick={() => setSortKey("ticker")}>Instrument{arrow("ticker")}</th>
            <th onClick={() => setSortKey("qty")}>Qty{arrow("qty")}</th>
            <th onClick={() => setSortKey("avgCost")}>Avg cost{arrow("avgCost")}</th>
            <th onClick={() => setSortKey("price")}>LTP{arrow("price")}</th>
            <th onClick={() => setSortKey("value")}>Cur. value{arrow("value")}</th>
            <th onClick={() => setSortKey("pnl")}>P&amp;L{arrow("pnl")}</th>
            <th onClick={() => setSortKey("weight")}>Weight{arrow("weight")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.ticker}>
              <td>{r.ticker}<span className="tt-tag">{r.sector}</span></td>
              <td className="tt-num">{r.qty}</td>
              <td className="tt-num">{inr(r.avgCost)}</td>
              <td className="tt-num">{inr(r.price)}</td>
              <td className="tt-num">{inr(r.value)}</td>
              <td className={`tt-num ${r.pnl >= 0 ? "tt-up" : "tt-down"}`}>
                {r.pnl >= 0 ? "+" : ""}{inr(r.pnl)} ({r.pnlPct.toFixed(2)}%)
              </td>
              <td className="tt-num tt-muted">{r.weight.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td><td /><td /><td />
            <td className="tt-num">{inr(totalValue)}</td>
            <td className={`tt-num ${totalPnl >= 0 ? "tt-up" : "tt-down"}`}>
              {totalPnl >= 0 ? "+" : ""}{inr(totalPnl)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Holdings;
