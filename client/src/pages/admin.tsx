import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2, Save, X, Lock, Eye, EyeOff, Trophy, RefreshCw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Participant, Match } from "@shared/schema";

interface EditingParticipant {
  id: number;
  playerName: string;
  discordUser: string;
  robloxUser: string;
  division: string;
  experience: string;
  score: number;
  status: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditingParticipant | null>(null);
  const [activeTab, setActiveTab] = useState<"participants" | "bracket">("participants");
  const [selectedDivision, setSelectedDivision] = useState<string>("elite");
  const { toast } = useToast();

  const { data: participants = [], isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches", selectedDivision],
    queryFn: async () => {
      const response = await fetch(`/api/matches/${selectedDivision}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    },
    enabled: isAuthenticated && activeTab === "bracket",
    refetchInterval: 1000, // Refetch every second for real-time updates
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "WLT2000") {
      setIsAuthenticated(true);
      toast({
        title: "Acceso concedido",
        description: "Bienvenido al panel de administración.",
      });
    } else {
      toast({
        title: "Contraseña incorrecta",
        description: "Por favor, verifica la contraseña e intenta de nuevo.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Participant> }) => {
      const response = await apiRequest("PATCH", `/api/participants/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "Participante actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
      setEditingId(null);
      setEditForm(null);
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/participants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "Participante eliminado",
        description: "El participante ha sido removido del torneo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateBracketMutation = useMutation({
    mutationFn: async (division: string) => {
      const response = await apiRequest("POST", `/api/matches/generate/${division}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", selectedDivision] });
      toast({
        title: "Tabla generada",
        description: "La tabla de clasificación ha sido creada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al generar cuadro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Match> }) => {
      const response = await apiRequest("PATCH", `/api/matches/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", selectedDivision] });
      toast({
        title: "Partido actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar partido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startEdit = (participant: Participant) => {
    setEditingId(participant.id);
    setEditForm({
      id: participant.id,
      playerName: participant.playerName,
      discordUser: participant.discordUser,
      robloxUser: participant.robloxUser,
      division: participant.division,
      experience: participant.experience || "",
      score: participant.score || 0,
      status: participant.status || "active",
    });
  };

  const saveEdit = () => {
    if (!editForm) return;
    
    const { id, ...updateData } = editForm;
    updateMutation.mutate({ id, data: updateData });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const getParticipantsByDivision = (division: string) => {
    return participants.filter(p => p.division === division);
  };

  const divisions = [
    { key: "elite", name: "División ELITE", color: "text-red-400" },
    { key: "division1", name: "División 1", color: "text-yellow-400" },
    { key: "division2", name: "División 2", color: "text-green-400" },
    { key: "recruits", name: "División RECLUTAS", color: "text-gray-400" },
    { key: "champions", name: "🏆 CAMPEONES INTER-DIVISIONES", color: "text-purple-400" },
  ];

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6">
          <div className="bg-black/80 backdrop-blur-lg border border-yellow-600/30 rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-500/20 p-4 rounded-full">
                  <Lock className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-yellow-400 mb-2">Panel de Administración</h1>
              <p className="text-yellow-400/70">Ingresa la contraseña para continuar</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-yellow-300 text-sm font-medium">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la contraseña"
                    className="bg-black/50 border-yellow-600/30 text-yellow-400 placeholder:text-yellow-400/50 pr-12"
                    required
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-600/20"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                >
                  Acceder al Panel
                </Button>
                
                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Torneo
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Cargando panel de administración...</div>
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
                  Panel de Administración
                </h1>
                <p className="text-yellow-400/70 text-sm">Gestión de participantes</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAuthenticated(false);
                  setPassword("");
                  toast({
                    title: "Sesión cerrada",
                    description: "Has salido del panel de administración.",
                  });
                }}
                className="border-red-600 text-red-400 hover:bg-red-600/20 transition-all duration-300"
              >
                <Lock className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
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
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/80 backdrop-blur rounded-lg border border-yellow-600/30 p-2 flex gap-2">
            <Button
              variant={activeTab === "participants" ? "default" : "ghost"}
              onClick={() => setActiveTab("participants")}
              className={activeTab === "participants" ? "bg-yellow-500 text-black" : "text-yellow-400 hover:bg-yellow-600/20"}
            >
              <Edit className="mr-2 h-4 w-4" />
              Gestionar Participantes
            </Button>
            <Button
              variant={activeTab === "bracket" ? "default" : "ghost"}
              onClick={() => setActiveTab("bracket")}
              className={activeTab === "bracket" ? "bg-yellow-500 text-black" : "text-yellow-400 hover:bg-yellow-600/20"}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Gestionar Cuadro
            </Button>
          </div>
        </div>

        {activeTab === "participants" && (
          <>
            {divisions.map((division) => {
              const divisionParticipants = getParticipantsByDivision(division.key);
              
              return (
                <div key={division.key} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-3xl font-bold ${division.color}`}>
                  {division.name}
                </h2>
                <div className={`text-lg ${division.color}`}>
                  {divisionParticipants.length} participantes
                </div>
              </div>

              <div className="bg-black/80 backdrop-blur rounded-lg border border-yellow-600/30 overflow-hidden">
                {divisionParticipants.length === 0 ? (
                  <div className="p-8 text-center text-yellow-400/70">
                    No hay participantes en esta división
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-yellow-600/30">
                        <TableHead className="text-yellow-300">Jugador</TableHead>
                        <TableHead className="text-yellow-300">Discord</TableHead>
                        <TableHead className="text-yellow-300">Roblox</TableHead>
                        <TableHead className="text-yellow-300">Experiencia</TableHead>
                        <TableHead className="text-yellow-300">Puntuación</TableHead>
                        <TableHead className="text-yellow-300">Estado</TableHead>
                        <TableHead className="text-yellow-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {divisionParticipants.map((participant) => (
                        <TableRow key={participant.id} className="border-b border-yellow-600/20 hover:bg-yellow-600/10">
                          {editingId === participant.id && editForm ? (
                            <>
                              <TableCell>
                                <Input
                                  value={editForm.playerName}
                                  onChange={(e) => setEditForm({ ...editForm, playerName: e.target.value })}
                                  className="bg-black border-yellow-600/30 text-yellow-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={editForm.discordUser}
                                  onChange={(e) => setEditForm({ ...editForm, discordUser: e.target.value })}
                                  className="bg-black border-yellow-600/30 text-yellow-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={editForm.robloxUser}
                                  onChange={(e) => setEditForm({ ...editForm, robloxUser: e.target.value })}
                                  className="bg-black border-yellow-600/30 text-yellow-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={editForm.experience}
                                  onValueChange={(value) => setEditForm({ ...editForm, experience: value })}
                                >
                                  <SelectTrigger className="bg-black border-yellow-600/30 text-yellow-400">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border-yellow-600/30">
                                    <SelectItem value="beginner">Principiante</SelectItem>
                                    <SelectItem value="intermediate">Intermedio</SelectItem>
                                    <SelectItem value="advanced">Avanzado</SelectItem>
                                    <SelectItem value="professional">Profesional</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={editForm.score}
                                  onChange={(e) => setEditForm({ ...editForm, score: parseInt(e.target.value) || 0 })}
                                  className="bg-black border-yellow-600/30 text-yellow-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={editForm.status}
                                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                                >
                                  <SelectTrigger className="bg-black border-yellow-600/30 text-yellow-400">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border-yellow-600/30">
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="in_game">En juego</SelectItem>
                                    <SelectItem value="inactive">Inactivo</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={saveEdit}
                                    disabled={updateMutation.isPending}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEdit}
                                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="font-medium">{participant.playerName}</TableCell>
                              <TableCell>{participant.discordUser}</TableCell>
                              <TableCell>{participant.robloxUser}</TableCell>
                              <TableCell className="capitalize">{participant.experience || "No especificado"}</TableCell>
                              <TableCell className={`font-bold ${division.color}`}>
                                {participant.score?.toLocaleString() || "0"}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  participant.status === 'active' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : participant.status === 'in_game'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {participant.status === 'active' ? 'Activo' : 
                                   participant.status === 'in_game' ? 'En juego' : 'Inactivo'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEdit(participant)}
                                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteMutation.mutate(participant.id)}
                                    disabled={deleteMutation.isPending}
                                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          );
        })}
          </>
        )}

        {activeTab === "bracket" && (
          <div className="space-y-6">
            {/* Division Selector */}
            <div className="flex justify-center">
              <div className="bg-black/80 backdrop-blur rounded-lg border border-yellow-600/30 p-6">
                <div className="flex items-center space-x-4">
                  <Trophy className="h-5 w-5 text-yellow-400" />
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
                  <Button
                    onClick={() => generateBracketMutation.mutate(selectedDivision)}
                    disabled={generateBracketMutation.isPending}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerar Cuadro
                  </Button>
                </div>
              </div>
            </div>

            {/* Match Management */}
            <div className="bg-black/80 backdrop-blur rounded-lg border border-yellow-600/30 p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">
                Gestionar Partidos - {divisions.find(d => d.key === selectedDivision)?.name}
              </h3>
              
              {matches.length > 0 ? (
                <div className="grid gap-4">
                  {Array.from(new Set(matches.map(m => m.round))).sort().map(round => (
                    <div key={round} className="space-y-2">
                      <h4 className="text-lg font-semibold text-yellow-300">
                        Ronda {round}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {matches.filter(m => m.round === round).map(match => {
                          const participant1 = participants.find(p => p.id === match.participant1Id);
                          const participant2 = participants.find(p => p.id === match.participant2Id);
                          
                          return (
                            <div key={match.id} className="border-2 border-yellow-600/30 bg-black/60 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-yellow-300">
                                  Partido M{match.matchNumber}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  match.status === "completed" ? "bg-green-500/20 text-green-400" :
                                  match.status === "in_progress" ? "bg-yellow-500/20 text-yellow-400" :
                                  "bg-gray-500/20 text-gray-400"
                                }`}>
                                  {match.status === "completed" ? "Completado" :
                                   match.status === "in_progress" ? "En progreso" : "Pendiente"}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className={`p-2 rounded ${participant1?.id === match.winnerId ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'text-gray-300'}`}>
                                  {participant1?.playerName || "TBD"}
                                </div>
                                <div className="text-center text-gray-500 text-xs">vs</div>
                                <div className={`p-2 rounded ${participant2?.id === match.winnerId ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'text-gray-300'}`}>
                                  {participant2?.playerName || "TBD"}
                                </div>
                              </div>
                              
                              {participant1 && participant2 && match.status !== "completed" && (
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      updateMatchMutation.mutate({
                                        id: match.id,
                                        data: { winnerId: participant1.id, status: "completed" }
                                      });
                                    }}
                                    disabled={updateMatchMutation.isPending}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-black transition-all"
                                  >
                                    <Crown className="mr-1 h-3 w-3" />
                                    {participant1.playerName}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      updateMatchMutation.mutate({
                                        id: match.id,
                                        data: { winnerId: participant2.id, status: "completed" }
                                      });
                                    }}
                                    disabled={updateMatchMutation.isPending}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-black transition-all"
                                  >
                                    <Crown className="mr-1 h-3 w-3" />
                                    {participant2.playerName}
                                  </Button>
                                </div>
                              )}
                              
                              {match.status === "completed" && (
                                <div className="mt-3 p-2 bg-green-500/20 rounded text-center">
                                  <span className="text-green-400 text-sm font-semibold">
                                    ✓ Completado - Ganador avanzado automáticamente
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-yellow-400/70">
                  No hay cuadro generado para esta división.
                  <br />
                  <Button
                    onClick={() => generateBracketMutation.mutate(selectedDivision)}
                    disabled={generateBracketMutation.isPending}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Generar Cuadro
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}