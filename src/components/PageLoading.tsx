"use client";

import { useEnTorneo } from "@/lib/useEnTorneo";

export default function PageLoading() {
  const enTorneo = useEnTorneo();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <div
        className={`w-9 h-9 rounded-full border-2 animate-spin ${
          enTorneo ? "border-tg-border border-t-tg-green" : "border-plat-border border-t-plat-celeste"
        }`}
      />
      <p className={`text-xs uppercase tracking-widest ${enTorneo ? "text-tg-text-dim" : "text-plat-text-dim"}`}>
        Cargando…
      </p>
    </div>
  );
}
