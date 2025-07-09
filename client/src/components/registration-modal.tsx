import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X, UserPlus, Crown, Medal, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertParticipantSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegistrationModal({ open, onOpenChange }: RegistrationModalProps) {
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(insertParticipantSchema),
    defaultValues: {
      playerName: "",
      discordUser: "",
      robloxUser: "",
      division: "",
      experience: "",
    },
  });

  const createParticipantMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const response = await apiRequest("POST", "/api/participants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "¡Inscripción exitosa!",
        description: "Te has registrado correctamente en el torneo.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error en la inscripción",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: typeof form.getValues) => {
    createParticipantMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-yellow-600/30 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400">
            Inscripción al Torneo
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="playerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-yellow-300">
                    Nombre de Jugador *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa tu nombre de jugador"
                      className="bg-black border-yellow-600/30 text-yellow-400 placeholder-yellow-400/50 focus:border-yellow-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discordUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-yellow-300">
                    Usuario de Discord *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="usuario#1234"
                      className="bg-black border-yellow-600/30 text-yellow-400 placeholder-yellow-400/50 focus:border-yellow-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="robloxUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-yellow-300">
                    Usuario de Roblox *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="NombreUsuario"
                      className="bg-black border-yellow-600/30 text-yellow-400 placeholder-yellow-400/50 focus:border-yellow-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-yellow-300">
                    División *
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black border-yellow-600/30 text-yellow-400 focus:border-yellow-500">
                        <SelectValue placeholder="Selecciona una división" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black border-yellow-600/30">
                      <SelectItem value="elite" className="elite-color">División ELITE</SelectItem>
                      <SelectItem value="division1" className="division1-color">División 1</SelectItem>
                      <SelectItem value="division2" className="division2-color">División 2</SelectItem>
                      <SelectItem value="recruits" className="recruits-color">División RECLUTAS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-yellow-300">
                    Nivel de Experiencia
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black border-yellow-600/30 text-yellow-400 focus:border-yellow-500">
                        <SelectValue placeholder="Selecciona tu nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black border-yellow-600/30">
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-black/60 rounded-lg p-4 border border-yellow-600/30">
              <h4 className="font-semibold text-yellow-300 mb-2">Información de Divisiones</h4>
              <div className="space-y-2 text-sm text-yellow-400/70">
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 elite-color" />
                  <span><strong className="elite-color">ELITE:</strong> Jugadores profesionales y altamente experimentados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Medal className="h-4 w-4 division1-color" />
                  <span><strong className="division1-color">División 1:</strong> Jugadores experimentados con buenas habilidades</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 division2-color" />
                  <span><strong className="division2-color">División 2:</strong> Jugadores intermedios en desarrollo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 recruits-color" />
                  <span><strong className="recruits-color">RECLUTAS:</strong> Nuevos jugadores y principiantes</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <Button 
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-black border-yellow-600/30 hover:bg-yellow-600/20 text-yellow-400"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createParticipantMutation.isPending}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {createParticipantMutation.isPending ? "Inscribiendo..." : "Inscribirse"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
