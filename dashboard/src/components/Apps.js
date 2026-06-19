import React from "react";

const UPCOMING = [
  { title: "Market Replay", desc: "Replay a past trading day and paper-trade as prices move." },
  { title: "Trade Journal", desc: "Log the reasoning behind each trade and surface your patterns." },
  { title: "Price Alerts", desc: "Get notified when a stock crosses a level you set." },
  { title: "What-if Lab", desc: "Stress-test your portfolio against market scenarios." },
];

const Apps = () => (
  <div className="tt-scope tt-page">
    <h2>Apps</h2>
    <p className="tt-muted" style={{ fontSize: 13, marginBottom: 18 }}>
      Extensions to your terminal. These build on the live market and your ledger.
    </p>
    <div className="tt-apps-grid">
      {UPCOMING.map((a) => (
        <div className="tt-app-card" key={a.title}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>{a.title}</h3>
            <span className="tt-soon">Soon</span>
          </div>
          <p className="tt-muted" style={{ fontSize: 13, margin: 0 }}>{a.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Apps;
