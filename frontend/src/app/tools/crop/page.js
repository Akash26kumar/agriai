"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { recommendCrop } from "@/lib/api";
import { Sprout, Loader2, CheckCircle, Info } from "lucide-react";

const defaultValues = { N: 90, P: 42, K: 43, temperature: 20.8, humidity: 82, ph: 6.5, rainfall: 202.9 };

function FieldInput({ label, name, value, onChange, step = "1", hint }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 border"
        style={{
          background: "var(--bg-input)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent-blue)";
          e.target.style.boxShadow = "0 0 0 1px rgba(34, 197, 94, 0.35)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />
      {hint && (
        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function CropAdvisorPage() {
  const [form, setForm] = useState(defaultValues);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await recommendCrop({
        N: Number(form.N),
        P: Number(form.P),
        K: Number(form.K),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        ph: Number(form.ph),
        rainfall: Number(form.rainfall),
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
      <TopBar title="Crop Advisor" subtitle="ML-powered crop recommendation" />
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
                  background: "rgba(52, 211, 153, 0.1)",
                  borderColor: "rgba(52, 211, 153, 0.2)",
                }}
              >
                <Sprout size={16} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Soil & Climate Data
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Enter your farm&apos;s parameters
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Soil Nutrients
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <FieldInput label="Nitrogen (N)" name="N" value={form.N} onChange={handleChange} hint="mg/kg" />
                  <FieldInput label="Phosphorus (P)" name="P" value={form.P} onChange={handleChange} hint="mg/kg" />
                  <FieldInput label="Potassium (K)" name="K" value={form.K} onChange={handleChange} hint="mg/kg" />
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Climate
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput label="Temperature (°C)" name="temperature" value={form.temperature} step="0.1" onChange={handleChange} />
                  <FieldInput label="Humidity (%)" name="humidity" value={form.humidity} step="0.1" onChange={handleChange} />
                  <FieldInput label="Soil pH" name="ph" value={form.ph} step="0.1" onChange={handleChange} hint="1 – 14" />
                  <FieldInput label="Rainfall (mm)" name="rainfall" value={form.rainfall} step="0.1" onChange={handleChange} />
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
                {loading ? <Loader2 size={15} className="animate-spin text-white" /> : <Sprout size={15} />}
                {loading ? "Analyzing..." : "Get Recommendation"}
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
              Recommendation
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
                  Fill in your soil and climate values, then click &quot;Get Recommendation&quot;.
                </p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "var(--accent-cyan)" }} />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Running ML model…
                  </p>
                </div>
              </div>
            )}
            {result && (
              <div className="space-y-4 ai-message-animate">
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    background: "rgba(52, 211, 153, 0.08)",
                    borderColor: "rgba(52, 211, 153, 0.25)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Best Match
                    </span>
                  </div>
                  <p className="text-2xl font-bold capitalize text-emerald-300">
                    {result.top_crop}
                  </p>
                  <p className="text-xs mt-1 text-emerald-400/80">
                    {Math.round((result.confidence || 0) * 100)}% confidence
                  </p>
                </div>

                {result.rationale && (
                  <p
                    className="text-xs rounded-lg px-3 py-2.5 leading-relaxed border"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {result.rationale}
                  </p>
                )}

                {result.recommendations?.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      All Options
                    </p>
                    <div className="space-y-2">
                      {result.recommendations.map((r, i) => (
                        <div
                          key={r.crop || i}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg border"
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <span className="text-xs font-medium w-4" style={{ color: "var(--text-muted)" }}>
                            {i + 1}
                          </span>
                          <span className="flex-1 text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                            {r.crop || r.name}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {Math.round((r.confidence || 0) * 100)}%
                          </span>
                          <div
                            className="w-20 rounded-full h-1.5 overflow-hidden"
                            style={{ background: "rgba(255, 255, 255, 0.08)" }}
                          >
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                background: "var(--accent-cyan)",
                                width: `${Math.round((r.confidence || 0) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
