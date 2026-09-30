import { tool } from "langchain";
import * as z from "zod";
import {
  getAggregationPools,
  joinAggregationPool,
  createAggregationPool,
} from "../service/aggregation.service.js";

export const aggregationTool = tool(
  async (args) => {
    try {
      const { action = "list", crop, location, poolId, farmerName, farmerContact, tonnes } = args;

      if (action === "join" && poolId && farmerName && tonnes) {
        return await joinAggregationPool({
          poolId,
          farmerName,
          farmerContact: farmerContact || "Not provided",
          contributedTonnes: tonnes,
        });
      }

      if (action === "create") {
        return await createAggregationPool({
          crop: crop || "Wheat",
          hubLocation: location || "Karnal",
          targetTonnes: tonnes || 20,
          organizerContact: farmerContact || "Direct Farmer",
        });
      }

      return await getAggregationPools({ crop, location });
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },
  {
    name: "aggregationTool",
    description: `
Produce aggregation, farmer group pooling, and bulk market linkage.

Use this tool when:
- a farmer has a small quantity (e.g. 2-8 tonnes) that is below bulk buyer minimums (10-20+ tonnes)
- the farmer asks about joining a farmer group, FPO, or produce pool
- the farmer asks how to aggregate crops to get better freight or bulk prices
- listing available aggregation pools for wheat, rice, maize, soybean, etc.
`,
    schema: z.object({
      action: z
        .enum(["list", "join", "create"])
        .optional()
        .describe("Action: 'list' pools, 'join' a pool, or 'create' a pool"),
      crop: z.string().optional().describe("Crop name like Wheat, Rice, Maize, Soybean"),
      location: z.string().optional().describe("Hub location or district"),
      poolId: z.string().optional().describe("ID of the pool to join"),
      farmerName: z.string().optional().describe("Name of the farmer"),
      farmerContact: z.string().optional().describe("Phone number of the farmer"),
      tonnes: z.number().optional().describe("Tonnes to contribute or target pool size"),
    }),
  }
);
