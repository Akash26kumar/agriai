import readlineSync from "readline-sync";
import dotenv from "dotenv";
import { ChatGoogle } from "@langchain/google";
import { createAgent } from "langchain";
import { weatherTool } from "./tools/weather.tool.js";
import { climateTool } from "./tools/climate.tool.js";
import { rainfallTool } from "./tools/rainfall.tool.js";
import { cropTool } from "./tools/crop.tool.js";
import { storageTool } from "./tools/storage.tool.js";
import { buyerTool } from "./tools/buyer.tool.js";
import { marketTool } from "./tools/market.tool.js";

dotenv.config();


/**
 * ==========================================
 * GEMINI MODEL
 * ==========================================
 */

const model =
  new ChatGoogle("gemini-3.5-flash-lite");


/**
 * ==========================================
 * AGRICULTURAL AI AGENT
 * ==========================================
 */

const agent = createAgent({
  model,

  tools: [
    weatherTool,

    climateTool,

    rainfallTool,

    cropTool,

    storageTool,

    buyerTool,

    marketTool,
  ],
});


/**
 * ==========================================
 * CONVERSATION MEMORY
 * ==========================================
 */

const conversation = [];


/**
 * ==========================================
 * CLI
 * ==========================================
 */

console.log("\n╭──────────────────────────────╮");
console.log("│     🌾 AGRI AI ASSISTANT    │");
console.log("│      Type 'exit' to leave   │");
console.log("╰──────────────────────────────╯\n");


/**
 * ==========================================
 * CHAT LOOP
 * ==========================================
 */

while (true) {
  const question =
    readlineSync
      .question("You : ")
      .trim();


  if (
    !question ||
    question.toLowerCase() === "exit"
  ) {
    console.log(
      "\nAI: Goodbye! 👋\n"
    );

    break;
  }


  try {
    conversation.push([
      "human",
      `
You are an AI agricultural assistant.

Your purpose is to help farmers with
crop planning, weather, climate,
rainfall, storage, market access,
buyer discovery and agricultural
produce management.

You have access to specialized tools.

IMPORTANT RULES:

1. Use weatherTool for current weather,
   temperature, humidity, wind, upcoming
   rain and weather forecasts.

2. Use climateTool for historical climate
   information.

3. Use rainfallTool for historical
   rainfall and precipitation analysis.

4. Use cropTool for crop requirements,
   crop season, soil suitability and
   basic crop knowledge.

5. Use marketTool for mandi and
   agricultural market prices.

6. Use storageTool when the farmer asks
   about warehouses, cold storage,
   storage capacity, availability or
   storage cost.

7. Use buyerTool when the farmer wants
   to find buyers or sell agricultural
   produce.

9. Never invent API data.

10. Never invent market prices,
    storage availability, buyer details,
    weather values or climate values.

11. If a tool returns insufficient data,
    clearly tell the user.

12. Keep answers simple and farmer-friendly.

13. Do not unnecessarily use multiple
    tools if one tool is sufficient.

14. If the question requires multiple
    types of information, you may use
    multiple relevant tools.

15. Clearly distinguish factual data
    returned by tools from your own
    agricultural explanation.

16. Do not make guaranteed claims about
    crop yield, income, irrigation,
    weather or agricultural outcomes.

17. For irrigation recommendations,
    do not rely on rainfall alone.
    Consider crop stage, soil moisture,
    crop water requirement and weather
    when those data are available.

18. Never claim that middlemen can simply
    be eliminated. Explain that the system
    aims to reduce inefficient
    intermediation through aggregation,
    storage and direct buyer discovery.

User Question:
${question}
      `,
    ]);


    const response =
      await agent.invoke({
        messages: conversation,
      });


    const reply =
      response.messages.at(-1)?.content ??
      "No reply.";


    console.log(
      `\nAI: ${reply}\n`
    );


    conversation.push([
      "ai",
      reply,
    ]);

  } catch (error) {
    console.log(
      "\nAI: Something went wrong.\n"
    );

    console.error(
      error.message
    );
  }
}