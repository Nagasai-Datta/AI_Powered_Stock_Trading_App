import React, { useEffect, useState } from "react";
import { getFunds } from "../api";

const inr = (n) =>
  "\u20B9" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const Funds = () => {
  const [funds, setFunds] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    getFunds()
      .then((d) => { if (alive) { setFunds(d); setError(false); } })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);

  if (loaded && error)
    return <div className="tt-scope tt-empty">Couldn't load funds. Sign in and refresh.</div>;
  if (!loaded)
    return <div className="tt-scope tt-page"><div className="tt-skeleton" style={{ height: 140 }} /></div>;

  return (
    <div className="tt-scope tt-page">
      <h2>Funds</h2>
      <div className="tt-funds-grid">
        <div className="tt-stat"><p className="tt-stat-label">Available cash</p><p className="tt-stat-value tt-num">{inr(funds.cash)}</p></div>
        <div className="tt-stat"><p className="tt-stat-label">Invested</p><p className="tt-stat-value tt-num">{inr(funds.invested)}</p></div>
        <div className="tt-stat"><p className="tt-stat-label">Opening balance</p><p className="tt-stat-value tt-num">{inr(funds.openingBalance)}</p></div>
      </div>
      <p className="tt-muted" style={{ fontSize: 13, marginTop: 16 }}>
        Cash is your buying power. Buying a stock moves money from cash into invested; selling moves it back.
      </p>
    </div>
  );
};

export default Funds;
