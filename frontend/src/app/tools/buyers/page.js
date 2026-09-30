"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { findBuyers } from "@/lib/api";
import { ShoppingCart, Loader2, Search, CheckCircle, Phone, Mail, Package } from "lucide-react";

const BUYER_TYPE_STYLES = {
  "Food Processing Enterprise": { bg: "rgba(251, 146, 60, 0.1)", text: "#fb923c", border: "rgba(251, 146, 60, 0.25)" },
  "Bulk Institutional Exporter": { bg: "rgba(56, 189, 248, 0.1)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.25)" },
  "FPO Aggregator": { bg: "rgba(52, 211, 153, 0.1)", text: "#34d399", border: "rgba(52, 211, 153, 0.25)" },
  "Edible Oil Miller": { bg: "rgba(250, 204, 21, 0.1)", text: "#facc15", border: "rgba(250, 204, 21, 0.25)" },
  "Flour Mill": { bg: "rgba(251, 191, 36, 0.1)", text: "#fbbf24", border: "rgba(251, 191, 36, 0.25)" },
};

export default function BuyersPage() {
  const [form, setForm] = useState({ crop: "", location: "" });
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
      const data = await findBuyers(form.crop, form.location);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buyers = result?.buyers || [];

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopBar title="Buyers Directory" subtitle="Verified food processors, millers & institutional buyers" />
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
                background: "rgba(251, 146, 60, 0.1)",
                borderColor: "rgba(251, 146, 60, 0.2)",
              }}
            >
              <ShoppingCart size={16} className="text-orange-400" />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Find Buyers
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Crop / Produce
              </label>
              <input
                type="text"
                placeholder="e.g. wheat, mustard, soybean"
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
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Location / State (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Haryana, Delhi"
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
              Find Buyers
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
            <Loader2 size={28} className="animate-spin text-orange-400" />
          </div>
        )}

        {/* Results */}
        {buyers.length > 0 && (
          <div className="space-y-3 ai-message-animate">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {buyers.length} buyer{buyers.length !== 1 ? "s" : ""} found
            </p>
            {buyers.map((buyer) => {
              const typeStyle = BUYER_TYPE_STYLES[buyer.type] || {
                bg: "rgba(255, 255, 255, 0.05)",
                text: "var(--text-secondary)",
                border: "var(--border)",
              };
              return (
                <div
                  key={buyer.id}
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
                          {buyer.name}
                        </h3>
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
                          style={{
                            background: typeStyle.bg,
                            color: typeStyle.text,
                            borderColor: typeStyle.border,
                          }}
                        >
                          {buyer.type}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {buyer.location}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 border"
                      style={{
                        background: "rgba(34, 197, 94, 0.08)",
                        borderColor: "rgba(34, 197, 94, 0.25)",
                        color: "#4ade80",
                      }}
                    >
                      <CheckCircle size={12} className="text-emerald-400" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  </div>

                  {/* Price table */}
                  {buyer.offeredPricePerQuintal && Object.keys(buyer.offeredPricePerQuintal).length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                        Offered Prices (₹ / quintal)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(buyer.offeredPricePerQuintal).map(([crop, price]) => (
                          <div
                            key={crop}
                            className="rounded-lg px-3 py-1.5 text-center border"
                            style={{
                              background: "rgba(255, 255, 255, 0.02)",
                              borderColor: "var(--border)",
                            }}
                          >
                            <p className="text-[10px] capitalize" style={{ color: "var(--text-muted)" }}>
                              {crop}
                            </p>
                            <p className="text-sm font-bold" style={{ color: "var(--accent-cyan)" }}>
                              ₹{price.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div
                      className="rounded-lg px-3 py-2 border"
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Min Quantity
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Package size={11} style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {buyer.minimumQuantityTonnes} tonnes
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
                        Phone
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone size={10} style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {buyer.contact}
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
                        Email
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail size={10} style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                          {buyer.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-lg px-3 py-2 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>
                      Payment Terms
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {buyer.paymentTerms}
                    </p>
                  </div>

                  {buyer.verificationStatus && (
                    <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
                      {buyer.verificationStatus}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {searched && !loading && buyers.length === 0 && !error && (
          <div
            className="rounded-2xl p-8 text-center shadow-sm border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No buyers found. Try a different crop or location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
