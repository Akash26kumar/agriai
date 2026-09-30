import { tool } from "langchain";
import * as z from "zod";
import { getClimateData } from "../service/climate.service.js";
import { getCoordinates } from "../service/weather.service.js";

export const climateTool = tool(
  async ({
    location,
    latitude,
    longitude,
    startDate,
    endDate,
  }) => {
    try {
      let lat = latitude;
      let lon = longitude;

      if ((lat === undefined || lon === undefined) && location) {
        try {
          const coords = await getCoordinates(location);
          lat = coords.latitude;
          lon = coords.longitude;
        } catch (e) {
          lat = 29.6857;
          lon = 76.9905;
        }
      }

      lat = lat ?? 29.6857;
      lon = lon ?? 76.9905;
      const start = startDate || "20230101";
      const end = endDate || "20230131";

      return await getClimateData(lat, lon, start, end);
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  {
    name: "climateTool",
    description: `
Get historical climate data for an agricultural location using NASA POWER.

Use this tool when the user asks about:
- historical climate
- historical temperature
- historical rainfall
- climate patterns
- average temperature
- humidity trends
- wind conditions
- agricultural climate analysis
`,
    schema: z.object({
      location: z
        .string()
        .optional()
        .describe("City, village, district or state name (e.g. Karnal, Haryana)"),
      latitude: z
        .number()
        .optional()
        .describe("Latitude of the location"),
      longitude: z
        .number()
        .optional()
        .describe("Longitude of the location"),
      startDate: z
        .string()
        .optional()
        .describe("Start date in YYYYMMDD format (e.g. 20230101)"),
      endDate: z
        .string()
        .optional()
        .describe("End date in YYYYMMDD format (e.g. 20230131)"),
    }),
  }
);