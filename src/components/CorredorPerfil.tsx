"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RiderAvatar from "@/components/RiderAvatar";
import { getCategoryAccent } from "@/components/categoryColors";

interface CorredorPerfilProps {
  torneoId: string;
  torneoNombre: string;
  nombre: string;
  fotoUrl: string | null;
  bici: string | null;
  equipo: string | null;
  numero: number | null;
  categoriaNombre: string | null;
  categoriaSlug: string | null;
  posicion: number | null;
  totalPuntos: number | null;
}

export default function CorredorPerfil({
  torneoId,
  torneoNombre,
  nombre,
  fotoUrl,
  bici,
  equipo,
  numero,
  categoriaNombre,
  categoriaSlug,
  posicion,
  totalPuntos,
}: CorredorPerfilProps) {
  const accent = getCategoryAccent(categoriaSlug ?? "");

  const datos: { label: string; value: string }[] = [];
  if (numero) datos.push({ label: "Número", value: `#${numero}` });
  if (bici) datos.push({ label: "Bici", value: bici });
  if (equipo) datos.push({ label: "Equipo", value: equipo });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
      <Link href={`/t/${torneoId}/corredores`} className="text-xs uppercase tracking-wide text-tg-text-dim hover:text-tg-green">
        ← Todos los corredores
      </Link>

      <div className="flex flex-col items-center text-center gap-3 relative pt-2">
        <div className="absolute inset-x-0 top-0 h-24 tg-gradient-bar opacity-20 blur-2xl -z-10 rounded-full" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
          <RiderAvatar nombre={nombre} fotoUrl={fotoUrl} categoriaId={categoriaSlug ?? ""} size={128} />
        </motion.div>
        <div>
          <h1 className="font-display text-2xl tracking-wide">{nombre}</h1>
          {categoriaNombre && (
            <span className={`inline-block mt-1 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${accent.border} ${accent.bg} ${accent.text}`}>
              {categoriaNombre}
            </span>
          )}
        </div>
      </div>

      {posicion !== null && totalPuntos !== null && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-tg-border bg-tg-surface p-4 text-center">
            <p className="font-display text-3xl text-tg-green">{posicion}°</p>
            <p className="text-[11px] uppercase tracking-widest text-tg-text-dim mt-1">en {categoriaNombre}</p>
          </div>
          <div className="rounded-xl border border-tg-border bg-tg-surface p-4 text-center">
            <p className="font-display text-3xl text-tg-green">{totalPuntos}</p>
            <p className="text-[11px] uppercase tracking-widest text-tg-text-dim mt-1">puntos acumulados</p>
          </div>
        </div>
      )}

      {datos.length > 0 && (
        <div className="rounded-xl border border-tg-border bg-tg-surface divide-y divide-tg-border">
          {datos.map((dato) => (
            <div key={dato.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs uppercase tracking-widest text-tg-text-dim">{dato.label}</span>
              <span className="font-semibold">{dato.value}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-tg-text-dim px-4">
        {categoriaNombre
          ? `Parte de ${torneoNombre}. Corriendo en ${categoriaNombre}, temporada tras temporada.`
          : `Parte de ${torneoNombre}.`}
      </p>
    </motion.div>
  );
}
