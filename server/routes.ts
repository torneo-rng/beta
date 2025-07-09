import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParticipantSchema, updateParticipantSchema, insertMatchSchema, updateMatchSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all participants
  app.get("/api/participants", async (req, res) => {
    try {
      const participants = await storage.getAllParticipants();
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Get participants by division
  app.get("/api/participants/division/:division", async (req, res) => {
    try {
      const { division } = req.params;
      const participants = await storage.getParticipantsByDivision(division);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch participants by division" });
    }
  });

  // Create a new participant
  app.post("/api/participants", async (req, res) => {
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

  // Update a participant
  app.patch("/api/participants/:id", async (req, res) => {
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

  // Delete a participant
  app.delete("/api/participants/:id", async (req, res) => {
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

  // Match routes
  
  // Get all matches
  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await storage.getAllMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Get matches by division
  app.get("/api/matches/:division", async (req, res) => {
    try {
      const { division } = req.params;
      const matches = await storage.getMatchesByDivision(division);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches by division" });
    }
  });

  // Create a new match
  app.post("/api/matches", async (req, res) => {
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

  // Update a match
  app.patch("/api/matches/:id", async (req, res) => {
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

  // Delete a match
  app.delete("/api/matches/:id", async (req, res) => {
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

  // Generate bracket for a division
  app.post("/api/matches/generate/:division", async (req, res) => {
    try {
      const { division } = req.params;
      const matches = await storage.generateBracket(division);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate bracket" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
