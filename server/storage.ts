import { participants, matches, type Participant, type InsertParticipant, type Match, type InsertMatch } from "@shared/schema";

export interface IStorage {
  getParticipant(id: number): Promise<Participant | undefined>;
  getParticipantsByDivision(division: string): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getAllParticipants(): Promise<Participant[]>;
  deleteParticipant(id: number): Promise<boolean>;
  updateParticipant(id: number, updates: Partial<Participant>): Promise<Participant | undefined>;
  
  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByDivision(division: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  getAllMatches(): Promise<Match[]>;
  updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined>;
  deleteMatch(id: number): Promise<boolean>;
  generateBracket(division: string): Promise<Match[]>;
}

export class MemStorage implements IStorage {
  private participants: Map<number, Participant>;
  private matches: Map<number, Match>;
  private currentParticipantId: number;
  private currentMatchId: number;

  constructor() {
    this.participants = new Map();
    this.matches = new Map();
    this.currentParticipantId = 1;
    this.currentMatchId = 1;
  }

  async getParticipant(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantsByDivision(division: string): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter(
      (participant) => participant.division === division,
    );
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.currentParticipantId++;
    const participant: Participant = { 
      ...insertParticipant,
      experience: insertParticipant.experience || null,
      id,
      score: 0,
      status: "active"
    };
    this.participants.set(id, participant);
    
    // Auto-generate bracket when participant is added
    await this.generateBracket(insertParticipant.division);
    
    return participant;
  }

  async getAllParticipants(): Promise<Participant[]> {
    return Array.from(this.participants.values());
  }

  async deleteParticipant(id: number): Promise<boolean> {
    return this.participants.delete(id);
  }

  async updateParticipant(id: number, updates: Partial<Participant>): Promise<Participant | undefined> {
    const existing = this.participants.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.participants.set(id, updated);
    return updated;
  }

  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchesByDivision(division: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.division === division,
    );
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const match: Match = { 
      ...insertMatch,
      id,
      createdAt: new Date()
    };
    this.matches.set(id, match);
    return match;
  }

  async getAllMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }

  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined> {
    const existing = this.matches.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.matches.set(id, updated);
    
    // If match is completed, automatically advance winner to next round
    if (updates.status === "completed" && updates.winnerId) {
      await this.advanceWinnerToNextRound(updated);
    }
    
    return updated;
  }

  private async advanceWinnerToNextRound(completedMatch: Match): Promise<void> {
    const nextRound = completedMatch.round + 1;
    const divisionMatches = await this.getMatchesByDivision(completedMatch.division);
    
    // Find the next round match that this winner should advance to
    const nextRoundMatches = divisionMatches.filter(m => m.round === nextRound);
    
    if (nextRoundMatches.length === 0) {
      // This was the final match of the division - tournament complete
      return;
    }
    
    // Sort next round matches by match number to ensure correct ordering
    nextRoundMatches.sort((a, b) => a.matchNumber - b.matchNumber);
    
    // Determine which match in the next round this winner advances to
    const matchIndex = Math.floor((completedMatch.matchNumber - 1) / 2);
    const nextMatch = nextRoundMatches[matchIndex];
    
    if (nextMatch) {
      // Determine if winner goes to participant1 or participant2 slot
      const isFirstSlot = (completedMatch.matchNumber - 1) % 2 === 0;
      
      if (isFirstSlot && !nextMatch.participant1Id) {
        nextMatch.participant1Id = completedMatch.winnerId;
      } else if (!isFirstSlot && !nextMatch.participant2Id) {
        nextMatch.participant2Id = completedMatch.winnerId;
      }
      
      // If both participants are now set, update status to pending
      if (nextMatch.participant1Id && nextMatch.participant2Id) {
        nextMatch.status = "pending";
      }
      
      this.matches.set(nextMatch.id, nextMatch);
    }
  }

  

  

  async deleteMatch(id: number): Promise<boolean> {
    return this.matches.delete(id);
  }

  async generateBracket(division: string): Promise<Match[]> {
    const participants = await this.getParticipantsByDivision(division);
    const existingMatches = await this.getMatchesByDivision(division);
    
    if (participants.length < 2) {
      return existingMatches;
    }

    // Clear existing matches for this division to regenerate
    existingMatches.forEach(match => this.matches.delete(match.id));

    const matches: Match[] = [];
    const participantCount = participants.length;
    
    // Calculate bracket size (next power of 2)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));
    const totalRounds = Math.ceil(Math.log2(bracketSize));
    
    // Shuffle participants
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    // Generate first round matches
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
      
      // If only one participant, auto-advance them
      if (!participant2) {
        match.winnerId = participant1.id;
        match.status = "completed";
        this.matches.set(match.id, match);
      }
      
      matches.push(match);
    }
    
    // Generate subsequent rounds (empty matches for now)
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
        matches.push(match);
      }
    }
    
    return matches;
  }
}

export const storage = new MemStorage();
