import { tool } from "langchain";
import * as z from "zod";

import {
  findStorage,
} from "../service/storage.service.js";

export const storageTool = tool(
  async ({ location }) => {
    return await findStorage(location);
  },

  {
    name: "storageTool",

    description: `
Find available agricultural storage facilities
for a location.

Use this tool when the user asks about:

- nearby warehouses
- cold storage
- agricultural storage
- storage capacity
- storage price
- post-harvest storage
`,

    schema: z.object({
      location: z
        .string()
        .describe(
          "City, district or location where storage is required"
        ),
    }),
  }
);