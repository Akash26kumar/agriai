"use client";

import { Leaf } from "lucide-react";

export default function TypingIndicator({ label }) {
  return (
    <div className="flex items-start gap-3 px-4 py-2 ai-message-animate">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-1 border border-emerald-400/30 bg-[#072419] shadow-[0_0_12px_rgba(34,197,94,0.25)]"
      >
        <Leaf size={16} className="text-emerald-400" />
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-5 py-3 border border-emerald-500/18 shadow-lg"
        style={{
          background: "rgba(8, 26, 19, 0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full dot-1" style={{ background: "#4ade80" }} />
            <span className="w-2 h-2 rounded-full dot-2" style={{ background: "#4ade80" }} />
            <span className="w-2 h-2 rounded-full dot-3" style={{ background: "#4ade80" }} />
          </div>
          <span className="text-xs tracking-wide font-medium" style={{ color: "var(--text-secondary)" }}>
            {label || "Analyzing..."}
          </span>
        </div>
      </div>
    </div>
  );
}
