"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { getHealth, getAllCrops } from "@/lib/api";
import {
  MessageSquare,
  Sprout,
  TrendingUp,
  BarChart2,
  Warehouse,
  ShoppingCart,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Leaf,
} from "lucide-react";

const features = [
  {
    title: "AI Chat Assistant",
    description:
      "Ask questions in plain language. The AI uses real tools — weather, mandi prices, crop models, storage, buyers.",
    href: "/chat",
    icon: MessageSquare,
    accent: "#38bdf8",
    bgAccent: "rgba(56, 189, 248, 0.1)",
    cta: "Start chatting",
  },
  {
    title: "Crop Advisor",
    description:
      "Enter your soil NPK values, pH, temperature and rainfall. Get ML-powered crop recommendations.",
    href: "/tools/crop",
    icon: Sprout,
    accent: "#34d399",
    bgAccent: "rgba(52, 211, 153, 0.1)",
    cta: "Get recommendation",
  },
  {
    title: "Yield Predictor",
    description:
      "Estimate your harvest yield range for any crop and farm area based on season and climate.",
    href: "/tools/yield",
    icon: TrendingUp,
    accent: "#2dd4bf",
    bgAccent: "rgba(45, 212, 191, 0.1)",
    cta: "Predict yield",
  },
  {
    title: "Mandi Prices",
    description:
      "Search live APMC mandi prices by commodity, state, and market to find the best time to sell.",
    href: "/tools/market",
    icon: BarChart2,
    accent: "#60a5fa",
    bgAccent: "rgba(96, 165, 250, 0.1)",
    cta: "Check prices",
  },
  {
    title: "Storage Finder",
    description:
      "Find warehouses, cold storages, and grain silos near you. View capacity, rates, and book space.",
    href: "/tools/storage",
    icon: Warehouse,
    accent: "#a78bfa",
    bgAccent: "rgba(167, 139, 250, 0.1)",
    cta: "Find storage",
  },
  {
    title: "Buyers Directory",
    description:
      "Connect with verified food processors, flour mills, FPOs, and institutional buyers directly.",
    href: "/tools/buyers",
    icon: ShoppingCart,
    accent: "#fb923c",
    bgAccent: "rgba(251, 146, 60, 0.1)",
    cta: "Browse buyers",
  },
];

export default function DashboardPage() {
  const [health, setHealth] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const h = await getHealth();
      setHealth(h);
    } catch {
      setHealth(null);
    }
    try {
      const c = await getAllCrops();
      setCrops(c.crops || []);
    } catch {
      setCrops([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadInitialStatus() {
      try {
        const [h, c] = await Promise.allSettled([getHealth(), getAllCrops()]);
        if (!cancelled) {
          setHealth(h.status === "fulfilled" ? h.value : null);
          setCrops(c.status === "fulfilled" && c.value ? c.value.crops || [] : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setHealth(null);
          setCrops([]);
          setLoading(false);
        }
      }
    }
    loadInitialStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopBar title="Dashboard" subtitle="Agricultural Intelligence Platform" />

      <div className="flex-1 p-6 space-y-6 max-w-5xl">
        {/* Hero */}
        <div
          className="rounded-3xl p-7 shadow-lg border relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(8, 28, 20, 0.9), rgba(4, 14, 10, 0.95))",
            borderColor: "rgba(74, 222, 128, 0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.3)] border border-emerald-400/30"
              style={{ background: "#07251a" }}
            >
              <Leaf className="text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold mb-1 tracking-tight text-white">
                Agricultural AI Platform
              </h2>
              <p
                className="text-sm leading-relaxed max-w-2xl"
                style={{ color: "var(--text-secondary)" }}
              >
                An end-to-end intelligence system for Indian farmers. The AI agent uses live weather,
                real mandi data, ML crop models, and verified buyer and storage databases to guide your
                complete farming cycle — from <strong className="text-emerald-300">planning</strong> through{" "}
                <strong className="text-emerald-300">storage</strong> and{" "}
                <strong className="text-emerald-300">selling</strong>.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 mt-5 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-150 shadow-[0_0_15px_rgba(34,197,94,0.35)] bg-emerald-500 hover:bg-emerald-400"
              >
                <MessageSquare size={15} />
                Open AI Chat
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Status card */}
        <div
          className="rounded-3xl p-6 shadow-sm border"
          style={{
            background: "rgba(7, 24, 18, 0.75)",
            borderColor: "rgba(74, 222, 128, 0.16)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              System Status
            </h3>
            <button
              onClick={fetchStatus}
              className="transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Backend API", ok: !!health },
              {
                label: "Socket.IO",
                ok:
                  !!health?.services?.socket === true ||
                  health?.services?.socket === "online",
              },
              { label: "Gemini Agent", ok: health?.services?.geminiAgent === "ready" },
              { label: "Crop Models", ok: crops.length > 0 },
            ].map(({ label, ok }) => (
              <div
                key={label}
                className="rounded-xl px-3 py-2.5 flex items-center gap-2 border"
                style={{
                  background: ok ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  borderColor: ok ? "rgba(34, 197, 94, 0.25)" : "var(--border)",
                }}
              >
                {ok ? (
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 status-pulse" />
                ) : (
                  <XCircle size={14} className="text-slate-600 flex-shrink-0" />
                )}
                <span
                  className="text-xs font-medium"
                  style={{ color: ok ? "#4ade80" : "var(--text-muted)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          {health && (
            <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
              {health.services?.toolsCount || 9} AI tools available · Last checked{" "}
              {new Date(health.timestamp).toLocaleTimeString("en-IN")}
            </p>
          )}
          {!health && !loading && (
            <p className="text-xs text-rose-400 mt-2">
              ⚠ Backend not reachable. Run:{" "}
              <code
                className="px-1 py-0.5 rounded text-xs"
                style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}
              >
                cd backend && npm start
              </code>
            </p>
          )}
        </div>

        {/* Feature grid */}
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className="rounded-2xl p-5 transition-all duration-150 group shadow-sm border"
                  style={{
                    background: "rgba(7, 24, 18, 0.75)",
                    borderColor: "rgba(74, 222, 128, 0.16)",
                    backdropFilter: "blur(8px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(74, 222, 128, 0.45)";
                    e.currentTarget.style.background = "rgba(11, 33, 25, 0.85)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(74, 222, 128, 0.16)";
                    e.currentTarget.style.background = "rgba(7, 24, 18, 0.75)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 border border-white/5 shadow-sm"
                    style={{
                      background: f.bgAccent,
                    }}
                  >
                    <Icon size={18} style={{ color: f.accent }} />
                  </div>
                  <h4
                    className="text-sm font-semibold mb-1 group-hover:text-emerald-300 transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {f.title}
                  </h4>
                  <p
                    className="text-xs leading-relaxed mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {f.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all"
                    style={{ color: "var(--accent-cyan)" }}
                  >
                    {f.cta} <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Supported crops */}
        {crops.length > 0 && (
          <div
            className="rounded-2xl p-5 shadow-sm border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Supported Crops ({crops.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {crops.map((crop) => (
                <span
                  key={crop}
                  className="text-xs px-3 py-1 rounded-full capitalize border"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {crop}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
