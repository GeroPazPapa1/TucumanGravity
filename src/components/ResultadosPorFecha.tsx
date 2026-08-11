"use client";

import { motion } from "framer-motion";
import { useEnTorneo } from "@/lib/useEnTorneo";

export interface ResultadoFila {
  corredorId: string;
  nombre: string;
  posicion: number;
  puntos: number;
}

export interface GrupoCategoria {
  categoriaId: string;
  categoriaNombre: string;
  filas: ResultadoFila[];
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export default function ResultadosPorFecha({ grupos }: { grupos: GrupoCategoria[] }) {
  const enTorneo = useEnTorneo();
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const border = enTorneo ? "border-tg-border" : "border-plat-border";
  const surface = enTorneo ? "bg-tg-surface" : "bg-plat-surface";
  const divide = enTorneo ? "divide-tg-border" : "divide-plat-border";
  const accentText = enTorneo ? "text-tg-green" : "text-plat-celeste";

  if (grupos.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      <p className={`text-[11px] uppercase tracking-widest ${dim}`}>Resultados de esta fecha</p>
      {grupos.map((grupo) => (
        <div key={grupo.categoriaId}>
          <p className={`text-xs uppercase tracking-widest font-semibold mb-2 ${accentText}`}>
            {grupo.categoriaNombre}
          </p>
          <motion.ol
            initial="hidden"
            animate="show"
            variants={listVariants}
            className={`rounded-xl border ${border} ${surface} divide-y ${divide} overflow-hidden`}
          >
            {grupo.filas.map((fila) => (
              <motion.li key={fila.corredorId} variants={itemVariants} className="flex items-center gap-3 px-3 py-2.5">
                <span className={`font-display text-lg w-7 text-center shrink-0 ${dim}`}>
                  {fila.posicion}
                </span>
                <span className="flex-1 text-sm font-semibold truncate">{fila.nombre}</span>
                <span className={`font-display text-base shrink-0 ${accentText}`}>{fila.puntos} pts</span>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      ))}
    </div>
  );
}
