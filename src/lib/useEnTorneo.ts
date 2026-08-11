"use client";

import { usePathname } from "next/navigation";

/** true si la ruta actual está adentro de un torneo (/t/[torneo]/...). */
export function useEnTorneo(): boolean {
  const pathname = usePathname();
  return pathname?.startsWith("/t/") ?? false;
}
