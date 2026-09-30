"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MapPin, Mic } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, location.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="px-6 py-3.5 backdrop-blur-md relative z-10"
      style={{
        background: "rgba(4, 12, 9, 0.88)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {showLocation && (
        <div className="mb-2.5 flex items-center gap-2 max-w-4xl mx-auto">
          <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Your farm location (e.g. Karnal, Haryana)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 text-xs rounded-xl px-3 py-1.5 focus:outline-none transition-all duration-150 border border-emerald-500/30 text-slate-100 placeholder:text-slate-500"
            style={{
              background: "#061812",
            }}
          />
        </div>
      )}
      <div className="flex items-center gap-2.5 max-w-4xl mx-auto">
        <button
          onClick={() => setShowLocation((v) => !v)}
          title="Set location context"
          className="flex-shrink-0 w-10 h-10 rounded-xl transition-all duration-150 border border-emerald-500/20 bg-[#061812] flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 shadow-sm"
          style={{
            borderColor: showLocation || location ? "rgba(74, 222, 128, 0.4)" : "rgba(74, 222, 128, 0.15)",
            color: showLocation || location ? "#4ade80" : "#809c8e",
          }}
        >
          <MapPin size={17} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask me about crops, weather, market prices, storage, buyers…"
          className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all duration-150 border disabled:opacity-50 text-slate-100 placeholder:text-slate-500"
          style={{
            minHeight: "42px",
            maxHeight: "120px",
            background: "#05140f",
            borderColor: "rgba(74, 222, 128, 0.22)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#22c55e";
            e.target.style.boxShadow = "0 0 12px rgba(34, 197, 94, 0.25)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(74, 222, 128, 0.22)";
            e.target.style.boxShadow = "none";
          }}
        />

        {/* Emerald send button matching reference */}
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.35)]"
        >
          {disabled ? (
            <Loader2 size={16} className="animate-spin text-white" />
          ) : (
            <Send size={16} />
          )}
        </button>

        {/* Mic button matching reference */}
        <button
          type="button"
          onClick={() => {
            if (textareaRef.current) textareaRef.current.focus();
          }}
          title="Voice input"
          className="flex-shrink-0 w-10 h-10 rounded-full border border-emerald-500/20 bg-[#061812] flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 shadow-sm transition-all"
        >
          <Mic size={16} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] mt-2 max-w-4xl mx-auto px-1 gap-1" style={{ color: "var(--text-muted)" }}>
        <p className="text-center sm:text-left">
          This is an AI-powered assistant. Please verify important information with local agricultural experts.
        </p>
        <p className="text-[10px] text-slate-500 text-right flex-shrink-0">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
