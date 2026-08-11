"use client";

import { useEnTorneo } from "@/lib/useEnTorneo";

const sponsors = [{ nombre: "Radoc" }, { nombre: "Commencal" }];

export default function SponsorFooter() {
  const enTorneo = useEnTorneo();

  const borderCls = enTorneo ? "border-tg-border" : "border-plat-border";
  const dimCls = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const surfaceCls = enTorneo ? "bg-tg-surface" : "bg-plat-surface";

  return (
    <div className={`mt-10 border-t ${borderCls} pt-5`}>
      <p className={`text-center text-[10px] uppercase tracking-[0.2em] ${dimCls} mb-3`}>Sponsors del torneo</p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {sponsors.map((s) => (
          <span
            key={s.nombre}
            className={`px-4 py-2 rounded-md border ${borderCls} ${surfaceCls} font-display text-sm tracking-wide ${dimCls}`}
          >
            {s.nombre}
          </span>
        ))}
        <span className={`px-4 py-2 rounded-md border border-dashed ${borderCls} text-[11px] uppercase tracking-wide ${dimCls} opacity-70`}>
          Espacio para sponsor
        </span>
      </div>
    </div>
  );
}
