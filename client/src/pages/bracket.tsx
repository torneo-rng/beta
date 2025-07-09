import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Match, Participant } from "@shared/schema";

interface BracketMatchProps {
  match: Match;
  participants: Participant[];
  round: number;
  isLastRound: boolean;
}

function BracketMatch({ match, participants, round, isLastRound }: BracketMatchProps) {
  const participant1 = participants.find(p => p.id === match.participant1Id);
  const participant2 = participants.find(p => p.id === match.participant2Id);
  const winner = participants.find(p => p.id === match.winnerId);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "border-green-500/50 bg-green-500/10";
      case "in_progress": return "border-yellow-500/50 bg-yellow-500/10";
      default: return "border-gray-600/50 bg-gray-800/30";
    }
  };

  return (
    <div className={`relative bg-black/80 backdrop-blur rounded-lg border-2 border-yellow-600/30 ${getStatusColor(match.status)} p-3 min-w-[200px] min-h-[80px]`}>
      {isLastRound && (
        <div className="absolute -top-2 -right-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
        </div>
      )}
      
      <div className="space-y-2">
        <div className="text-xs font-semibold text-yellow-400">
          R{round} - M{match.matchNumber}
        </div>
        
        <div className="space-y-1">
          <div className={`text-sm p-1 rounded ${participant1?.id === match.winnerId ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'text-gray-300'}`}>
            {participant1?.playerName || "TBD"}
          </div>
          <div className="text-gray-500 text-xs text-center">vs</div>
          <div className={`text-sm p-1 rounded ${participant2?.id === match.winnerId ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'text-gray-300'}`}>
            {participant2?.playerName || "TBD"}
          </div>
        </div>
        
        {match.status === "completed" && winner && (
          <div className="text-xs text-center text-yellow-400 font-semibold animate-pulse">
            <Crown className="inline-block w-3 h-3 mr-1" />
            {winner.playerName}
          </div>
        )}
        
        {match.status === "in_progress" && (
          <div className="text-xs text-center text-orange-400 font-semibold">
            🔴 EN VIVO
          </div>
        )}
      </div>
    </div>
  );
}

export default function Bracket() {
  const [selectedDivision, setSelectedDivision] = useState<string>("elite");

  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches", selectedDivision],
    queryFn: async () => {
      const response = await fetch(`/api/matches/${selectedDivision}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    },
    refetchInterval: 1000, // Refetch every second for real-time updates
  });

  const divisions = [
    { key: "elite", name: "División ELITE", color: "text-red-400" },
    { key: "division1", name: "División 1", color: "text-yellow-400" },
    { key: "division2", name: "División 2", color: "text-green-400" },
    { key: "recruits", name: "División RECLUTAS", color: "text-gray-400" },
  ];

  const divisionMatches = matches.filter(m => m.division === selectedDivision);
  const divisionParticipants = participants.filter(p => p.division === selectedDivision);
  const maxRounds = Math.max(...divisionMatches.map(m => m.round), 1);

  const selectedDivisionData = divisions.find(d => d.key === selectedDivision);

  const getMatchesByRound = (round: number) => {
    return divisionMatches.filter(m => m.round === round).sort((a, b) => a.matchNumber - b.matchNumber);
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-lg border-b border-yellow-600/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="https://cdn.discordapp.com/icons/1378580710410944603/a_1324855d9722b1628ce0b16c587c69af.gif?size=2048"
                alt="RNG Logo"
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Tabla de Clasificación
                </h1>
                <p className="text-yellow-400/70 text-sm"></p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="border-purple-600 text-purple-400 hover:bg-purple-600/20 transition-all duration-300"
                >
                  Panel Admin
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20 transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Torneo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Division Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/80 backdrop-blur rounded-lg border border-yellow-600/30 p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-300 font-medium">División:</span>
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger className="w-[200px] bg-black border-yellow-600/30 text-yellow-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-yellow-600/30">
                  {divisions.map((division) => (
                    <SelectItem key={division.key} value={division.key}>
                      <span className={division.color}>{division.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Division Title */}
        <div className="text-center mb-8">
          <h2 className={`text-4xl font-bold ${selectedDivisionData?.color}`}>
            {selectedDivisionData?.name}
          </h2>
          <p className="text-yellow-400/70 mt-2">
            {divisionParticipants.length} participantes registrados
          </p>
        </div>

        {/* Bracket */}
        {divisionMatches.length > 0 ? (
          <div className="bg-black/40 backdrop-blur rounded-lg border border-yellow-600/30 p-8 overflow-x-auto">
            <div className="flex gap-12 min-w-max justify-center">
              {Array.from({ length: maxRounds }, (_, i) => {
                const round = i + 1;
                const roundMatches = getMatchesByRound(round);
                const isLastRound = round === maxRounds;
                
                return (
                  <div key={round} className="flex flex-col gap-4 items-center">
                    <div className="text-sm font-semibold text-yellow-400 mb-2">
                      {isLastRound ? "FINAL" : `RONDA ${round}`}
                    </div>
                    
                    <div className="flex flex-col gap-6">
                      {roundMatches.map((match) => (
                        <BracketMatch
                          key={match.id}
                          match={match}
                          participants={divisionParticipants}
                          round={round}
                          isLastRound={isLastRound}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-yellow-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">
              Sin tabla generada
            </h3>
            <p className="text-yellow-400/70">
              Se necesitan al menos 2 participantes para generar la tabla de clasificación.
            </p>
            <Link href="/">
              <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">
                Registrar Participantes
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}