const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const crops = {
  wheat: {
    name: "Wheat",
    suitableSeason: ["Rabi"],
    suitableSoils: ["loamy", "clay loam", "alluvial"],
    waterRequirement: "moderate",
    temperatureRange: { min: 10, max: 25 },
    optimalNPK: { N: 120, P: 60, K: 40 },
    optimalPH: { min: 6.0, max: 7.5 },
    optimalRainfall: { min: 50, max: 100 },
    baseYieldPerHa: 3.8, // metric tonnes
    notes: "Wheat generally performs well in cool growing conditions with suitable irrigation and well-drained soil.",
  },
  rice: {
    name: "Rice",
    suitableSeason: ["Kharif"],
    suitableSoils: ["clay", "clay loam", "alluvial"],
    waterRequirement: "high",
    temperatureRange: { min: 20, max: 35 },
    optimalNPK: { N: 80, P: 40, K: 40 },
    optimalPH: { min: 5.0, max: 6.5 },
    optimalRainfall: { min: 150, max: 300 },
    baseYieldPerHa: 4.2,
    notes: "Rice generally requires substantially more water than wheat and performs well under warm conditions.",
  },
  maize: {
    name: "Maize",
    suitableSeason: ["Kharif", "Rabi", "Zaid"],
    suitableSoils: ["loamy", "sandy loam", "alluvial"],
    waterRequirement: "moderate",
    temperatureRange: { min: 18, max: 32 },
    optimalNPK: { N: 80, P: 50, K: 20 },
    optimalPH: { min: 5.5, max: 7.0 },
    optimalRainfall: { min: 60, max: 110 },
    baseYieldPerHa: 4.5,
    notes: "Maize performs well in fertile, well-drained soils with adequate moisture.",
  },
  millet: {
    name: "Millet",
    suitableSeason: ["Kharif"],
    suitableSoils: ["sandy", "loamy"],
    waterRequirement: "low",
    temperatureRange: { min: 20, max: 35 },
    optimalNPK: { N: 40, P: 30, K: 20 },
    optimalPH: { min: 6.0, max: 8.5 },
    optimalRainfall: { min: 30, max: 70 },
    baseYieldPerHa: 1.8,
    notes: "Millets are generally more tolerant of dry conditions than many water-intensive crops.",
  },
  chickpea: {
    name: "Chickpea (Gram)",
    suitableSeason: ["Rabi"],
    suitableSoils: ["sandy loam", "clay loam"],
    waterRequirement: "low",
    temperatureRange: { min: 15, max: 25 },
    optimalNPK: { N: 30, P: 60, K: 80 },
    optimalPH: { min: 6.0, max: 8.0 },
    optimalRainfall: { min: 40, max: 80 },
    baseYieldPerHa: 1.6,
    notes: "Leguminous pulse crop that fixes atmospheric nitrogen; highly drought-resistant.",
  },
  mustard: {
    name: "Mustard",
    suitableSeason: ["Rabi"],
    suitableSoils: ["alluvial", "loam", "clay loam"],
    waterRequirement: "low",
    temperatureRange: { min: 10, max: 25 },
    optimalNPK: { N: 60, P: 30, K: 30 },
    optimalPH: { min: 6.0, max: 7.5 },
    optimalRainfall: { min: 25, max: 60 },
    baseYieldPerHa: 1.9,
    notes: "Major oilseed crop in northern and western India with low irrigation demand.",
  },
  cotton: {
    name: "Cotton",
    suitableSeason: ["Kharif"],
    suitableSoils: ["black soil", "alluvial"],
    waterRequirement: "moderate",
    temperatureRange: { min: 21, max: 35 },
    optimalNPK: { N: 120, P: 60, K: 60 },
    optimalPH: { min: 6.0, max: 8.0 },
    optimalRainfall: { min: 50, max: 100 },
    baseYieldPerHa: 2.2,
    notes: "Requires warm climate, ample sunshine and moderate rainfall; sensitive to waterlogging.",
  },
  potato: {
    name: "Potato",
    suitableSeason: ["Rabi"],
    suitableSoils: ["sandy loam", "loamy"],
    waterRequirement: "moderate",
    temperatureRange: { min: 15, max: 24 },
    optimalNPK: { N: 150, P: 100, K: 120 },
    optimalPH: { min: 5.2, max: 6.5 },
    optimalRainfall: { min: 40, max: 80 },
    baseYieldPerHa: 22.0,
    notes: "High-value tuber crop requiring cool nights, fertile well-drained soil, and post-harvest cold storage.",
  }
};

/**
 * Get basic crop requirements (preserved existing behavior)
 */
