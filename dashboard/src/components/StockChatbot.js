import React, { useState, useRef, useEffect } from "react";
import { sendChat } from "../api";

const SUGGESTIONS = [
  "What should I trim?",
  "Which holding is riskiest?",
  "How is my portfolio doing?",
  "Am I too concentrated?",
];

// Safe renderer: turns plain text + simple markdown (**bold**, "- " bullets,
// line breaks) into React elements. Never uses innerHTML, so no XSS surface.
function renderMessage(text) {
  return text.split("\n").map((line, i) => {
    const isBullet = /^\s*[-*]\s+/.test(line);
    const content = line.replace(/^\s*[-*]\s+/, "");
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((p, j) => {
      if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={j}>{p.slice(2, -2)}</strong>;
      return <React.Fragment key={j}>{p}</React.Fragment>;
    });
    return (
      <div key={i} style={{ paddingLeft: isBullet ? 14 : 0 }}>
        {isBullet ? "\u2022 " : ""}{parts}
      </div>
    );
  });
}

export default function StockChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  const ask = async (question) => {
    const q = (question ?? input).trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChat(q);
      setMessages((m) => [...m, { from: "bot", text: res.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "I couldn't reach the analysis service. Make sure you're signed in and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="tt-chat-fab" onClick={() => setIsOpen(true)} aria-label="Open AI assistant">
        {"\uD83D\uDCAC"}
      </button>
    );
  }

  return (
    <div className="tt-scope tt-chat-panel">
      <div className="tt-chat-head">
        <span>AI portfolio assistant</span>
        <button onClick={() => setIsOpen(false)} aria-label="Close">{"\u2715"}</button>
      </div>

      <div className="tt-chat-body" ref={bodyRef}>
        {messages.length === 0 && (
          <div className="tt-msg tt-msg-bot">
            Ask me about your holdings — what looks strong, weak, or concentrated. I read your live portfolio to answer.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`tt-msg ${m.from === "user" ? "tt-msg-user" : "tt-msg-bot"}`}>
            {m.from === "bot" ? renderMessage(m.text) : m.text}
          </div>
        ))}
        {loading && <div className="tt-msg tt-msg-bot tt-muted"><em>Analysing…</em></div>}
      </div>

      {messages.length === 0 && (
        <div className="tt-chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="tt-chip-suggest" onClick={() => ask(s)}>{s}</button>
          ))}
        </div>
      )}

      <p className="tt-disclaimer">Analysis to consider, not financial advice.</p>

      <div className="tt-chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask about your portfolio…"
        />
        <button onClick={() => ask()}>Send</button>
      </div>
    </div>
  );
}
