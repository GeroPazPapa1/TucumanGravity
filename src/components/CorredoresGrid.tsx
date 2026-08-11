"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RiderAvatar from "@/components/RiderAvatar";
import { getCategoryAccent } from "@/components/categoryColors";
import CategoryTabs from "@/components/CategoryTabs";
import { useEnTorneo } from "@/lib/useEnTorneo";

interface Categoria {
  id: string;
  nombre: string;
  orden: number;
}

interface Corredor {
  id: string;
  nombre: string;
  categoriaId: string | null;
  categoriaNombre: string | null;
  categoriaSlug: string | null;
  fotoUrl: string | null;
}

interface CorredoresGridProps {
  torneoId: string;
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

export default function CorredoresGrid({ torneoId, categorias, filtroActivo, corredores }: CorredoresGridProps) {
  const enTorneo = useEnTorneo();
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const border = enTorneo ? "border-tg-border" : "border-plat-border";
  const surface = enTorneo ? "bg-tg-surface" : "bg-plat-surface";
  const hoverBorder = enTorneo ? "hover:border-tg-green/50" : "hover:border-plat-celeste/50";

  return (
    <>
      <CategoryTabs
        categorias={categorias}
        activa={filtroActivo}
        basePath={`/t/${torneoId}/corredores`}
        extra={{ id: "todos", nombre: "Todos" }}
      />

      {corredores.length === 0 ? (
        <p className={`text-center text-sm py-10 ${dim}`}>
          Todavía no hay corredores registrados en esta categoría.
        </p>
      ) : (
        <motion.ul initial="hidden" animate="show" variants={listVariants} className="grid grid-cols-2 gap-3">
          {corredores.map((corredor) => {
            const accent = getCategoryAccent(corredor.categoriaSlug ?? "", !enTorneo);
            return (
              <motion.li key={corredor.id} variants={itemVariants}>
                <Link
                  href={`/t/${torneoId}/corredores/${corredor.id}`}
                  className={`flex flex-col items-center gap-2 rounded-xl border ${border} ${surface} p-4 text-center transition-all ${hoverBorder} hover:-translate-y-0.5 h-full`}
                >
                  <RiderAvatar nombre={corredor.nombre} fotoUrl={corredor.fotoUrl} categoriaId={corredor.categoriaSlug ?? ""} size={64} />
                  <p className="font-semibold text-sm leading-tight">{corredor.nombre}</p>
                  <span className={`text-[10px] uppercase tracking-widest font-semibold ${accent.text}`}>
                    {corredor.categoriaNombre}
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
