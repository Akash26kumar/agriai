"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { findStorage } from "@/lib/api";
import { Warehouse, Loader2, Search, Thermometer, Package, Phone } from "lucide-react";

const TYPE_STYLES = {
  "Cold Storage": { bg: "rgba(56, 189, 248, 0.1)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.25)" },
  "Dry Warehouse": { bg: "rgba(251, 191, 36, 0.1)", text: "#fbbf24", border: "rgba(251, 191, 36, 0.25)" },
  "Steel Grain Silo": { bg: "rgba(148, 163, 184, 0.1)", text: "#94a3b8", border: "rgba(148, 163, 184, 0.25)" },
  "Multi-Commodity Cold Storage": { bg: "rgba(45, 212, 191, 0.1)", text: "#2dd4bf", border: "rgba(45, 212, 191, 0.25)" },
  "Cold Storage & Distribution": { bg: "rgba(167, 139, 250, 0.1)", text: "#a78bfa", border: "rgba(167, 139, 250, 0.25)" },
};

export default function StoragePage() {
  const [form, setForm] = useState({ location: "", crop: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);
    try {
      const data = await findStorage(form.location, form.crop);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const facilities = result?.facilities || [];

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopBar title="Storage Finder" subtitle="Warehouses, cold storages & grain silos" />
      <div className="flex-1 p-6 max-w-5xl space-y-5">
        {/* Search */}
        <div
          className="rounded-2xl p-5 shadow-sm border"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                background: "rgba(167, 139, 250, 0.1)",
                borderColor: "rgba(167, 139, 250, 0.2)",
              }}
            >
              <Warehouse size={16} className="text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Find Storage Facilities
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Location / State / City
              </label>
              <input
                type="text"
                placeholder="e.g. Karnal, Haryana"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 border"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Crop to Store (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. potato, wheat"
                value={form.crop}
                onChange={(e) => set("crop", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 border"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2 rounded-xl transition-all duration-150 shadow-sm disabled:opacity-50"
              style={{ background: "var(--accent-blue)" }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "var(--accent-blue-h)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent-blue)";
              }}
            >
              {loading ? <Loader2 size={14} className="animate-spin text-white" /> : <Search size={14} />}
              Search
            </button>
          </form>
        </div>

        {error && (
          <p
            className="text-sm rounded-xl px-4 py-3 border"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.25)",
              color: "#fca5a5",
            }}
          >
            {error}
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-violet-400" />
          </div>
        )}

        {/* Results */}
        {facilities.length > 0 && (
          <div className="space-y-3 ai-message-animate">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {facilities.length} facilit{facilities.length !== 1 ? "ies" : "y"} found
            </p>
            {facilities.map((f) => {
              const badgeStyle = TYPE_STYLES[f.type] || {
                bg: "rgba(255, 255, 255, 0.05)",
                text: "var(--text-secondary)",
                border: "var(--border)",
              };
              return (
                <div
                  key={f.id}
                  className="rounded-2xl p-5 shadow-sm border transition-all duration-150"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                    e.currentTarget.style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-card)";
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {f.name}
                        </h3>
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
                          style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.text,
                            borderColor: badgeStyle.border,
                          }}
                        >
                          {f.type}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {f.address}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold" style={{ color: "var(--accent-cyan)" }}>
                        ₹{f.pricePerTonnePerMonth}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        / tonne / month
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div
                      className="rounded-lg px-3 py-2 border"
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Temperature
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Thermometer size={11} style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                          {f.temperatureCelsius}
                        </p>
                      </div>
                    </div>
                    <div
                      className="rounded-lg px-3 py-2 border"
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Total Capacity
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Package size={11} style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                          {f.capacityTonnes?.toLocaleString()} t
                        </p>
                      </div>
                    </div>
                    <div
                      className="rounded-lg px-3 py-2 border"
                      style={{
                        background: f.availableTonnes > 0 ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)",
                        borderColor: f.availableTonnes > 0 ? "rgba(34, 197, 94, 0.25)" : "rgba(239, 68, 68, 0.25)",
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Available Now
                      </p>
                      <p
                        className="text-xs font-semibold mt-0.5"
                        style={{ color: f.availableTonnes > 0 ? "#4ade80" : "#f87171" }}
                      >
                        {f.availableTonnes?.toLocaleString()} t
                      </p>
                    </div>
                    <div
                      className="rounded-lg px-3 py-2 border"
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Contact
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone size={10} style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {f.contact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {f.suitableCrops?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {f.suitableCrops.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            borderColor: "var(--border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {f.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {f.features.map((feat) => (
                        <span
                          key={feat}
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{
                            background: "rgba(167, 139, 250, 0.08)",
                            borderColor: "rgba(167, 139, 250, 0.2)",
                            color: "#c4b5fd",
                          }}
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {searched && !loading && facilities.length === 0 && !error && (
          <div
            className="rounded-2xl p-8 text-center shadow-sm border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No storage facilities found. Try broadening your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
