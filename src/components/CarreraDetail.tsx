"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { EstadoCarrera } from "@/lib/supabase/types";
import ResultadosPorFecha, { type GrupoCategoria } from "@/components/ResultadosPorFecha";

interface Carrera {
  id: string;
  numero: number;
  nombre: string;
  lugar: string;
  lat: number;
  lng: number;
  estado: EstadoCarrera;
}

export default function CarreraDetail({
  carrera,
  torneoId,
  grupos,
}: {
  carrera: Carrera;
  torneoId: string;
  grupos: GrupoCategoria[];
}) {
  const mapaEmbedSrc = `https://www.google.com/maps?q=${carrera.lat},${carrera.lng}&z=14&output=embed`;
  const comoLlegarHref = `https://www.google.com/maps/search/?api=1&query=${carrera.lat},${carrera.lng}`;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
      <Link href={`/t/${torneoId}/carreras`} className="text-xs uppercase tracking-wide text-tg-text-dim hover:text-tg-green">
        ← Todas las carreras
      </Link>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-tg-green font-semibold">
          Fecha {carrera.numero} · {carrera.estado === "disputada" ? "Disputada" : "Próxima"}
        </p>
        <h1 className="font-display text-3xl tracking-wide">{carrera.nombre}</h1>
        <p className="text-tg-text-dim text-sm">{carrera.lugar}</p>
      </div>

      <div className="rounded-xl overflow-hidden border border-tg-border aspect-video">
        <iframe
          src={mapaEmbedSrc}
          className="w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa de ${carrera.nombre}`}
        />
      </div>

      <a
        href={comoLlegarHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center rounded-lg border border-tg-green text-tg-green font-semibold uppercase tracking-wide text-sm py-3 transition-colors hover:bg-tg-green hover:text-tg-bg"
      >
        Cómo llegar en Google Maps
      </a>

      <div className="rounded-xl border border-dashed border-tg-border bg-tg-surface/60 p-4 flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-tg-green opacity-60 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-tg-green" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-tg-text-dim">Tiempos en vivo</p>
          <p className="text-sm text-tg-text-dim mt-0.5">
            Acá va a ir el cronometraje en vivo de Cronometraje Instantáneo el día de la carrera — espacio
            reservado, listo para conectar.
          </p>
        </div>
      </div>

      {grupos.length > 0 ? (
        <ResultadosPorFecha grupos={grupos} />
      ) : (
        <div className="rounded-lg border border-tg-border bg-tg-surface p-4 text-sm text-tg-text-dim">
          {carrera.estado === "disputada"
            ? "El organizador todavía no cargó el detalle por corredor de esta fecha. El acumulado general ya refleja su impacto igual."
            : "Todavía no se corrió esta fecha. Cuando se dispute, el organizador va a cargar los resultados y el ranking se actualiza solo."}
        </div>
      )}
    </motion.div>
  );
}
