import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { ChatGoogle } from "@langchain/google";
import { createAgent } from "langchain";

// Existing tools
import { weatherTool } from "./tools/weather.tool.js";
import { climateTool } from "./tools/climate.tool.js";
import { rainfallTool } from "./tools/rainfall.tool.js";
import { cropTool } from "./tools/crop.tool.js";
import { storageTool } from "./tools/storage.tool.js";
import { buyerTool } from "./tools/buyer.tool.js";
import { marketTool } from "./tools/market.tool.js";
// New aggregation tool
import { aggregationTool } from "./tools/aggregation.tool.js";

// Services for direct REST access
import { getWeatherByLocation } from "./service/weather.service.js";
import { getClimateData } from "./service/climate.service.js";
import { getHistoricalRainfall } from "./service/rainfall.service.js";
import {
  getCropInformation,
  getAvailableCrops,
  predictCropRecommendation,
  predictYieldRange,
} from "./service/crop.service.js";
import {
  findStorage,
  bookStorage,
  getAllStorageFacilities,
} from "./service/storage.service.js";
import {
  findBuyers,
  createBuyerInquiry,
  getAllBuyers,
} from "./service/buyer.service.js";
import { getMarketPrices } from "./service/market.service.js";
import {
  getAggregationPools,
  joinAggregationPool,
  createAggregationPool,
} from "./service/aggregation.service.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

// CORS configuration for local Next.js frontend
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

/**
 * ==========================================
 * GEMINI MODEL & LANGCHAIN AGENT
 * ==========================================
 */
const model = new ChatGoogle("gemini-3.5-flash-lite");

const tools = [
  weatherTool,
  climateTool,
  rainfallTool,
  cropTool,
  storageTool,
  buyerTool,
  marketTool,
  aggregationTool,
];

const AGENT_SYSTEM_PROMPT = `
You are an expert AI Agricultural Assistant serving Indian and global farmers.
Your mission is to empower farmers throughout their complete lifecycle journey:
PLAN → GROW → STORE → AGGREGATE → SELL

You have access to specialized tools:
1. weatherTool: For live weather, temperature, rain probability, wind, evapotranspiration, and 7-day forecast.
2. climateTool: For historical climate patterns (temperature, humidity, wind) via NASA POWER.
3. rainfallTool: For historical rainfall data and drought/precipitation analysis.
4. cropTool: For crop specifications, ML crop recommendations (using N, P, K, pH, rainfall), and harvest yield estimations.
5. marketTool: For APMC mandi prices (modal, minimum, maximum prices per quintal) across commodities and states.
6. storageTool: For finding nearby warehouses, cold storages, grain silos, capacity and monthly rates.
7. buyerTool: For finding verified food processors, millers, and institutional buyers.
8. aggregationTool: For produce pooling and farmer groups, helping smallholders reach buyer minimums (10-25 tonnes).

CORE OPERATING PRINCIPLES:
- Keep answers clear, structured, practical, and farmer-friendly.
- Never invent API data or fake mandi prices. Use factual tool outputs.
- If a farmer's quantity is small (e.g., 2-8 tonnes) and buyers require 10-20+ tonnes, proactively recommend produce aggregation via aggregationTool.
- Distinguish factual tool data from agronomic advice.
- Never claim middlemen can simply be eliminated; explain that aggregation, storage, and direct buyer linkage optimize realization.
`;

const agent = createAgent({
  model,
  tools,
  systemPrompt: AGENT_SYSTEM_PROMPT,
});

/**
 * ==========================================
 * REST API ROUTES
 * ==========================================
 */

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      backend: "online",
      socket: "online",
      geminiAgent: "ready",
      toolsCount: tools.length,
    },
  });
});

