"use client";

import { useEffect, useRef } from "react";
import {
  Trash2,
  Zap,
  Database,
  Sprout,
  Leaf,
  BarChart2,
  Warehouse,
  ShoppingCart,
} from "lucide-react";
import { useAgriSocket } from "@/hooks/useAgriSocket";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

const SUGGESTIONS = [
  {
    title: "Crop Recommendation",
    query: "Recommend a crop for soil with N=90, P=42, K=43, pH=6.5",
    icon: Sprout,
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.15)",
  },
  {
    title: "Crop Advisory",
    query: "What crops should I grow in Haryana this Rabi season?",
    icon: Leaf,
    color: "#4ade80",
    bg: "rgba(74, 222, 128, 0.15)",
  },
  {
    title: "Market Prices",
    query: "What is the current mandi price for wheat in Punjab?",
    icon: BarChart2,
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.15)",
  },
  {
    title: "Storage Finder",
    query: "Find cold storage near Karnal for potatoes",
    icon: Warehouse,
    color: "#a78bfa",
    bg: "rgba(167, 139, 250, 0.15)",
  },
  {
    title: "Buyers Directory",
    query: "Find buyers for 5 tonnes of mustard",
    icon: ShoppingCart,
    color: "#fb923c",
    bg: "rgba(251, 146, 60, 0.15)",
  },
];

export default function ChatInterface() {
  const { isConnected, agentStatus, messages, error, isThinking, sendMessage, clearChat } =
    useAgriSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden bg-transparent"
    >
      {/* Top-right foliage artwork & 'Healthy Farms Stronger Bharat' annotation */}
      <div className="absolute top-2 right-4 pointer-events-none select-none z-0 hidden md:block opacity-85">
        <div className="relative w-80 h-48">
          <svg viewBox="0 0 320 190" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="furrowGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#040a08" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="leafGradTop1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#15803d" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#052e16" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="leafGradTop2" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#166534" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#040a08" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Furrow lines */}
            <path d="M 120 170 Q 220 130 320 110" stroke="url(#furrowGrad)" strokeWidth="1.5" fill="none" />
            <path d="M 150 185 Q 240 145 320 130" stroke="url(#furrowGrad)" strokeWidth="1.2" fill="none" opacity="0.7" />
            <path d="M 100 150 Q 200 110 320 90" stroke="url(#furrowGrad)" strokeWidth="1.2" fill="none" opacity="0.6" />
            {/* Foliage leaves */}
            <path d="M 175 65 C 205 15 265 0 290 18 C 305 48 255 95 195 85 Z" fill="url(#leafGradTop1)" />
            <path d="M 175 65 Q 245 35 290 18" stroke="#86efac" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 205 105 C 235 55 295 40 315 60 C 325 90 280 140 225 130 Z" fill="url(#leafGradTop2)" />
            <path d="M 205 105 Q 270 75 315 60" stroke="#86efac" strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M 165 115 C 180 80 215 65 230 80 C 235 100 205 130 175 125 Z" fill="url(#leafGradTop1)" opacity="0.8" />
          </svg>
          <div className="absolute top-6 right-2 font-handwriting text-[#d2c2a8] text-xl leading-tight -rotate-6 select-none opacity-90 text-right drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <p>Healthy Farms</p>
            <p className="mr-1">Stronger Bharat</p>
            <svg className="w-28 h-4 mt-0.5 ml-auto text-[#d2c2a8]" viewBox="0 0 110 15" fill="none">
              <path d="M 5 5 Q 55 12 105 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chat header */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0 relative z-10"
        style={{
          background: "rgba(4, 12, 9, 0.7)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all duration-150"
            style={{
              background: isConnected ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
              borderColor: isConnected ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
              color: isConnected ? "#4ade80" : "#f87171",
            }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400 status-pulse" : "bg-rose-400"}`}
            />
            {isConnected ? "AI Connected" : "Reconnecting..."}
          </span>

          {isConnected && agentStatus.stage !== "idle" && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
              style={{
                background:
                  agentStatus.stage === "executing_tools"
                    ? "rgba(34, 197, 94, 0.12)"
                    : "rgba(234, 179, 8, 0.1)",
                borderColor:
                  agentStatus.stage === "executing_tools"
                    ? "rgba(34, 197, 94, 0.3)"
                    : "rgba(234, 179, 8, 0.3)",
                color: agentStatus.stage === "executing_tools" ? "var(--accent-cyan)" : "#facc15",
              }}
            >
              {agentStatus.stage === "executing_tools" ? <Database size={11} /> : <Zap size={11} />}
              {agentStatus.label}
            </span>
          )}
        </div>

        <button
          onClick={clearChat}
          disabled={!isConnected || messages.length === 0}
          className="flex items-center gap-1.5 text-xs transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            if (isConnected && messages.length > 0) e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mx-6 mt-3 rounded-xl px-4 py-2.5 text-sm border"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.25)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 relative z-10">
        {messages.length === 0 && !isThinking && (
          <div className="flex flex-col justify-start max-w-4xl pt-2 pb-6">
            {/* Big Greeting matching reference image */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                Hello! I&apos;m <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]">AgriAI</span>
              </h1>
              <p className="text-sm sm:text-base text-[#92aea1] leading-relaxed max-w-2xl">
                Ask me anything about crops, weather, market prices, storage, buyers, or produce aggregation.
              </p>
            </div>

            {/* Quick Action Suggestion Cards matching reference image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.query}
                    onClick={() => sendMessage(s.query)}
                    disabled={!isConnected}
                    className="flex items-start gap-3 p-3.5 rounded-2xl text-left border transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    style={{
                      background: "rgba(7, 24, 18, 0.75)",
                      borderColor: "rgba(74, 222, 128, 0.18)",
                      backdropFilter: "blur(10px)",
                    }}
                    onMouseEnter={(e) => {
                      if (isConnected) {
                        e.currentTarget.style.borderColor = "rgba(74, 222, 128, 0.45)";
                        e.currentTarget.style.background = "rgba(11, 33, 25, 0.85)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(74, 222, 128, 0.18)";
                      e.currentTarget.style.background = "rgba(7, 24, 18, 0.75)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5"
                      style={{ background: s.bg }}
                    >
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-[#809c8e] line-clamp-2 mt-0.5 leading-snug">
                        {s.query}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isThinking && <TypingIndicator label={agentStatus.label} />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={!isConnected || isThinking} />
    </div>
  );
}
