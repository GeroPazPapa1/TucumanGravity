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
  cargando: boolean;
  refrescarPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  perfil: null,
  rol: null,
  cargando: true,
  refrescarPerfil: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarPerfil = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("perfiles").select("*").eq("id", userId).single();
    setPerfil(data ?? null);
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
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [cargarPerfil]);

  return (
    <AuthContext.Provider value={{ user, perfil, rol: perfil?.rol ?? null, cargando, refrescarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
