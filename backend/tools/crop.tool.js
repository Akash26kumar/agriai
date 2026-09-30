import { tool } from "langchain";
import * as z from "zod";
import {
  getCropInformation,
  getAvailableCrops,
  predictCropRecommendation,
  predictYieldRange,
} from "../service/crop.service.js";

export const cropTool = tool(
  async (args) => {
    try {
      const {
        action = "info",
        cropName,
        N,
        P,
        K,
        ph,
        temperature,
        humidity,
        rainfall,
        area,
        season,
      } = args;

      // 1. Crop recommendation request
      if (action === "recommend" || (N !== undefined && P !== undefined)) {
        return await predictCropRecommendation({
          N: N ?? 90,
          P: P ?? 45,
          K: K ?? 40,
          temperature: temperature ?? 24,
          humidity: humidity ?? 65,
          ph: ph ?? 6.5,
          rainfall: rainfall ?? 100,
        });
      }

      // 2. Yield estimation request
      if (action === "yield" || (area !== undefined && cropName)) {
        return await predictYieldRange({
          crop: cropName || "wheat",
          area: area || 2,
          season: season || "Rabi",
          temperature: temperature || 22,
          rainfall: rainfall || 80,
        });
      }

      // 3. Available crops list
      if (action === "list") {
        return await getAvailableCrops();
      }

      // 4. Default: Specific crop information
      if (cropName) {
        return await getCropInformation(cropName);
      }

      return await getAvailableCrops();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },
  {
    name: "cropTool",
    description: `
Agricultural crop knowledge, ML-powered crop recommendation, and harvest yield range estimation.

Use this tool when the user asks about:
- crop requirements, soil, season, water and temperature suitability
- crop recommendations based on soil testing (Nitrogen/N, Phosphorus/P, Potassium/K, pH, rainfall)
- harvest yield range estimations based on crop and farm area (hectares/acres)
- what crop to plant or suitable crops for their farm
`,
    schema: z.object({
      action: z
        .enum(["info", "recommend", "yield", "list"])
        .optional()
        .describe("Action type: 'info' for crop specs, 'recommend' for ML crop recommendation, 'yield' for harvest yield estimation"),
      cropName: z
        .string()
        .optional()
        .describe("Name of the crop (e.g., wheat, rice, maize, millet, chickpea, mustard, cotton, potato)"),
      N: z.number().optional().describe("Nitrogen level in soil"),
      P: z.number().optional().describe("Phosphorus level in soil"),
      K: z.number().optional().describe("Potassium level in soil"),
      ph: z.number().optional().describe("Soil pH value (e.g. 6.5)"),
      temperature: z.number().optional().describe("Temperature in Celsius"),
      humidity: z.number().optional().describe("Humidity percentage"),
      rainfall: z.number().optional().describe("Expected or average rainfall in mm"),
      area: z.number().optional().describe("Land area in hectares (or acres) for yield estimation"),
      season: z.string().optional().describe("Season: Kharif, Rabi, or Zaid"),
    }),
  }
);