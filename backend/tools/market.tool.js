import { tool } from "langchain";
import * as z from "zod";

import {
  getMarketPrices,
} from "../service/market.service.js";

export const marketTool = tool(
  async ({
    state,
    commodity,
    market,
  }) => {
    return await getMarketPrices({
      state,
      commodity,
      market,
    });
  },

  {
    name: "marketTool",

    description: `
Get agricultural mandi market prices.

Use this tool when the user asks about:

- mandi prices
- crop prices
- market prices
- wholesale prices
- modal prices
- minimum or maximum market prices
- selling price information
`,

    schema: z.object({
      state: z
        .string()
        .optional()
        .describe(
          "Indian state, for example Haryana"
        ),

      commodity: z
        .string()
        .optional()
        .describe(
          "Agricultural commodity, for example Wheat"
        ),

      market: z
        .string()
        .optional()
        .describe(
          "Specific mandi or market"
        ),
    }),
  }
);