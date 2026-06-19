import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./theme.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { ThemeProvider } from "./theme/ThemeProvider";
import { QuotesProvider } from "./hooks/useQuotes";
import { captureTokenFromUrl } from "./api";

// If the landing app redirected here with ?token=..., store it before any
// API call goes out, then strip it from the URL.
captureTokenFromUrl();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <QuotesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<Home />}></Route>
          </Routes>
        </BrowserRouter>
      </QuotesProvider>
    </ThemeProvider>
  </React.StrictMode>
);
