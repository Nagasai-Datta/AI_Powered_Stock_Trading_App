import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getSummary, getHoldings } from "../api";
import { useQuotes } from "../hooks/useQuotes";

const SECTOR_COLORS = {
  IT: "#4c8dff",
  Banking: "#2bd67b",
  Energy: "#f5a623",
  FMCG: "#b07bff",
  Auto: "#ff7ab2",
  Pharma: "#42cdd6",
  Metals: "#ff5c5c",
  Other: "#8b98a5",
};

const inr = (n) =>
  "\u20B9" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const Summary = () => {
  const { bySymbol, loading: quotesLoading } = useQuotes();
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [s, h] = await Promise.all([getSummary(), getHoldings()]);
        if (!alive) return;
        setSummary(s);
        setHoldings(h);
        setError(false);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoaded(true);
      }
    };
    load();
    const timer = setInterval(load, 6000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const liveValue = useMemo(() => {
    let v = 0;
    for (const h of holdings) {
      const q = bySymbol[h.ticker];
      v += (q ? q.price : h.price) * h.qty;
    }
    return v;
  }, [holdings, bySymbol]);

  const equityCurve = useMemo(() => {
    if (!holdings.length) return [];
    const series = holdings
      .map((h) => ({ qty: h.qty, hist: bySymbol[h.ticker]?.history || [] }))
      .filter((s) => s.hist.length);
    if (!series.length) return [];
    const len = Math.min(...series.map((s) => s.hist.length));
    const cash = summary?.cash || 0;
    const points = [];
    for (let k = 0; k < len; k++) {
      let v = cash;
      for (const s of series) v += s.qty * s.hist[s.hist.length - len + k];
      points.push({ i: k, value: Math.round(v) });
    }
    return points;
  }, [holdings, bySymbol, summary]);

  if (loaded && error) {
    return (
      <div className="tt-scope tt-empty">
        Couldn't load your portfolio. Check you're signed in, then refresh.
      </div>
    );
  }

  if (!loaded || (quotesLoading && !summary)) {
    return (
      <div className="tt-scope tt-cc">
        <div className="tt-skeleton" style={{ height: 60, width: 280, marginBottom: 24 }} />
        <div className="tt-skeleton" style={{ height: 280, borderRadius: 12 }} />
      </div>
    );
  }

  const cash = summary?.cash || 0;
  const invested = summary?.invested || 0;
  const netWorth = liveValue + cash;
  const pnl = liveValue - invested;
  const dayUp = (summary?.pnl ?? 0) >= 0;
  const conc = summary?.concentration;
  const isEmpty = holdings.length === 0;

  return (
    <div className="tt-scope tt-cc">
      <div className="tt-cc-head">
        <div>
          <p className="tt-eyebrow">Net worth</p>
          <h1 className="tt-networth tt-num">{inr(netWorth)}</h1>
          <div className="tt-daypnl">
            <span
              className={`tt-chip tt-num ${pnl >= 0 ? "tt-up" : "tt-down"}`}
              style={{ background: pnl >= 0 ? "var(--tt-up-soft)" : "var(--tt-down-soft)" }}
            >
              {pnl >= 0 ? "\u25B2" : "\u25BC"} {inr(Math.abs(pnl))} (
              {invested ? ((pnl / invested) * 100).toFixed(2) : "0.00"}%)
            </span>
            <span className="tt-muted">total P&amp;L</span>
          </div>
        </div>
        <span className="tt-live">
          <span className="tt-live-dot" /> Live {"\u00B7"} updates every 3s
        </span>
      </div>

      {conc?.warning && (
        <div className="tt-warn">
          <span>{"\u26A0"}</span>
          <span>
            <b>Concentration risk.</b> {conc.ticker} is {conc.pct}% of your portfolio.
            A single stock above 25% means your returns lean heavily on one name.
          </span>
        </div>
      )}

      <div className="tt-stats">
        <div className="tt-stat"><p className="tt-stat-label">Current value</p><p className="tt-stat-value tt-num">{inr(liveValue)}</p></div>
        <div className="tt-stat"><p className="tt-stat-label">Invested</p><p className="tt-stat-value tt-num">{inr(invested)}</p></div>
        <div className="tt-stat"><p className="tt-stat-label">Available cash</p><p className="tt-stat-value tt-num">{inr(cash)}</p></div>
        <div className="tt-stat"><p className="tt-stat-label">Holdings</p><p className="tt-stat-value tt-num">{summary?.positionCount ?? holdings.length}</p></div>
      </div>

      {isEmpty ? (
        <div className="tt-card">
          <p className="tt-card-title">Your portfolio</p>
          <p className="tt-muted" style={{ fontSize: 14 }}>
            No holdings yet. Open the watchlist on the left and buy your first stock — it'll show up here instantly.
          </p>
        </div>
      ) : (
        <div className="tt-grid">
          <div className="tt-card">
            <p className="tt-card-title">Portfolio value {"\u00B7"} intraday</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={equityCurve} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="ttEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={dayUp ? "#2bd67b" : "#ff5c5c"} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={dayUp ? "#2bd67b" : "#ff5c5c"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={["dataMin", "dataMax"]} hide />
                <Tooltip
                  contentStyle={{ background: "var(--tt-surface-2)", border: "1px solid var(--tt-border)", borderRadius: 8, color: "var(--tt-text)" }}
                  labelFormatter={() => ""}
                  formatter={(v) => [inr(v), "Value"]}
                />
                <Area type="monotone" dataKey="value" stroke={dayUp ? "#2bd67b" : "#ff5c5c"} strokeWidth={2} fill="url(#ttEquity)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="tt-card" style={{ marginBottom: 16 }}>
              <p className="tt-card-title">Allocation by sector</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ResponsiveContainer width={96} height={96}>
                  <PieChart>
                    <Pie data={summary?.allocation || []} dataKey="value" nameKey="sector" innerRadius={28} outerRadius={46} stroke="none">
                      {(summary?.allocation || []).map((a) => (
                        <Cell key={a.sector} fill={SECTOR_COLORS[a.sector] || SECTOR_COLORS.Other} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {(summary?.allocation || []).slice(0, 5).map((a) => (
                    <div key={a.sector} className="tt-alloc-row">
                      <span><span className="tt-alloc-dot" style={{ background: SECTOR_COLORS[a.sector] || SECTOR_COLORS.Other }} />{a.sector}</span>
                      <span className="tt-num tt-muted">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="tt-card">
              <p className="tt-card-title">Top movers</p>
              {(summary?.topGainers || []).slice(0, 3).map((m) => (
                <div key={m.ticker} className="tt-mover">
                  <span className="tt-mover-tkr">{m.ticker}</span>
                  <span className={`tt-num ${m.pnlPct >= 0 ? "tt-up" : "tt-down"}`}>
                    {m.pnlPct >= 0 ? "+" : ""}{m.pnlPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
