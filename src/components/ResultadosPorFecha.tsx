"use client";

import { motion } from "framer-motion";

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
  if (grupos.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[11px] uppercase tracking-widest text-tg-text-dim">Resultados de esta fecha</p>
      {grupos.map((grupo) => (
        <div key={grupo.categoriaId}>
          <p className="text-xs uppercase tracking-widest text-tg-green font-semibold mb-2">
            {grupo.categoriaNombre}
          </p>
          <motion.ol
            initial="hidden"
            animate="show"
            variants={listVariants}
            className="rounded-xl border border-tg-border bg-tg-surface divide-y divide-tg-border overflow-hidden"
          >
            {grupo.filas.map((fila) => (
              <motion.li key={fila.corredorId} variants={itemVariants} className="flex items-center gap-3 px-3 py-2.5">
                <span className="font-display text-lg w-7 text-center text-tg-text-dim shrink-0">
                  {fila.posicion}
                </span>
                <span className="flex-1 text-sm font-semibold truncate">{fila.nombre}</span>
                <span className="font-display text-tg-green text-base shrink-0">{fila.puntos} pts</span>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      ))}
    </div>
  );
}
