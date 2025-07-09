import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Participant } from "@shared/schema";

interface ParticipantTableProps {
  participants: Participant[];
  division: "elite" | "division1" | "division2" | "recruits";
}

const divisionColors = {
  elite: "elite-color",
  division1: "division1-color",
  division2: "division2-color",
  recruits: "recruits-color",
};

const getAvatarGradient = (division: string, index: number) => {
  const gradients = {
    elite: ["from-red-500 to-pink-500", "from-red-500 to-orange-500", "from-red-500 to-purple-500"],
    division1: ["from-amber-500 to-yellow-600", "from-amber-500 to-red-500", "from-amber-500 to-orange-600"],
    division2: ["from-emerald-500 to-teal-600", "from-emerald-500 to-blue-600", "from-emerald-500 to-green-600"],
    recruits: ["from-slate-500 to-slate-600", "from-slate-500 to-indigo-600", "from-slate-500 to-gray-600"],
  };
  return gradients[division as keyof typeof gradients][index % 3];
};

export default function ParticipantTable({ participants, division }: ParticipantTableProps) {
  const colorClass = divisionColors[division];

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No hay participantes inscritos en esta división</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-yellow-600/30">
            <TableHead className="text-yellow-300 font-semibold">Posición</TableHead>
            <TableHead className="text-yellow-300 font-semibold">Jugador</TableHead>
            <TableHead className="text-yellow-300 font-semibold">Puntuación</TableHead>
            <TableHead className="text-yellow-300 font-semibold">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant, index) => (
            <TableRow key={participant.id} className="border-b border-yellow-600/20 hover:bg-yellow-600/10 transition-colors">
              <TableCell>
                <span className={`inline-flex items-center justify-center w-8 h-8 bg-black/60 ${colorClass} rounded-full text-sm font-bold border border-yellow-600/30`}>
                  {index + 1}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarGradient(division, index)} rounded-full`}></div>
                  <div>
                    <div className="font-medium">{participant.playerName}</div>
                    <div className="text-sm text-yellow-400/60">@{participant.discordUser}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className={`${colorClass} font-semibold`}>
                {participant.score?.toLocaleString() || "0"}
              </TableCell>
              <TableCell>
                <Badge 
                  className={`${participant.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {participant.status === 'active' ? 'Activo' : 'En juego'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
