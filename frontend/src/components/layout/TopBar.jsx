"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";
import { Server } from "lucide-react";

export default function TopBar({ title, subtitle }) {
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await getHealth();
        if (mounted) setBackendStatus("online");
      } catch {
        if (mounted) setBackendStatus("offline");
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header
      className="h-16 flex items-center justify-between px-8 flex-shrink-0 backdrop-blur-md sticky top-0 z-20"
      style={{
        background: "rgba(4, 12, 9, 0.9)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left: Page Title & Subtitle */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold tracking-wide text-white truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Center: Smart India Hackathon in one row using the full top bar space */}
      <div className="flex-1 flex justify-center px-4">
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[#061c14] border border-emerald-500/25 shadow-[0_0_15px_rgba(34,197,94,0.1)] select-none">
          <svg viewBox="0 0 28 28" className="w-5 h-5 flex-shrink-0" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
            <path d="M 14 5 C 10 5 8 8 8 11 C 8 13 10 15 11 17 L 14 17 Z" fill="#22c55e" />
            <path d="M 14 5 C 18 5 20 8 20 11 C 20 13 18 15 17 17 L 14 17 Z" fill="#f97316" />
            <rect x="11.5" y="18" width="5" height="1.8" rx="0.5" fill="#e2e8f0" />
            <rect x="12.5" y="20.3" width="3" height="1.2" rx="0.5" fill="#94a3b8" />
            <line x1="5" y1="9" x2="2" y2="8" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="14" x2="2" y2="14" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="23" y1="9" x2="26" y2="8" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="23" y1="14" x2="26" y2="14" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-extrabold tracking-wider text-white uppercase whitespace-nowrap">
            Smart India Hackathon 2026
          </span>
          <span className="text-emerald-500/40 hidden sm:inline">|</span>
          <span className="text-xs text-emerald-300 font-medium tracking-wide whitespace-nowrap hidden sm:inline">
            Innovate for a Better Bharat
          </span>
        </div>
      </div>

      {/* Right: Live Backend Status & Theme toggle */}
      <div className="flex-1 flex items-center justify-end gap-3.5">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#071912] border border-emerald-500/15 shadow-sm">
          <Server size={13} style={{ color: "var(--text-muted)" }} />
          <span className="text-xs mr-0.5" style={{ color: "var(--text-secondary)" }}>
            Backend
          </span>
          {backendStatus === "checking" && (
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
              Checking
            </span>
          )}
          {backendStatus === "online" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
              Online
            </span>
          )}
          {backendStatus === "offline" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Offline
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
