"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { EstadoCarrera } from "@/lib/supabase/types";
import ResultadosPorFecha, { type GrupoCategoria } from "@/components/ResultadosPorFecha";
import { useEnTorneo } from "@/lib/useEnTorneo";

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
  requiereFederado = false,
}: {
  carrera: Carrera;
  torneoId: string;
  grupos: GrupoCategoria[];
  requiereFederado?: boolean;
}) {
  const enTorneo = useEnTorneo();
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const border = enTorneo ? "border-tg-border" : "border-plat-border";
  const surface = enTorneo ? "bg-tg-surface" : "bg-plat-surface";
  const surfaceMuted = enTorneo ? "bg-tg-surface/60" : "bg-plat-surface/60";
  const accentText = enTorneo ? "text-tg-green" : "text-plat-celeste";
  const accentBorder = enTorneo ? "border-tg-green" : "border-plat-celeste";
  const accentBg = enTorneo ? "bg-tg-green" : "bg-plat-celeste";
  const hoverBg = enTorneo ? "hover:bg-tg-green" : "hover:bg-plat-celeste";
  const hoverBgText = enTorneo ? "hover:text-tg-bg" : "hover:text-white";
  const hoverAccent = enTorneo ? "hover:text-tg-green" : "hover:text-plat-celeste";

  const mapaEmbedSrc = `https://www.google.com/maps?q=${carrera.lat},${carrera.lng}&z=14&output=embed`;
  const comoLlegarHref = `https://www.google.com/maps/search/?api=1&query=${carrera.lat},${carrera.lng}`;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
      <Link href={`/t/${torneoId}/carreras`} className={`text-xs uppercase tracking-wide ${dim} ${hoverAccent}`}>
        ← Todas las carreras
      </Link>

      <div>
        <p className={`text-[11px] uppercase tracking-widest font-semibold ${accentText}`}>
          Fecha {carrera.numero} · {carrera.estado === "disputada" ? "Disputada" : "Próxima"}
        </p>
        <h1 className="font-display text-3xl tracking-wide">{carrera.nombre}</h1>
        <p className={`text-sm ${dim}`}>{carrera.lugar}</p>
      </div>

      <div className={`rounded-xl overflow-hidden border aspect-video ${border}`}>
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
        className={`text-center rounded-lg border font-semibold uppercase tracking-wide text-sm py-3 transition-colors ${accentBorder} ${accentText} ${hoverBg} ${hoverBgText}`}
      >
        Cómo llegar en Google Maps
      </a>

      <div className={`rounded-xl border border-dashed p-4 flex items-center gap-3 ${border} ${surfaceMuted}`}>
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${accentBg}`} />
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${accentBg}`} />
        </span>
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-widest ${dim}`}>Tiempos en vivo</p>
          <p className={`text-sm mt-0.5 ${dim}`}>
            Acá va a ir el cronometraje en vivo de Cronometraje Instantáneo el día de la carrera — espacio
            reservado, listo para conectar.
          </p>
        </div>
      </div>

      {grupos.length > 0 ? (
        <ResultadosPorFecha grupos={grupos} requiereFederado={requiereFederado} />
      ) : (
        <div className={`rounded-lg border p-4 text-sm ${border} ${surface} ${dim}`}>
          {carrera.estado === "disputada"
            ? "El organizador todavía no cargó el detalle por corredor de esta fecha. El acumulado general ya refleja su impacto igual."
            : "Todavía no se corrió esta fecha. Cuando se dispute, el organizador va a cargar los resultados y el ranking se actualiza solo."}
        </div>
      )}
    </motion.div>
  );
}
