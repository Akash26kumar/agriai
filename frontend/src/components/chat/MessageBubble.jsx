"use client";

import ReactMarkdown from "react-markdown";
import { AlertCircle, Leaf, User } from "lucide-react";

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  if (isError) {
    return (
      <div className="flex items-start gap-3 px-4 py-2 ai-message-animate">
        <div
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 border"
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            borderColor: "rgba(239, 68, 68, 0.3)",
          }}
        >
          <AlertCircle size={14} className="text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="rounded-xl rounded-tl-sm px-4 py-3 max-w-2xl border"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              borderColor: "rgba(239, 68, 68, 0.25)",
            }}
          >
            <p className="text-sm text-rose-200">{message.content}</p>
          </div>
          <p className="text-[10px] mt-1 ml-1" style={{ color: "var(--text-muted)" }}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex items-start gap-3 px-4 py-2 flex-row-reverse">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 border border-emerald-500/25 bg-[#0a261c] text-slate-300 shadow-sm"
        >
          <User size={14} className="text-emerald-300" />
        </div>
        <div className="flex flex-col items-end flex-1 min-w-0">
          <div
            className="text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xl shadow-md border border-emerald-500/25"
            style={{
              background: "#08241b",
            }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-100">
              {message.content}
            </p>
            <span className="text-[10px] text-emerald-400/60 block text-right mt-1">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // AI assistant message with subtle fade-in + upward animation
  return (
    <div className="flex items-start gap-3 px-4 py-2 ai-message-animate">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-1 border border-emerald-400/30 bg-[#072419] shadow-[0_0_12px_rgba(34,197,94,0.25)]"
      >
        <Leaf size={16} className="text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl border border-emerald-500/18 shadow-lg relative"
          style={{
            background: "rgba(8, 26, 19, 0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="prose-dark max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-sm text-slate-200 leading-relaxed mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 pl-4 list-disc marker:text-emerald-400 text-slate-200">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal marker:text-emerald-400 text-slate-200">{children}</ol>,
                li: ({ children }) => <li className="text-sm text-slate-200 leading-relaxed mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-emerald-300">{children}</strong>,
                h2: ({ children }) => <h2 className="text-sm font-semibold text-emerald-400 mt-3 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-semibold text-emerald-400/90 mt-2 mb-1">{children}</h3>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock ? (
                    <pre className="bg-[#05130e] border border-emerald-950/60 rounded-lg p-3 my-2 text-xs overflow-x-auto text-emerald-300">
                      <code>{children}</code>
                    </pre>
                  ) : (
                    <code className="bg-[#05130e] text-emerald-300 border border-emerald-900/40 px-1 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-emerald-500 pl-3 italic text-slate-400 my-2 text-xs">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <span className="text-[10px] text-emerald-400/50 block text-right mt-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
