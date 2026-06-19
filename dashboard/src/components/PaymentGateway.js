import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFunds } from "../api";

const PaymentGateway = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | processing | done

  const onCardNumber = (v) =>
    setCardNumber(
      v
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .slice(0, 19)
    );
  const onExpiry = (v) => {
    let d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length > 2) d = d.slice(0, 2) + "/" + d.slice(2);
    setExpiry(d);
  };
  const onCvv = (v) => setCvv(v.replace(/\D/g, "").slice(0, 3));

  const validate = () => {
    if (!(Number(amount) > 0)) return "Enter an amount greater than zero";
    if (!cardName.trim()) return "Enter the cardholder name";
    if (cardNumber.replace(/\s/g, "").length < 16)
      return "Enter a valid 16-digit card number";
    if (expiry.length < 5) return "Enter a valid expiry date";
    if (cvv.length < 3) return "Enter a valid CVV";
    return "";
  };

  const handlePay = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setStatus("processing");
    try {
      await addFunds(Number(amount));
      setStatus("done");
      setTimeout(() => navigate("/funds"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
      setStatus("idle");
    }
  };

  return (
    <div
      className="tt-scope tt-page"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <div className="tt-pay">
        <div className="tt-pay-head">
          <div className="tt-pay-logo">PaySecure</div>
          <p className="tt-muted" style={{ fontSize: 12, margin: 0 }}>
            Secure payment gateway
          </p>
        </div>

        <div className="tt-pay-amount">
          <p className="tt-muted" style={{ fontSize: 12, margin: "0 0 4px" }}>
            Amount to add
          </p>
          <div className="tt-pay-amount-row">
            <span className="tt-num" style={{ fontSize: 22 }}>
              {"\u20B9"}
            </span>
            <input
              className="tt-num"
              type="number"
              min="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <form onSubmit={handlePay}>
          <div className="tt-field" style={{ marginBottom: 14 }}>
            <label>Cardholder name</label>
            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Name on card"
            />
          </div>
          <div className="tt-field" style={{ marginBottom: 14 }}>
            <label>Card number</label>
            <input
              value={cardNumber}
              onChange={(e) => onCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
            />
          </div>
          <div className="tt-field-row">
            <div className="tt-field">
              <label>Expiry</label>
              <input
                value={expiry}
                onChange={(e) => onExpiry(e.target.value)}
                placeholder="MM/YY"
                inputMode="numeric"
              />
            </div>
            <div className="tt-field">
              <label>CVV</label>
              <input
                value={cvv}
                onChange={(e) => onCvv(e.target.value)}
                placeholder="123"
                inputMode="numeric"
              />
            </div>
          </div>

          {error && (
            <div className="tt-modal-err" style={{ padding: "8px 0 0" }}>
              {error}
            </div>
          )}
          {status === "done" && (
            <div style={{ color: "var(--tt-up)", fontSize: 13, paddingTop: 8 }}>
              Payment successful. Redirecting…
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button
              type="submit"
              className="tt-act-buy"
              style={{
                flex: 1,
                padding: 12,
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
              disabled={status !== "idle"}
            >
              {status === "processing"
                ? "Processing\u2026"
                : status === "done"
                ? "Done"
                : "Confirm payment"}
            </button>
            <button
              type="button"
              className="tt-act-cancel"
              style={{
                flex: 1,
                padding: 12,
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={() => navigate("/funds")}
            >
              Cancel
            </button>
          </div>
        </form>

        <p
          className="tt-muted"
          style={{ fontSize: 11, textAlign: "center", marginTop: 18 }}
        >
          Demo gateway — no real card is charged and nothing is stored.
        </p>
      </div>
    </div>
  );
};

export default PaymentGateway;
