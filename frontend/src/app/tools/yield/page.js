"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { predictYield } from "@/lib/api";
import { TrendingUp, Loader2, Info, Package } from "lucide-react";

const CROPS = ["wheat", "rice", "maize", "millet", "chickpea", "mustard", "cotton", "potato"];
const SEASONS = ["Rabi", "Kharif", "Zaid"];
const SOIL_TYPES = ["loamy", "clay", "clay loam", "sandy loam", "alluvial", "black soil", "sandy"];

export default function YieldPage() {
  const [form, setForm] = useState({
    crop: "wheat",
    area: 2,
    season: "Rabi",
    soilType: "loamy",
    rainfall: 80,
    temperature: 22,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await predictYield({
        crop: form.crop,
        area: Number(form.area),
        season: form.season,
        soilType: form.soilType,
        rainfall: Number(form.rainfall),
        temperature: Number(form.temperature),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopBar title="Yield Predictor" subtitle="Estimate harvest output for your farm" />
      <div className="flex-1 p-6 max-w-4xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div
            className="rounded-2xl p-6 shadow-sm border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center border"
                style={{
                  background: "rgba(45, 212, 191, 0.1)",
                  borderColor: "rgba(45, 212, 191, 0.2)",
                }}
              >
                <TrendingUp size={16} className="text-teal-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Farm Parameters
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Enter your crop and land details
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Crop
                </label>
                <select
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
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-slate-100 capitalize">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Farm Area (hectares)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Season
                  </label>
                  <select
                    value={form.season}
                    onChange={(e) => set("season", e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 border"
                    style={{
                      background: "var(--bg-input)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  >
                    {SEASONS.map((s) => (
                      <option key={s} className="bg-slate-900 text-slate-100">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Soil Type
                  </label>
                  <select
                    value={form.soilType}
                    onChange={(e) => set("soilType", e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 border"
                    style={{
                      background: "var(--bg-input)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  >
                    {SOIL_TYPES.map((s) => (
                      <option key={s} className="bg-slate-900 text-slate-100">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={form.rainfall}
                    onChange={(e) => set("rainfall", e.target.value)}
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
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.temperature}
                    onChange={(e) => set("temperature", e.target.value)}
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
              </div>
              {error && (
                <p
                  className="text-sm rounded-lg px-3 py-2 border"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.25)",
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white text-sm font-medium py-2.5 rounded-xl transition-all duration-150 shadow-sm disabled:opacity-50"
                style={{ background: "var(--accent-blue)" }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = "var(--accent-blue-h)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent-blue)";
                }}
              >
                {loading ? <Loader2 size={15} className="animate-spin text-white" /> : <TrendingUp size={15} />}
                {loading ? "Predicting..." : "Predict Yield"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div
            className="rounded-2xl p-6 shadow-sm border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Estimated Yield
            </h2>
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 border"
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--border)",
                  }}
                >
                  <Info size={18} style={{ color: "var(--text-muted)" }} />
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Fill in the form to estimate your harvest yield.
                </p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <Loader2 size={28} className="animate-spin mx-auto mb-3 text-teal-400" />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Calculating yield estimate…
                  </p>
                </div>
              </div>
            )}
            {result && (
              <div className="space-y-4 ai-message-animate">
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    background: "rgba(45, 212, 191, 0.08)",
                    borderColor: "rgba(45, 212, 191, 0.25)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={15} className="text-teal-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                      {result.crop || form.crop} · {form.area} ha · {form.season}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-teal-300">
                    {result.total_estimated_production_tonnes ?? "—"}{" "}
                    <span className="text-base font-normal text-teal-400">tonnes</span>
                  </p>
                  <p className="text-xs mt-1 text-teal-400/80">
                    {result.estimated_yield_per_ha} tonnes / hectare
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl px-4 py-3 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                      Min Range
                    </p>
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {result.yield_range_min_tonnes} t
                    </p>
                  </div>
                  <div
                    className="rounded-xl px-4 py-3 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                      Max Range
                    </p>
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {result.yield_range_max_tonnes} t
                    </p>
                  </div>
                </div>

                {result.advisory && (
                  <p
                    className="text-xs rounded-lg px-3 py-2.5 leading-relaxed border"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    💡 {result.advisory}
                  </p>
                )}

                {result.source && (
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Source: {result.source}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
