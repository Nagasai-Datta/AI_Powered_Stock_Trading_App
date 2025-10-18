import React from "react";
import { Link, Links } from "react-router-dom";
function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg bg-white border-bottom w-100"
      style={{
        backgroundColor: "white",
        width: "100%",
        borderBottom: "1px solid #dee2e6",
        padding: "0.5rem 2rem",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1030,
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <span
            style={{
              color: "hsl(215, 98%, 51%)",
              fontWeight: "900",
              fontSize: "1.8rem",
              letterSpacing: "1px",
            }}
          >
            TradeIT
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto ms-5 me-5 mb-2 mb-lg-0">
            <li className="nav-item mx-4">
              <Link className="nav-link active" to="/signup">
                Signup
              </Link>
            </li>
            <li className="nav-item mx-4">
              <Link className="nav-link active" aria-current="page" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item mx-4">
              <Link className="nav-link active" to="/product">
                Product
              </Link>
            </li>
            <li className="nav-item mx-4">
              <Link className="nav-link active" to="pricing">
                Pricing
              </Link>
            </li>

            <li className="nav-item mx-4">
              <Link className="nav-link active" to="support">
                Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
