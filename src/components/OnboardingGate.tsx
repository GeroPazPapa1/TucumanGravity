"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const RUTAS_EXENTAS = ["/completar-perfil", "/registro", "/ingresar"];

export default function OnboardingGate() {
  const { user, perfilIncompleto, cargando } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;
    if (!user || !perfilIncompleto) return;
    if (RUTAS_EXENTAS.some((ruta) => pathname?.startsWith(ruta))) return;

    router.replace("/completar-perfil");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, perfilIncompleto, cargando, pathname]);

  return null;
}
