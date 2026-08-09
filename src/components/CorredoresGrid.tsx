"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RiderAvatar from "@/components/RiderAvatar";
import { getCategoryAccent } from "@/components/categoryColors";
import CategoryTabs from "@/components/CategoryTabs";

interface Categoria {
  id: string;
  nombre: string;
  orden: number;
}

interface Corredor {
  id: string;
  nombre: string;
  categoria_id: string | null;
  foto_url: string | null;
}

interface CorredoresGridProps {
  categorias: Categoria[];
  filtroActivo: string;
  corredores: Corredor[];
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function CorredoresGrid({ categorias, filtroActivo, corredores }: CorredoresGridProps) {
  return (
    <>
      <CategoryTabs
        categorias={categorias}
        activa={filtroActivo}
        basePath="/corredores"
        extra={{ id: "todos", nombre: "Todos" }}
      />

      {corredores.length === 0 ? (
        <p className="text-center text-tg-text-dim text-sm py-10">
          Todavía no hay corredores registrados en esta categoría.
        </p>
      ) : (
        <motion.ul initial="hidden" animate="show" variants={listVariants} className="grid grid-cols-2 gap-3">
          {corredores.map((corredor) => {
            const categoria = categorias.find((c) => c.id === corredor.categoria_id);
            const accent = getCategoryAccent(corredor.categoria_id ?? "");
            return (
              <motion.li key={corredor.id} variants={itemVariants}>
                <Link
                  href={`/corredores/${corredor.id}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-tg-border bg-tg-surface p-4 text-center transition-all hover:border-tg-green/50 hover:-translate-y-0.5 h-full"
                >
                  <RiderAvatar nombre={corredor.nombre} fotoUrl={corredor.foto_url} categoriaId={corredor.categoria_id ?? ""} size={64} />
                  <p className="font-semibold text-sm leading-tight">{corredor.nombre}</p>
                  <span className={`text-[10px] uppercase tracking-widest font-semibold ${accent.text}`}>
                    {categoria?.nombre}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </>
  );
}
