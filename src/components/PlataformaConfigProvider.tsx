"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface PlataformaConfigValue {
  logoUrl: string | null;
  cargando: boolean;
  refrescar: () => Promise<void>;
}

const PlataformaConfigContext = createContext<PlataformaConfigValue>({
  logoUrl: null,
  cargando: true,
  refrescar: async () => {},
});

export function PlataformaConfigProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("plataforma_config").select("logo_url").eq("id", 1).maybeSingle();
    setLogoUrl(data?.logo_url ?? null);
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de la config global al montar
    cargar();
  }, [cargar]);

  return (
    <PlataformaConfigContext.Provider value={{ logoUrl, cargando, refrescar: cargar }}>
      {children}
    </PlataformaConfigContext.Provider>
  );
}

export function usePlataformaConfig() {
  return useContext(PlataformaConfigContext);
}
