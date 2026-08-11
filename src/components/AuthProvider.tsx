"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database, Rol } from "@/lib/supabase/types";

type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];

interface AuthContextValue {
  user: User | null;
  perfil: Perfil | null;
  rol: Rol | null;
  /** ids de los torneos donde esta cuenta es organizadora. */
  torneosOrganizados: string[];
  /** true si al perfil le falta DNI o fecha de nacimiento. */
  perfilIncompleto: boolean;
  cargando: boolean;
  refrescarPerfil: () => Promise<void>;
  esOrganizadorDe: (torneoId: string) => boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  perfil: null,
  rol: null,
  torneosOrganizados: [],
  perfilIncompleto: false,
  cargando: true,
  refrescarPerfil: async () => {},
  esOrganizadorDe: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [torneosOrganizados, setTorneosOrganizados] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarPerfil = useCallback(async (userId: string) => {
    const supabase = createClient();
    const [{ data: perfilData }, { data: membresias }] = await Promise.all([
      supabase.from("perfiles").select("*").eq("id", userId).single(),
      supabase.from("torneo_miembros").select("torneo_id").eq("perfil_id", userId),
    ]);
    setPerfil(perfilData ?? null);
    setTorneosOrganizados((membresias ?? []).map((m) => m.torneo_id));
  }, []);

  const refrescarPerfil = useCallback(async () => {
    if (user) await cargarPerfil(user.id);
  }, [user, cargarPerfil]);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await cargarPerfil(session.user.id);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await cargarPerfil(session.user.id);
      } else {
        setPerfil(null);
        setTorneosOrganizados([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [cargarPerfil]);

  const rol = perfil?.rol ?? null;
  const perfilIncompleto = !!perfil && (!perfil.dni || !perfil.fecha_nacimiento);
  const esOrganizadorDe = (torneoId: string) => rol === "superadmin" || torneosOrganizados.includes(torneoId);

  return (
    <AuthContext.Provider
      value={{ user, perfil, rol, torneosOrganizados, perfilIncompleto, cargando, refrescarPerfil, esOrganizadorDe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
