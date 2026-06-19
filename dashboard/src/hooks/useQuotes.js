import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { getQuotes } from "../api";

// Polls the market once for the whole app and shares the result, so the
// TopBar, Summary, and WatchList don't each hammer the server separately.
const QuotesContext = createContext({
  quotes: [],
  bySymbol: {},
  prevPrices: {},
  loading: true,
  error: null,
});

const POLL_MS = 3000;

export const QuotesProvider = ({ children }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevRef = useRef({}); // ticker -> last price (for pulse direction)
  const [prevPrices, setPrevPrices] = useState({});

  useEffect(() => {
    let alive = true;
    let timer;

    const poll = async () => {
      try {
        const data = await getQuotes();
        if (!alive) return;
        const snapshot = {};
        for (const q of data) snapshot[q.ticker] = q.price;
        setPrevPrices(prevRef.current);
        prevRef.current = snapshot;
        setQuotes(data);
        setError(null);
      } catch (err) {
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    poll();
    timer = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const bySymbol = {};
  for (const q of quotes) bySymbol[q.ticker] = q;

  return (
    <QuotesContext.Provider value={{ quotes, bySymbol, prevPrices, loading, error }}>
      {children}
    </QuotesContext.Provider>
  );
};

export const useQuotes = () => useContext(QuotesContext);

// Helper: classname for a price cell based on movement since last tick.
export const pulseClass = (ticker, price, prevPrices) => {
  const prev = prevPrices[ticker];
  if (prev == null || prev === price) return "";
  return price > prev ? "tt-pulse-up" : "tt-pulse-down";
};
