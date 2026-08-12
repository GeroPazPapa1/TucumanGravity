"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RiderAvatar from "./RiderAvatar";
import { useEnTorneo } from "@/lib/useEnTorneo";

export interface FilaRanking {
  corredorId: string;
  nombre: string;
  numero: number | null;
  bici: string | null;
  equipo: string | null;
  fotoUrl: string | null;
  categoriaSlug: string;
  totalPuntos: number;
  esPrecarga: boolean;
  cantFechas?: number;
  puntosDescartados?: number;
  puntosPresentismo?: number;
  puntosRegionalBonus?: number;
}

interface RankingListProps {
  filas: FilaRanking[];
  torneoId: string;
  reglasActivas?: boolean;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

export default function RankingList({ filas, torneoId, reglasActivas = false }: RankingListProps) {
  const enTorneo = useEnTorneo();
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const border = enTorneo ? "border-tg-border" : "border-plat-border";
  const surface = enTorneo ? "bg-tg-surface" : "bg-plat-surface";
  const surfaceMuted = enTorneo ? "bg-tg-surface/60 hover:bg-tg-surface" : "bg-plat-surface/60 hover:bg-plat-surface";
  const accentText = enTorneo ? "text-tg-green" : "text-plat-celeste";

  if (filas.length === 0) {
    return (
      <p className={`text-center text-sm py-10 ${dim}`}>
        Todavía no hay corredores cargados en esta categoría.
      </p>
    );
  }

  return (
    <motion.ol initial="hidden" animate="show" variants={listVariants} className="flex flex-col gap-2">
      {filas.map((fila, index) => {
        const posicion = index + 1;
        const podio = posicion <= 3;
        const oro = posicion === 1;

        const detalles: string[] = [];
        if (reglasActivas && !fila.esPrecarga) {
          if (fila.cantFechas !== undefined) {
            detalles.push(`${fila.cantFechas} fecha${fila.cantFechas === 1 ? "" : "s"} corrida${fila.cantFechas === 1 ? "" : "s"}`);
          }
          if (fila.puntosPresentismo) detalles.push(`+${fila.puntosPresentismo} presentismo`);
          if (fila.puntosDescartados) detalles.push(`-${fila.puntosDescartados} descarte`);
          if (fila.puntosRegionalBonus) detalles.push(`+${fila.puntosRegionalBonus} bono regional`);
        }

        const contenido = (
          <>
            {podio && <div className="absolute left-0 top-0 bottom-0 w-1 tg-gradient-bar-animated" />}
            <span className={`font-display text-2xl w-8 text-center shrink-0 ${dim}`}>{posicion}</span>
            <RiderAvatar nombre={fila.nombre} fotoUrl={fila.fotoUrl} categoriaId={fila.categoriaSlug} size={44} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate flex items-center gap-2">
                {fila.nombre}
                {fila.esPrecarga && (
                  <span className={`text-[9px] uppercase tracking-widest border rounded-full px-1.5 py-0.5 ${dim} ${border}`}>
                    sin registrar
                  </span>
                )}
              </p>
              {fila.equipo && <p className={`text-xs truncate ${dim}`}>{fila.equipo}</p>}
              {detalles.length > 0 && (
                <p className={`text-[10px] truncate ${dim}`}>{detalles.join(" · ")}</p>
              )}
            </div>
            <p className={`font-display text-xl shrink-0 ${accentText}`}>{fila.totalPuntos}</p>
          </>
        );

        const className = `flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all hover:-translate-y-0.5 ${border} ${
          podio ? `${surface} relative overflow-hidden ${oro ? "tg-glow-podium" : ""}` : surfaceMuted
        }`;

        return (
          <motion.li key={fila.corredorId} variants={itemVariants}>
            {fila.esPrecarga ? (
              <div className={className}>{contenido}</div>
            ) : (
              <Link href={`/t/${torneoId}/corredores/${fila.corredorId}`} className={className}>
                {contenido}
              </Link>
            )}
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
