import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  discordUser: text("discord_user").notNull(),
  robloxUser: text("roblox_user").notNull(),
  division: text("division").notNull(),
  experience: text("experience"),
  score: integer("score").default(0),
  status: text("status").default("active"),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  playerName: true,
  discordUser: true,
  robloxUser: true,
  division: true,
  experience: true,
});

export const updateParticipantSchema = createInsertSchema(participants).pick({
  playerName: true,
  discordUser: true,
  robloxUser: true,
  division: true,
  experience: true,
  score: true,
  status: true,
}).partial();

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

// Matches table for tournament brackets
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  division: text("division").notNull(),
  round: integer("round").notNull(), // 1 = first round, 2 = quarter, etc.
  matchNumber: integer("match_number").notNull(), // Position in that round
  participant1Id: integer("participant1_id"),
  participant2Id: integer("participant2_id"),
  winnerId: integer("winner_id"),
  side: text("side").notNull(), // "red" or "black"
  status: text("status").default("pending"), // "pending", "in_progress", "completed"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  division: true,
  round: true,
  matchNumber: true,
  participant1Id: true,
  participant2Id: true,
  winnerId: true,
  side: true,
  status: true,
});

export const updateMatchSchema = createInsertSchema(matches).pick({
  participant1Id: true,
  participant2Id: true,
  winnerId: true,
  status: true,
}).partial();

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export const divisions = ["elite", "division1", "division2", "recruits"] as const;
export type Division = typeof divisions[number];
