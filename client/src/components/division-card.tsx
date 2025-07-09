import { Crown, Medal, Shield, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import ParticipantTable from "./participant-table";
import type { Participant } from "@shared/schema";

interface DivisionCardProps {
  division: "elite" | "division1" | "division2" | "recruits";
  participants: Participant[];
}

const divisionConfig = {
  elite: {
    title: "División ELITE",
    description: "Los mejores jugadores del torneo",
    icon: Crown,
    colorClass: "elite-color",
    borderClass: "border-red-500/30",
    bgClass: "bg-red-500/20",
  },
  division1: {
    title: "División 1",
    description: "Jugadores experimentados",
    icon: Medal,
    colorClass: "division1-color",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/20",
  },
  division2: {
    title: "División 2",
    description: "Jugadores intermedios",
    icon: Shield,
    colorClass: "division2-color",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/20",
  },
  recruits: {
    title: "División RECLUTAS",
    description: "Nuevos jugadores y principiantes",
    icon: Star,
    colorClass: "recruits-color",
    borderClass: "border-slate-500/30",
    bgClass: "bg-slate-500/20",
  },
};

export default function DivisionCard({ division, participants }: DivisionCardProps) {
  const config = divisionConfig[division];
  const Icon = config.icon;

  return (
    <div className={`bg-black/80 backdrop-blur rounded-xl p-6 border ${config.borderClass}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 ${config.bgClass} rounded-lg flex items-center justify-center border ${config.borderClass}`}>
            <Icon className={`${config.colorClass} text-2xl h-8 w-8`} />
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${config.colorClass}`}>{config.title}</h3>
            <p className="text-yellow-400/70">{config.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${config.colorClass}`}>{participants.length}</div>
          <div className="text-sm text-yellow-400/70">Participantes</div>
        </div>
      </div>
      
      <ParticipantTable participants={participants} division={division} />
    </div>
  );
}
