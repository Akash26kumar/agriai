"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { getMarketPrices } from "@/lib/api";
import { BarChart2, Loader2, Search } from "lucide-react";

const STATES = [
  "", "Haryana", "Punjab", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan",
  "Maharashtra", "Gujarat", "Karnataka", "Andhra Pradesh", "Bihar",
];
const COMMODITIES = [
  "", "wheat", "rice", "paddy", "maize", "mustard", "soybean",
  "potato", "onion", "cotton", "chickpea", "millet",
];

export default function MarketPage() {
  const [form, setForm] = useState({ state: "", commodity: "", market: "" });
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
      const data = await getMarketPrices(form.state, form.commodity, form.market);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const prices = result?.prices || result?.data || [];
  const summary = result?.summary || result?.marketSummary;

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopBar title="Market Prices" subtitle="APMC mandi prices across India" />
      <div className="flex-1 p-6 max-w-5xl space-y-5">
        {/* Search bar */}
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
                background: "rgba(96, 165, 250, 0.1)",
                borderColor: "rgba(96, 165, 250, 0.2)",
              }}
            >
              <BarChart2 size={16} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Search Mandi Prices
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                State
              </label>
              <select
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 border"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              >
                {STATES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-slate-100">
                    {s || "All States"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Commodity
              </label>
              <select
                value={form.commodity}
                onChange={(e) => set("commodity", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 border"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              >
                {COMMODITIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-slate-100">
                    {c ? c.charAt(0).toUpperCase() + c.slice(1) : "All Commodities"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Market / Mandi
              </label>
              <input
                type="text"
                placeholder="e.g. Karnal"
                value={form.market}
                onChange={(e) => set("market", e.target.value)}
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
              className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2 rounded-xl transition-all duration-150 shadow-sm disabled:opacity-50 whitespace-nowrap"
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

        {/* Summary */}
        {summary && (
          <div
            className="rounded-xl p-4 border"
            style={{
              background: "rgba(34, 197, 94, 0.08)",
              borderColor: "rgba(34, 197, 94, 0.25)",
              color: "var(--accent-cyan)",
            }}
          >
            <p className="text-sm">{typeof summary === "string" ? summary : JSON.stringify(summary)}</p>
          </div>
        )}

        {/* Results table */}
        {prices.length > 0 && (
          <div
            className="rounded-2xl shadow-sm overflow-hidden border ai-message-animate"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {prices.length} result{prices.length !== 1 ? "s" : ""} · Prices in ₹ per quintal
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(255, 255, 255, 0.02)" }}>
                    {["Commodity", "Market", "State", "Min ₹", "Modal ₹", "Max ₹", "Date"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold px-4 py-2.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {prices.map((row, i) => (
                    <tr
                      key={i}
                      className="transition-colors duration-150"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                        {row.commodity || row.crop || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {row.market || row.Market || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {row.state || row.State || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                        ₹{row.min_price ?? row.minPrice ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--accent-cyan)" }}>
                        ₹{row.modal_price ?? row.modalPrice ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                        ₹{row.max_price ?? row.maxPrice ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {row.date || row.arrival_date || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result && prices.length === 0 && !loading && (
          <div
            className="rounded-2xl p-8 text-center shadow-sm border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No price data found for the selected filters.
            </p>
            {result.message && (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {result.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
