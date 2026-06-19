import React from "react";
import Menu from "./Menu";
import { useTheme } from "../theme/ThemeProvider";
import { useQuotes } from "../hooks/useQuotes";

// A synthetic "index" derived from the live market so the header ticks too.
const useSyntheticIndex = () => {
  const { quotes } = useQuotes();
  if (!quotes.length) return { nifty: 0, sensex: 0, pct: 0 };
  const avgPct =
    quotes.reduce((a, q) => a + q.changePct, 0) / quotes.length;
  const nifty = 22000 * (1 + avgPct / 100);
  const sensex = 72500 * (1 + avgPct / 100);
  return { nifty, sensex, pct: avgPct };
};

const TopBar = () => {
  const { theme, toggle } = useTheme();
  const { nifty, sensex, pct } = useSyntheticIndex();
  const up = pct >= 0;

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points tt-num">{nifty.toFixed(2)}</p>
          <p className={`percent tt-num ${up ? "tt-up" : "tt-down"}`}>
            {up ? "+" : ""}{pct.toFixed(2)}%
          </p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points tt-num">{sensex.toFixed(2)}</p>
          <p className={`percent tt-num ${up ? "tt-up" : "tt-down"}`}>
            {up ? "+" : ""}{pct.toFixed(2)}%
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="tt-toggle"
          onClick={toggle}
          aria-label="Toggle dark and light theme"
          title="Toggle theme"
        >
          {theme === "dark" ? "\u2600" : "\u263D"}
        </button>
        <Menu />
      </div>
    </div>
  );
};

export default TopBar;
