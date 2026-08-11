"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PlatformLogo from "@/components/PlatformLogo";
import SponsorFooter from "@/components/SponsorFooter";
import type { Database } from "@/lib/supabase/types";

type Torneo = Database["public"]["Tables"]["torneos"]["Row"];

const nombreTipo: Record<string, string> = {
  regional: "Regional",
  nacional: "Nacional",
  internacional: "Internacional",
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function TorneoSelector({ torneos }: { torneos: Torneo[] }) {
  const grupos: { tipo: string; torneos: Torneo[] }[] = ["nacional", "internacional", "regional"]
    .map((tipo) => ({ tipo, torneos: torneos.filter((t) => t.tipo === tipo) }))
    .filter((g) => g.torneos.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <section className="relative flex flex-col items-center text-center gap-3 pt-6 pb-2 overflow-hidden">
        <div className="tg-blob w-64 h-64 -top-10 -left-10 bg-plat-celeste opacity-25" />
        <div className="tg-blob w-56 h-56 -top-6 -right-6 bg-tg-magenta opacity-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative tg-float"
        >
          <PlatformLogo size={96} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative font-display text-2xl tracking-wide text-plat-text"
        >
          ELEGÍ TU <span className="tg-gradient-text">TORNEO</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="relative text-plat-text-dim text-sm max-w-xs"
        >
          Una sola cuenta para seguir el ranking, cargar resultados y ser parte de cada torneo de descenso.
        </motion.p>
      </section>

      {grupos.map((grupo) => (
        <section key={grupo.tipo}>
          <h2 className="text-[11px] uppercase tracking-widest text-plat-text-dim mb-3">{nombreTipo[grupo.tipo]}</h2>
          <motion.div initial="hidden" animate="show" variants={listVariants} className="flex flex-col gap-2">
            {grupo.torneos.map((torneo) => (
              <motion.div key={torneo.id} variants={itemVariants}>
                <Link
                  href={`/t/${torneo.id}`}
                  className="flex items-center justify-between rounded-lg border border-plat-border bg-plat-surface px-4 py-4 shadow-sm transition-all hover:border-plat-celeste hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="font-display text-lg tracking-wide text-plat-text">{torneo.nombre}</span>
                  {!torneo.activo && (
                    <span className="text-[10px] uppercase tracking-widest text-plat-text-dim border border-plat-border rounded-full px-2 py-1">
                      Próximamente
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      ))}

      <SponsorFooter />
    </div>
  );
}
