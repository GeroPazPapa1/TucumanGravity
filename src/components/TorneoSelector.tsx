"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
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
  const grupos: { tipo: string; torneos: Torneo[] }[] = ["regional", "nacional", "internacional"]
    .map((tipo) => ({ tipo, torneos: torneos.filter((t) => t.tipo === tipo) }))
    .filter((g) => g.torneos.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <section className="relative flex flex-col items-center text-center gap-3 pt-6 pb-2 overflow-hidden">
        <div className="tg-blob w-64 h-64 -top-10 -left-10 bg-tg-violet" />
        <div className="tg-blob w-56 h-56 -top-6 -right-6 bg-tg-magenta" />

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative tg-float"
        >
          <Logo size={96} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative font-display text-2xl tracking-wide"
        >
          ELEGÍ TU <span className="tg-gradient-text">TORNEO</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="relative text-tg-text-dim text-sm max-w-xs"
        >
          Una sola cuenta para seguir el ranking, cargar resultados y ser parte de cada torneo de descenso.
        </motion.p>
      </section>

      {grupos.map((grupo) => (
        <section key={grupo.tipo}>
          <h2 className="text-[11px] uppercase tracking-widest text-tg-text-dim mb-3">{nombreTipo[grupo.tipo]}</h2>
          <motion.div initial="hidden" animate="show" variants={listVariants} className="flex flex-col gap-2">
            {grupo.torneos.map((torneo) => (
              <motion.div key={torneo.id} variants={itemVariants}>
                <Link
                  href={`/t/${torneo.id}`}
                  className="flex items-center justify-between rounded-lg border border-tg-border bg-tg-surface px-4 py-4 transition-all hover:border-tg-green/60 hover:-translate-y-0.5"
                >
                  <span className="font-display text-lg tracking-wide">{torneo.nombre}</span>
                  {!torneo.activo && (
                    <span className="text-[10px] uppercase tracking-widest text-tg-text-dim border border-tg-border rounded-full px-2 py-1">
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