export async function getCropInformation(cropName) {
  try {
    if (!cropName) {
      return { success: false, message: "Please provide a crop name." };
    }
    const crop = crops[cropName.toLowerCase().trim()];

    if (!crop) {
      return {
        success: false,
        message: `Crop information not available for ${cropName}. Available crops: ${Object.keys(crops).join(", ")}`,
      };
    }

    return {
      success: true,
      crop,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Get list of available crop profiles (preserved existing behavior)
 */
export async function getAvailableCrops() {
  return {
    success: true,
    crops: Object.keys(crops),
  };
}

/**
 * Predict Crop Recommendation based on soil nutrients and agro-climatic conditions
 * Dual-tier: Calls Python FastAPI service if online, otherwise executes agronomic ML heuristic model.
 */
export async function predictCropRecommendation({
  N = 90,
  P = 45,
  K = 40,
  temperature = 24,
  humidity = 65,
  ph = 6.5,
  rainfall = 100,
}) {
  // Step 1: Try Python FastAPI ML microservice
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout
    const response = await fetch(`${ML_SERVICE_URL}/predict/crop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ N, P, K, temperature, humidity, ph, rainfall }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const mlData = await response.json();
      return {
        success: true,
        source: "Python FastAPI ML Microservice",
        ...mlData,
      };
    }
  } catch (err) {
    // Graceful fallback to agronomic heuristic model
  }

  // Step 2: Built-in Agronomic Distance Metric Model (ICAR/FAO standards)
  const scores = Object.entries(crops).map(([key, profile]) => {
    let score = 100;
    // Temperature penalty
    if (temperature < profile.temperatureRange.min || temperature > profile.temperatureRange.max) {
      const diff = Math.min(
        Math.abs(temperature - profile.temperatureRange.min),
        Math.abs(temperature - profile.temperatureRange.max)
      );
      score -= diff * 4;
    }
    // pH penalty
    if (ph < profile.optimalPH.min || ph > profile.optimalPH.max) {
      const diff = Math.min(Math.abs(ph - profile.optimalPH.min), Math.abs(ph - profile.optimalPH.max));
      score -= diff * 15;
    }
    // Rainfall penalty
    if (rainfall < profile.optimalRainfall.min || rainfall > profile.optimalRainfall.max) {
      const diff = Math.min(
        Math.abs(rainfall - profile.optimalRainfall.min),
        Math.abs(rainfall - profile.optimalRainfall.max)
      );
      score -= diff * 0.3;
    }
    // Nutrient penalty
    const nDiff = Math.abs(N - profile.optimalNPK.N) / profile.optimalNPK.N;
    const pDiff = Math.abs(P - profile.optimalNPK.P) / profile.optimalNPK.P;
    const kDiff = Math.abs(K - profile.optimalNPK.K) / profile.optimalNPK.K;
    score -= (nDiff + pDiff + kDiff) * 10;

    const confidence = Math.max(0.1, Math.min(0.98, score / 100));
    return {
      crop: key,
      name: profile.name,
      confidence: Number(confidence.toFixed(2)),
      suitableSeason: profile.suitableSeason,
      waterRequirement: profile.waterRequirement,
      baseYieldPerHa: profile.baseYieldPerHa,
      notes: profile.notes,
    };
  });

  scores.sort((a, b) => b.confidence - a.confidence);
  const topCrop = scores[0];

  return {
    success: true,
    source: "Agronomic Precision Decision Model",
    top_crop: topCrop.crop,
    confidence: topCrop.confidence,
    recommendations: scores.slice(0, 3),
    rationale: `Given N=${N}, P=${P}, K=${K}, pH=${ph}, Temp=${temperature}°C, Rain=${rainfall}mm: ${topCrop.name} is the optimal choice with ${(topCrop.confidence * 100).toFixed(0)}% suitability.`,
  };
}

/**
 * Predict Yield Range for a given crop and land area
 */
export async function predictYieldRange({
  crop = "wheat",
  area = 2,
  season = "Rabi",
  soilType = "loamy",
  rainfall = 80,
  temperature = 22,
}) {
  const cropKey = crop.toLowerCase().trim();
  const profile = crops[cropKey] || crops.wheat;

  // Try Python ML service first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${ML_SERVICE_URL}/predict/yield`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop: cropKey, area, season, soil_type: soilType, rainfall, temperature }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const mlData = await response.json();
      return {
        success: true,
        source: "Python FastAPI ML Microservice",
        ...mlData,
      };
    }
  } catch (err) {
    // fallback
  }

  // Fallback agronomic estimation
  const baseYield = profile.baseYieldPerHa || 3.5;
  // Weather adjustment factor
  let weatherFactor = 1.0;
  if (rainfall < profile.optimalRainfall.min * 0.7) weatherFactor *= 0.85;
  if (temperature > profile.temperatureRange.max + 4) weatherFactor *= 0.88;

  const estimatedYieldPerHa = Number((baseYield * weatherFactor).toFixed(2));
  const totalProduction = Number((estimatedYieldPerHa * area).toFixed(2));
  const minProduction = Number((totalProduction * 0.85).toFixed(2));
  const maxProduction = Number((totalProduction * 1.15).toFixed(2));

  return {
    success: true,
    source: "Agronomic Yield Estimation Model",
    crop: profile.name,
    area_ha: area,
    estimated_yield_per_ha: estimatedYieldPerHa,
    total_estimated_production_tonnes: totalProduction,
    yield_range_min_tonnes: minProduction,
    yield_range_max_tonnes: maxProduction,
    unit: "metric tonnes",
    advisory: `Estimated yield for ${profile.name} across ${area} hectares is ~${totalProduction} metric tonnes (Range: ${minProduction} - ${maxProduction} tonnes) under ${season} season.`,
  };
}