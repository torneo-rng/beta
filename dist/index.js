// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  participants;
  matches;
  currentParticipantId;
  currentMatchId;
  constructor() {
    this.participants = /* @__PURE__ */ new Map();
    this.matches = /* @__PURE__ */ new Map();
    this.currentParticipantId = 1;
    this.currentMatchId = 1;
  }
  async getParticipant(id) {
    return this.participants.get(id);
  }
  async getParticipantsByDivision(division) {
    return Array.from(this.participants.values()).filter(
      (participant) => participant.division === division
    );
  }
  async createParticipant(insertParticipant) {
    const id = this.currentParticipantId++;
    const participant = {
      ...insertParticipant,
      experience: insertParticipant.experience || null,
      id,
      score: 0,
      status: "active"
    };
    this.participants.set(id, participant);
    await this.generateBracket(insertParticipant.division);
    return participant;
  }
  async getAllParticipants() {
    return Array.from(this.participants.values());
  }
  async deleteParticipant(id) {
    return this.participants.delete(id);
  }
  async updateParticipant(id, updates) {
    const existing = this.participants.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.participants.set(id, updated);
    return updated;
  }
  // Match methods
  async getMatch(id) {
    return this.matches.get(id);
  }
  async getMatchesByDivision(division) {
    return Array.from(this.matches.values()).filter(
      (match) => match.division === division
    );
  }
  async createMatch(insertMatch) {
    const id = this.currentMatchId++;
    const match = {
      ...insertMatch,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.matches.set(id, match);
    return match;
  }
  async getAllMatches() {
    return Array.from(this.matches.values());
  }
  async updateMatch(id, updates) {
    const existing = this.matches.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.matches.set(id, updated);
    if (updates.status === "completed" && updates.winnerId) {
      await this.advanceWinnerToNextRound(updated);
    }
    return updated;
  }
  async advanceWinnerToNextRound(completedMatch) {
    const nextRound = completedMatch.round + 1;
    const divisionMatches = await this.getMatchesByDivision(completedMatch.division);
    const nextRoundMatches = divisionMatches.filter((m) => m.round === nextRound);
    if (nextRoundMatches.length === 0) {
      return;
    }
    nextRoundMatches.sort((a, b) => a.matchNumber - b.matchNumber);
    const matchIndex = Math.floor((completedMatch.matchNumber - 1) / 2);
    const nextMatch = nextRoundMatches[matchIndex];
    if (nextMatch) {
      const isFirstSlot = (completedMatch.matchNumber - 1) % 2 === 0;
      if (isFirstSlot && !nextMatch.participant1Id) {
        nextMatch.participant1Id = completedMatch.winnerId;
      } else if (!isFirstSlot && !nextMatch.participant2Id) {
        nextMatch.participant2Id = completedMatch.winnerId;
      }
      if (nextMatch.participant1Id && nextMatch.participant2Id) {
        nextMatch.status = "pending";
      }
      this.matches.set(nextMatch.id, nextMatch);
    }
  }
  async deleteMatch(id) {
    return this.matches.delete(id);
  }
  async generateBracket(division) {
    const participants2 = await this.getParticipantsByDivision(division);
    const existingMatches = await this.getMatchesByDivision(division);
    if (participants2.length < 2) {
      return existingMatches;
    }
    existingMatches.forEach((match) => this.matches.delete(match.id));
    const matches2 = [];
    const participantCount = participants2.length;
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));
    const totalRounds = Math.ceil(Math.log2(bracketSize));
    const shuffled = [...participants2].sort(() => Math.random() - 0.5);
    let matchNumber = 1;
    for (let i = 0; i < shuffled.length; i += 2) {
      const participant1 = shuffled[i];
      const participant2 = shuffled[i + 1] || null;
      const match = await this.createMatch({
        division,
        round: 1,
        matchNumber: matchNumber++,
        participant1Id: participant1.id,
        participant2Id: participant2?.id || null,
        winnerId: null,
        side: null,
        status: participant2 ? "pending" : "completed"
      });
      if (!participant2) {
        match.winnerId = participant1.id;
        match.status = "completed";
        this.matches.set(match.id, match);
      }
      matches2.push(match);
    }
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        const match = await this.createMatch({
          division,
          round,
          matchNumber: matchNumber++,
          participant1Id: null,
          participant2Id: null,
          winnerId: null,
          side: null,
          status: "pending"
        });
        matches2.push(match);
      }
    }
    return matches2;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  discordUser: text("discord_user").notNull(),
  robloxUser: text("roblox_user").notNull(),
  division: text("division").notNull(),
  experience: text("experience"),
  score: integer("score").default(0),
  status: text("status").default("active")
});
var insertParticipantSchema = createInsertSchema(participants).pick({
  playerName: true,
  discordUser: true,
  robloxUser: true,
  division: true,
  experience: true
});
var updateParticipantSchema = createInsertSchema(participants).pick({
  playerName: true,
  discordUser: true,
  robloxUser: true,
  division: true,
  experience: true,
  score: true,
  status: true
}).partial();
var matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  division: text("division").notNull(),
  round: integer("round").notNull(),
  // 1 = first round, 2 = quarter, etc.
  matchNumber: integer("match_number").notNull(),
  // Position in that round
  participant1Id: integer("participant1_id"),
  participant2Id: integer("participant2_id"),
  winnerId: integer("winner_id"),
  side: text("side").notNull(),
  // "red" or "black"
  status: text("status").default("pending"),
  // "pending", "in_progress", "completed"
  createdAt: timestamp("created_at").defaultNow()
});
var insertMatchSchema = createInsertSchema(matches).pick({
  division: true,
  round: true,
  matchNumber: true,
  participant1Id: true,
  participant2Id: true,
  winnerId: true,
  side: true,
  status: true
});
var updateMatchSchema = createInsertSchema(matches).pick({
  participant1Id: true,
  participant2Id: true,
  winnerId: true,
  status: true
}).partial();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/participants", async (req, res) => {
    try {
      const participants2 = await storage.getAllParticipants();
      res.json(participants2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });
  app2.get("/api/participants/division/:division", async (req, res) => {
    try {
      const { division } = req.params;
      const participants2 = await storage.getParticipantsByDivision(division);
      res.json(participants2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch participants by division" });
    }
  });
  app2.post("/api/participants", async (req, res) => {
    try {
      const validatedData = insertParticipantSchema.parse(req.body);
      const participant = await storage.createParticipant(validatedData);
      res.status(201).json(participant);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create participant" });
      }
    }
  });
  app2.patch("/api/participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateParticipantSchema.parse(req.body);
      const participant = await storage.updateParticipant(id, validatedData);
      if (participant) {
        res.json(participant);
      } else {
        res.status(404).json({ message: "Participant not found" });
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update participant" });
      }
    }
  });
  app2.delete("/api/participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteParticipant(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Participant not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete participant" });
    }
  });
  app2.get("/api/matches", async (req, res) => {
    try {
      const matches2 = await storage.getAllMatches();
      res.json(matches2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });
  app2.get("/api/matches/:division", async (req, res) => {
    try {
      const { division } = req.params;
      const matches2 = await storage.getMatchesByDivision(division);
      res.json(matches2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches by division" });
    }
  });
  app2.post("/api/matches", async (req, res) => {
    try {
      const validatedData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validatedData);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create match" });
      }
    }
  });
  app2.patch("/api/matches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateMatchSchema.parse(req.body);
      const match = await storage.updateMatch(id, validatedData);
      if (match) {
        res.json(match);
      } else {
        res.status(404).json({ message: "Match not found" });
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update match" });
      }
    }
  });
  app2.delete("/api/matches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMatch(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Match not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete match" });
    }
  });
  app2.post("/api/matches/generate/:division", async (req, res) => {
    try {
      const { division } = req.params;
      const matches2 = await storage.generateBracket(division);
      res.json(matches2);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate bracket" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 8888;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
