import axios from "axios";

// ── Auth token ────────────────────────────────────────────────────────────
// We authenticate with a Bearer token (not just the session cookie) because the
// dashboard (vercel.app) and the API (onrender.com) are on different domains.
// That makes the session cookie a THIRD-PARTY cookie, which Safari and Firefox
// block by default — so cookie-only auth works in Chrome but 401s elsewhere.
// A token in localStorage + Authorization header isn't a cookie, so every
// browser sends it and auth works everywhere.
const TOKEN_KEY = "tt_token";

export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
};
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// The landing app logs the user in, then redirects here as
// `<dashboard>/?token=<jwt>`. Grab it once on load, persist it, and scrub it
// from the URL so it isn't left sitting in the address bar / history.
export const captureTokenFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      params.delete("token");
      const qs = params.toString();
      const clean =
        window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
      window.history.replaceState({}, document.title, clean);
    }
  } catch {
    /* non-browser / SSR guard */
  }
};

// One configured axios instance for the whole dashboard.
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true, // keep the cookie path too (Chrome / same-site / local)
});

// Attach the Bearer token (if we have one) to every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getQuotes = () => api.get("/quotes").then((r) => r.data);
export const getHoldings = () => api.get("/holdings").then((r) => r.data);
export const getSummary = () =>
  api.get("/portfolio/summary").then((r) => r.data);
export const getFunds = () => api.get("/funds").then((r) => r.data);
export const getTransactions = () =>
  api.get("/transactions").then((r) => r.data);
export const getMe = () => api.get("/me").then((r) => r.data);

export const placeOrder = (ticker, side, qty, price) =>
  api.post("/order", { ticker, side, qty, price }).then((r) => r.data);

export const demoLogin = () =>
  api.post("/demo/login").then((r) => {
    setToken(r.data.token); // demo also returns a token — persist it
    return r.data;
  });

export const sendChat = (question) =>
  api.post("/chat", { question }).then((r) => r.data);
export const logout = () =>
  api.get("/logout").then((r) => {
    clearToken(); // drop the token so a later visit starts clean
    return r.data;
  });
export const addFunds = (amount) =>
  api.post("/funds/add", { amount }).then((r) => r.data);

export default api;
