"use client";

import { useEnTorneo } from "@/lib/useEnTorneo";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const enTorneo = useEnTorneo();

  return (
    <div
      className={
        enTorneo
          ? "min-h-screen flex flex-col tg-bg-torneo text-tg-text"
          : "min-h-screen flex flex-col plat-bg-app text-plat-text"
      }
    >
      {children}
    </div>
  );
}
