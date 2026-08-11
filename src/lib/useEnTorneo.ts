"use client";

import { usePathname } from "next/navigation";

/**
 * true si la ruta actual debe verse en el tema oscuro de Antigravity.
 * Solo el torneo Tucumán Gravity conserva ese diseño; toda la app
 * (selector, cuenta, y el resto de los torneos) usa el tema claro/celeste.
 */
export function useEnTorneo(): boolean {
  const pathname = usePathname();
  return pathname?.startsWith("/t/tucuman-gravity") ?? false;
}
