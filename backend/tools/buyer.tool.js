import { tool } from "langchain";
import * as z from "zod";

import {
  findBuyers,
} from "../service/buyer.service.js";

export const buyerTool = tool(
  async ({
    cropName,
    location,
  }) => {
    return await findBuyers(
      cropName,
      location
    );
  },

  {
    name: "buyerTool",

    description: `
Find potential buyers for agricultural produce.

Use this tool when the user asks about:

- buyers
- bulk buyers
- processors
- selling agricultural produce
- crop buyers
- buyer matching
- market linkage
`,

    schema: z.object({
      cropName: z
        .string()
        .describe(
          "Crop the farmer wants to sell"
        ),

      location: z
        .string()
        .optional()
        .describe(
          "Farmer or buyer location"
        ),
    }),
  }
);