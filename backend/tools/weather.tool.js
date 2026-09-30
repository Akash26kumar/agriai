import { tool } from "langchain";
import * as z from "zod";
import { getWeatherByLocation } from "../service/weather.service.js";

export const weatherTool = tool(
  async ({ location }) => {
    try {
      return await getWeatherByLocation(location);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },
  {
    name: "weatherTool",

    description: `
Get current weather and a 7-day weather forecast
for a given location.

Use this tool for:
- current weather
- temperature
- rainfall
- rain probability
- humidity
- wind
- upcoming rain
- farming weather conditions
- irrigation-related weather conditions
`,

    schema: z.object({
      location: z
        .string()
        .describe(
          "City, village, district or farm location. Example: Karnal, Haryana"
        ),
    }),
  }
);