import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, UserPlus, Settings, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import DivisionCard from "@/components/division-card";
import RegistrationModal from "@/components/registration-modal";
import type { Participant } from "@shared/schema";

export default function Tournament() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const { data: participants = [], isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
  });

  const getParticipantsByDivision = (division: string) => {
    return participants.filter(p => p.division === division);
  };

  const divisionStats = {
    elite: getParticipantsByDivision("elite").length,
    division1: getParticipantsByDivision("division1").length,
    division2: getParticipantsByDivision("division2").length,
    recruits: getParticipantsByDivision("recruits").length,
    champions: 0, // Champions are tracked through matches, not participants
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando torneo...</div>
      </div>
    );
  }

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
                  RNG Torneo PVP
                </h1>
                <p className="text-yellow-400/70 text-sm">Torneo Competitivo</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/bracket">
                <Button
                  variant="outline"
                  className="border-purple-600 text-purple-400 hover:bg-purple-600/20 transition-all duration-300"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Tabla
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20 transition-all duration-300"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Panel Admin
                </Button>
              </Link>
              <Button
                onClick={() => setIsRegistrationOpen(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Inscribirse
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-black via-yellow-900/20 to-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              TORNEO PVP
            </h2>
            <p className="text-xl text-yellow-300 mb-8">
              Compite en diferentes divisiones y demuestra tu habilidad en el campo de batalla
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/80 backdrop-blur rounded-lg p-4 border border-yellow-600/30">
                <div className="text-2xl font-bold elite-color">{divisionStats.elite}</div>
                <div className="text-sm text-yellow-400/70">División ELITE</div>
              </div>
              <div className="bg-black/80 backdrop-blur rounded-lg p-4 border border-yellow-600/30">
                <div className="text-2xl font-bold division1-color">{divisionStats.division1}</div>
                <div className="text-sm text-yellow-400/70">División 1</div>
              </div>
              <div className="bg-black/80 backdrop-blur rounded-lg p-4 border border-yellow-600/30">
                <div className="text-2xl font-bold division2-color">{divisionStats.division2}</div>
                <div className="text-sm text-yellow-400/70">División 2</div>
              </div>
              <div className="bg-black/80 backdrop-blur rounded-lg p-4 border border-yellow-600/30">
                <div className="text-2xl font-bold recruits-color">{divisionStats.recruits}</div>
                <div className="text-sm text-yellow-400/70">División RECLUTAS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divisions */}
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          <DivisionCard 
            division="elite"
            participants={getParticipantsByDivision("elite")}
          />
          <DivisionCard 
            division="division1"
            participants={getParticipantsByDivision("division1")}
          />
          <DivisionCard 
            division="division2"
            participants={getParticipantsByDivision("division2")}
          />
          <DivisionCard 
            division="recruits"
            participants={getParticipantsByDivision("recruits")}
          />
          
          {/* Champions Division */}
          <div className="bg-black/80 backdrop-blur rounded-lg border-2 border-purple-600/50 p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                DIVISIÓN CAMPEONES
              </h2>
              <div className="flex justify-center mb-4">
                <Link href="/bracket?division=champions">
                  <Button
                    variant="outline"
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                  >
                    Ver Tabla
                  </Button>
                </Link>
              </div>
              <p className="text-purple-300 text-sm mb-4">
                Los campeones de cada división se enfrentan aquí para determinar el campeón supremo del torneo.
              </p>
              <div className="text-center py-4 text-purple-400/60">
                Los enfrentamientos aparecerán cuando haya campeones de divisiones
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-yellow-600/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <img 
                src="https://cdn.discordapp.com/icons/1378580710410944603/a_1324855d9722b1628ce0b16c587c69af.gif?size=2048"
                alt="RNG Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                RNG Torneo PVP
              </span>
            </div>
            <p className="text-yellow-400/70 text-sm">
              Torneo competitivo de alta calidad • © 2025 RNG Torneo PVP
            </p>
          </div>
        </div>
      </footer>

      <RegistrationModal 
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
      />
    </div>
  );
}
