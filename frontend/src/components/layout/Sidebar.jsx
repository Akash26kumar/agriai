"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Warehouse,
  ShoppingCart,
  BarChart2,
  Leaf,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "#34d399" },
  { label: "AI Chat", href: "/chat", icon: MessageSquare, color: "#4ade80" },
  { divider: true, label: "Tools" },
  { label: "Crop Advisor", href: "/tools/crop", icon: Sprout, color: "#22c55e" },
  { label: "Yield Prediction", href: "/tools/yield", icon: TrendingUp, color: "#2dd4bf" },
  { label: "Market Prices", href: "/tools/market", icon: BarChart2, color: "#10b981" },
  { label: "Storage Finder", href: "/tools/storage", icon: Warehouse, color: "#a78bfa" },
  { label: "Buyers Directory", href: "/tools/buyers", icon: ShoppingCart, color: "#fb923c" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col w-60 h-screen fixed top-0 left-0 z-30 select-none"
      style={{
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.3)] border border-emerald-400/30"
          style={{ background: "linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(7, 24, 18, 0.9))" }}
        >
          <Leaf size={20} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
        </div>
        <div>
          <p className="font-extrabold text-base leading-tight tracking-tight text-white">
            Agri<span className="text-emerald-400">AI</span>
          </p>
          <p className="text-[11px] leading-tight" style={{ color: "var(--text-muted)" }}>
            Agricultural Assistant
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.divider) {
            return (
              <div key={i} className="mt-4 mb-1.5 px-3">
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.label}
                </p>
              </div>
            );
          }
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-150"
              style={{
                background: active
                  ? "linear-gradient(90deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))"
                  : "transparent",
                color: active ? "#ffffff" : "var(--text-secondary)",
                border: active ? "1px solid rgba(74, 222, 128, 0.25)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(34, 197, 94, 0.06)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
              )}
              <Icon
                size={17}
                style={{ color: item.color }}
                className={active ? "drop-shadow-[0_0_6px_rgba(74,222,128,0.4)]" : ""}
              />
              <span className="tracking-wide text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sprout Illustration & Footer */}
      <div
        className="px-4 pt-2 pb-3 flex-shrink-0 relative overflow-hidden"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {/* Handwritten text matching reference */}
        <div className="font-handwriting text-[#d2c2a8] text-sm leading-tight -rotate-3 select-none opacity-85 px-1 mb-1">
          <p>Empowering</p>
          <p className="ml-2">Farmers</p>
          <p className="ml-3">Empowering India</p>
        </div>

        {/* Plant sprout in soil SVG */}
        <div className="h-16 w-full flex items-end justify-center mb-1">
          <svg viewBox="0 0 160 65" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="leafGrad2" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>
              <radialGradient id="soilGrad" cx="50%" cy="80%" r="50%">
                <stop offset="0%" stopColor="#2c1e15" />
                <stop offset="70%" stopColor="#150f0a" />
                <stop offset="100%" stopColor="#040c09" />
              </radialGradient>
            </defs>
            {/* Soil mound */}
            <path d="M 0 65 Q 80 32 160 65 Z" fill="url(#soilGrad)" opacity="0.95" />
            <circle cx="72" cy="50" r="1.4" fill="#5a422e" />
            <circle cx="86" cy="46" r="1.2" fill="#6b5037" />
            <circle cx="98" cy="52" r="1.6" fill="#3a281b" />
            {/* Stem */}
            <path d="M 80 50 Q 81 30 78 15" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Left Leaf */}
            <path d="M 78 28 C 58 24 48 8 66 6 C 78 10 80 22 78 28 Z" fill="url(#leafGrad1)" />
            <path d="M 78 28 Q 66 16 66 6" stroke="#86efac" strokeWidth="0.7" fill="none" opacity="0.6" />
            {/* Right Leaf */}
            <path d="M 79 22 C 100 18 108 4 90 2 C 79 5 78 17 79 22 Z" fill="url(#leafGrad2)" />
            <path d="M 79 22 Q 90 11 90 2" stroke="#86efac" strokeWidth="0.7" fill="none" opacity="0.6" />
          </svg>
        </div>

        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          SIH Prototype · 2026
        </p>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Agricultural AI Platform
        </p>
      </div>
    </aside>
  );
}
