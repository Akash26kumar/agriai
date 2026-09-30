const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Health check
export const getHealth = () => request("/api/health");

// Weather
export const getWeather = (location) =>
  request(`/api/weather?location=${encodeURIComponent(location)}`);

// Crops
export const getAllCrops = () => request("/api/crops");
export const getCropInfo = (crop) => request(`/api/crops?crop=${encodeURIComponent(crop)}`);

// ML Crop Recommendation
export const recommendCrop = (data) =>
  request("/api/crop/recommend", { method: "POST", body: JSON.stringify(data) });

// Yield Prediction
export const predictYield = (data) =>
  request("/api/crop/yield", { method: "POST", body: JSON.stringify(data) });

// Storage
export const findStorage = (location = "", crop = "") =>
  request(`/api/storage?location=${encodeURIComponent(location)}&crop=${encodeURIComponent(crop)}`);

export const bookStorage = (data) =>
  request("/api/storage/book", { method: "POST", body: JSON.stringify(data) });

// Buyers
export const findBuyers = (crop = "", location = "") =>
  request(`/api/buyers?crop=${encodeURIComponent(crop)}&location=${encodeURIComponent(location)}`);

export const submitInquiry = (data) =>
  request("/api/buyers/inquire", { method: "POST", body: JSON.stringify(data) });

// Market prices
export const getMarketPrices = (state = "", commodity = "", market = "") =>
  request(
    `/api/market?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(market)}`
  );

// Aggregation
export const getAggregationPools = (crop = "", location = "") =>
  request(`/api/aggregation?crop=${encodeURIComponent(crop)}&location=${encodeURIComponent(location)}`);

export const joinPool = (data) =>
  request("/api/aggregation/join", { method: "POST", body: JSON.stringify(data) });

export const createPool = (data) =>
  request("/api/aggregation/create", { method: "POST", body: JSON.stringify(data) });
