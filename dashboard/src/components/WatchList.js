import React, { useContext, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import GeneralContext from "./GeneralContext";
import { useQuotes, pulseClass } from "../hooks/useQuotes";

const Sparkline = ({ history, up }) => {
  const data = (history || []).slice(-24).map((v, i) => ({ i, v }));
  if (data.length < 2) return <div style={{ width: 64, height: 24 }} />;
  return (
    <ResponsiveContainer width={64} height={24}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={up ? "var(--tt-up)" : "var(--tt-down)"}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const WatchListItem = ({ stock, prevPrices }) => {
  const { openBuyWindow, openSellWindow } = useContext(GeneralContext);
  const [hover, setHover] = useState(false);
  const up = stock.changePct >= 0;
  const pulse = pulseClass(stock.ticker, stock.price, prevPrices);

  return (
    <li
      className="tt-wl-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="tt-wl-top">
        <div className="tt-wl-name">
          <span className="tt-wl-tkr">{stock.ticker}</span>
          <span className="tt-wl-full">{stock.name}</span>
        </div>
        <div className="tt-wl-right">
          <Sparkline history={stock.history} up={up} />
          <span className={`tt-wl-price tt-num ${pulse}`}>{stock.price.toFixed(2)}</span>
          <span className={`tt-wl-pct tt-num ${up ? "tt-up" : "tt-down"}`}>
            {up ? "+" : ""}{stock.changePct}%
          </span>
        </div>
      </div>
      {hover && (
        <div className="tt-wl-actions">
          <button className="tt-btn tt-btn-buy" onClick={() => openBuyWindow(stock.ticker)}>Buy</button>
          <button className="tt-btn tt-btn-sell" onClick={() => openSellWindow(stock.ticker)}>Sell</button>
          <button className="tt-btn tt-btn-ghost">Analytics</button>
        </div>
      )}
    </li>
  );
};

const WatchList = () => {
  const { quotes, prevPrices, loading } = useQuotes();
  const [query, setQuery] = useState("");

  const filtered = quotes.filter(
    (q) =>
      q.ticker.toLowerCase().includes(query.toLowerCase()) ||
      q.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="tt-scope tt-wl watchlist-container">
      <div className="tt-wl-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search eg: INFY, Reliance, TCS"
        />
        <span className="tt-wl-count">{filtered.length}/{quotes.length}</span>
      </div>
      {loading && quotes.length === 0 ? (
        <div className="tt-empty" style={{ padding: 16 }}>Connecting to the market…</div>
      ) : filtered.length === 0 ? (
        <div className="tt-empty" style={{ padding: 16 }}>No matches for "{query}".</div>
      ) : (
        <ul className="tt-wl-list">
          {filtered.map((stock) => (
            <WatchListItem key={stock.ticker} stock={stock} prevPrices={prevPrices} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default WatchList;