// Weather API
app.get("/api/weather", async (req, res) => {
  try {
    const location = req.query.location || "Karnal, Haryana";
    const result = await getWeatherByLocation(location);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Climate API
app.get("/api/climate", async (req, res) => {
  try {
    const { lat = 29.6857, lon = 76.9905, start = "20230101", end = "20230131" } = req.query;
    const result = await getClimateData(Number(lat), Number(lon), String(start), String(end));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rainfall API
app.get("/api/rainfall", async (req, res) => {
  try {
    const { lat = 29.6857, lon = 76.9905, start = "20230101", end = "20230131" } = req.query;
    const result = await getHistoricalRainfall(Number(lat), Number(lon), String(start), String(end));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Crops list & details
app.get("/api/crops", async (req, res) => {
  try {
    const { crop } = req.query;
    if (crop) {
      const result = await getCropInformation(String(crop));
      return res.json(result);
    }
    const result = await getAvailableCrops();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ML Crop Recommendation API
app.post("/api/crop/recommend", async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;
    const result = await predictCropRecommendation({
      N: Number(N) || 90,
      P: Number(P) || 45,
      K: Number(K) || 40,
      temperature: Number(temperature) || 24,
      humidity: Number(humidity) || 65,
      ph: Number(ph) || 6.5,
      rainfall: Number(rainfall) || 100,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Crop Yield Prediction API
app.post("/api/crop/yield", async (req, res) => {
  try {
    const { crop, area, season, soilType, rainfall, temperature } = req.body;
    const result = await predictYieldRange({
      crop: crop || "wheat",
      area: Number(area) || 2,
      season: season || "Rabi",
      soilType: soilType || "loamy",
      rainfall: Number(rainfall) || 80,
      temperature: Number(temperature) || 22,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Storage Facilities API
app.get("/api/storage", async (req, res) => {
  try {
    const { location = "", crop = "" } = req.query;
    if (location || crop) {
      const result = await findStorage(String(location), String(crop));
      return res.json(result);
    }
    const all = await getAllStorageFacilities();
    res.json(all);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Storage Reservation API
app.post("/api/storage/book", async (req, res) => {
  try {
    const result = await bookStorage(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Buyers Directory API
app.get("/api/buyers", async (req, res) => {
  try {
    const { crop = "", location = "" } = req.query;
    if (crop || location) {
      const result = await findBuyers(String(crop), String(location));
      return res.json(result);
    }
    const all = await getAllBuyers();
    res.json(all);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct Buyer Inquiry API
app.post("/api/buyers/inquire", async (req, res) => {
  try {
    const result = await createBuyerInquiry(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mandi Prices API
app.get("/api/market", async (req, res) => {
  try {
    const { state = "", commodity = "", market = "" } = req.query;
    const result = await getMarketPrices({
      state: String(state),
      commodity: String(commodity),
      market: String(market),
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Aggregation Pools API
app.get("/api/aggregation", async (req, res) => {
  try {
    const { crop = "", location = "" } = req.query;
    const result = await getAggregationPools({ crop: String(crop), location: String(location) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/aggregation/join", async (req, res) => {
  try {
    const result = await joinAggregationPool(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/aggregation/create", async (req, res) => {
  try {
    const result = await createAggregationPool(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ==========================================
 * REAL-TIME SOCKET.IO INTERACTION
 * ==========================================
 */

// Per-socket conversational memory
const socketSessions = new Map();

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socketSessions.set(socket.id, []);

  // Send welcome confirmation
  socket.emit("connected", {
    status: "online",
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });

  // Handle conversational query
  socket.on("chat:message", async (data) => {
    const { message, location, context } = data;

    if (!message || !message.trim()) {
      return socket.emit("agent:error", { message: "Message cannot be empty." });
    }

    const conversation = socketSessions.get(socket.id) || [];

    // Notify client: agent started thinking
    socket.emit("agent:status", {
      stage: "thinking",
      label: "Analyzing agricultural query...",
      timestamp: new Date().toISOString(),
    });

    try {
      let userPrompt = message.trim();
      if (location) {
        userPrompt = `[Farm Location: ${location}]\n${userPrompt}`;
      }
      if (context) {
        userPrompt += `\n[Context: ${typeof context === "string" ? context : JSON.stringify(context)}]`;
      }

      conversation.push(["human", userPrompt]);

      // Emit status that agent is invoking tools
      socket.emit("agent:status", {
        stage: "executing_tools",
        label: "Consulting agricultural models & datasets...",
        timestamp: new Date().toISOString(),
      });

      console.log(`[Socket] Farmer query from ${socket.id}: "${message}"`);
      console.time(`agent_${socket.id}`);

      const response = await agent.invoke({
        messages: conversation,
      });
      console.timeEnd(`agent_${socket.id}`);

      // Robust reply text extraction
      let reply = "I could not generate an answer at this time.";
      if (response && response.messages) {
        for (let i = response.messages.length - 1; i >= 0; i--) {
          const m = response.messages[i];
          const raw = m?.content;
          if (raw) {
            if (typeof raw === "string" && raw.trim().length > 0) {
              reply = raw;
              break;
            } else if (Array.isArray(raw)) {
              reply = raw
                .map((part) => (typeof part === "string" ? part : part?.text || ""))
                .filter(Boolean)
                .join("\n");
              if (reply.trim().length > 0) break;
            } else if (typeof raw === "object") {
              reply = raw.text || JSON.stringify(raw);
              break;
            }
          }
        }
      }

      console.log(`[Socket] Reply generated (${reply.length} chars)`);

      conversation.push(["ai", reply]);

      // Keep last 12 messages in memory to prevent context blowout
      if (conversation.length > 12) {
        socketSessions.set(socket.id, conversation.slice(-12));
      }

      // Emit final answer
      socket.emit("agent:reply", {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      });

      socket.emit("agent:status", {
        stage: "idle",
        label: "Ready",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[Agent Error]:`, err);
      // Remove the last unmatched human message if agent failed
      if (conversation.length > 0 && conversation[conversation.length - 1][0] === "human") {
        conversation.pop();
      }
      socket.emit("agent:error", {
        message: err.message || "Something went wrong while processing your request.",
      });
      socket.emit("agent:status", {
        stage: "idle",
        label: "Ready",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Clear session history
  socket.on("chat:clear", () => {
    socketSessions.set(socket.id, []);
    socket.emit("chat:cleared", { success: true });
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    socketSessions.delete(socket.id);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Backend] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[Backend] Uncaught Exception:", error);
});

server.listen(PORT, () => {
  console.log(`\n🌾 ==============================================`);
  console.log(`   AGRICULTURAL AI BACKEND & REAL-TIME SERVER`);
  console.log(`   REST APIs:     http://localhost:${PORT}/api`);
  console.log(`   Socket.IO:     ws://localhost:${PORT}`);
  console.log(`   Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`==============================================\n`);
});
