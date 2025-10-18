// components/StockChatbot.js
import React, { useState } from "react";
import axios from "axios";
import "./StockChatbot.css";
const API_URL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // if you need session cookies
export default function StockChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // for typing indicator

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Fetch holdings and watchlist
      const [holdingsRes, watchlistRes] = await Promise.all([
        axios.get("/allHoldings"),
        axios.get("/allWatchLists"),
      ]);

      const payload = {
        question: input,
        holdings: holdingsRes.data,
        watchlist: watchlistRes.data,
      };

      // Send to your AI endpoint
      const res = await axios.post("/chat", payload);

      setMessages((prev) => [...prev, { from: "bot", text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Oops! Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chatbot-icon" onClick={toggleChat}>
        💬
      </div>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            Stock AI Assistant
            <button className="close-btn" onClick={toggleChat}>
              ✖
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-message ${
                  msg.from === "user" ? "user" : "bot"
                }`}
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\n/g, "<br>"),
                }}
              />
            ))}

            {loading && (
              <div className="chatbot-message bot">
                <em>Typing...</em>
              </div>
            )}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me about your stocks..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
