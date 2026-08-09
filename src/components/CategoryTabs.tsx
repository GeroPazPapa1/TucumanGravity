"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CategoriaTab {
  id: string;
  nombre: string;
  orden: number;
}

interface CategoryTabsProps {
  categorias: CategoriaTab[];
  activa: string;
  basePath: string;
  extra?: { id: string; nombre: string };
}

export default function CategoryTabs({ categorias, activa, basePath, extra }: CategoryTabsProps) {
  const tabs = extra ? [extra, ...categorias.slice().sort((a, b) => a.orden - b.orden)] : categorias.slice().sort((a, b) => a.orden - b.orden);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activa;
        return (
          <Link
            key={tab.id}
            href={`${basePath}?categoria=${tab.id}`}
            className="relative shrink-0 inline-block"
          >
            {isActive && (
              <motion.span
                layoutId={`tabs-${basePath}`}
                className="absolute inset-0 rounded-full bg-tg-green"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={`relative block px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wide transition-colors ${
                isActive
                  ? "border-tg-green text-tg-bg"
                  : "border-tg-border bg-tg-surface text-tg-text-dim hover:text-tg-text"
              }`}
            >
              {tab.nombre}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
