import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const API_URL_DASHBOARD = process.env.REACT_APP_DASHBOARD_URL;
    const data = await res.json();
    if (res.ok) {
      // Hand the auth token to the dashboard via the URL. It works across the
      // two different domains (vercel.app -> the dashboard's domain) where a
      // shared cookie can't, then the dashboard scrubs it from the URL.
      const sep = API_URL_DASHBOARD.includes("?") ? "&" : "?";
      window.location.href = data.token
        ? `${API_URL_DASHBOARD}${sep}token=${encodeURIComponent(data.token)}`
        : `${API_URL_DASHBOARD}`;
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Enter email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

        <p className="mt-3 text-center">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
