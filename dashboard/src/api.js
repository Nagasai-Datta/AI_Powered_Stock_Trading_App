import axios from "axios";

// One configured axios instance for the whole dashboard.
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true, // send the session cookie so the backend knows the user
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

export const demoLogin = () => api.post("/demo/login").then((r) => r.data);

export default api;

export const sendChat = (question) =>
  api.post("/chat", { question }).then((r) => r.data);
export const logout = () => api.get("/logout").then((r) => r.data);
export const addFunds = (amount) =>
  api.post("/funds/add", { amount }).then((r) => r.data);
