"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RiderAvatar from "@/components/RiderAvatar";
import SponsorFooter from "@/components/SponsorFooter";
import Logo from "@/components/Logo";
import PlatformLogo from "@/components/PlatformLogo";
import { getCategoryAccent } from "@/components/categoryColors";
import type { Database } from "@/lib/supabase/types";

type Torneo = Database["public"]["Tables"]["torneos"]["Row"];

interface Carrera {
  id: string;
  numero: number;
  nombre: string;
  lugar: string;
}

interface Lider {
  categoriaId: string;
  categoriaSlug: string;
  categoriaNombre: string;
  nombre: string;
  fotoUrl: string | null;
  totalPuntos: number;
  corredorId: string;
  esPrecarga: boolean;
}

interface HomeHeroProps {
  torneo: Torneo;
  proximaCarrera: Carrera | null;
  carrerasDisputadas: number;
  totalCarreras: number;
  lideres: Lider[];
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function HomeHero({ torneo, proximaCarrera, carrerasDisputadas, totalCarreras, lideres }: HomeHeroProps) {
  const base = `/t/${torneo.id}`;
  const [primero, ...resto] = torneo.nombre.split(" ");

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
          {torneo.id === "tucuman-gravity" ? <Logo size={96} /> : <PlatformLogo size={96} />}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative font-display text-3xl tracking-wide uppercase"
        >
          {primero} <span className="tg-gradient-text">{resto.join(" ")}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative text-tg-text-dim text-sm max-w-xs"
        >
          Resultados, ranking y perfil de cada corredor, todo en un solo lugar.
        </motion.p>
      </section>

      {proximaCarrera && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link
            href={`${base}/carreras/${proximaCarrera.id}`}
            className="block rounded-xl border border-tg-border bg-tg-surface p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:border-tg-green/40"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 tg-gradient-bar-animated" />
            <p className="text-[11px] uppercase tracking-widest text-tg-green font-semibold">
              Próxima fecha · #{proximaCarrera.numero}
            </p>
            <p className="font-display text-2xl mt-1">{proximaCarrera.nombre}</p>
            <p className="text-tg-text-dim text-sm mt-1">{proximaCarrera.lugar}</p>
          </Link>
        </motion.div>
      )}

      <motion.section initial="hidden" animate="show" variants={listVariants} className="grid grid-cols-3 gap-3">
        {[
          { href: `${base}/corredores`, label: "Corredores" },
          { href: `${base}/ranking`, label: "Ranking" },
          { href: `${base}/carreras`, label: "Carreras" },
        ].map((item) => (
          <motion.div key={item.href} variants={itemVariants}>
            <Link
              href={item.href}
              className="block rounded-lg border border-tg-border bg-tg-surface py-4 text-center font-display tracking-wide transition-all hover:border-tg-green hover:-translate-y-0.5 active:translate-y-0"
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </motion.section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-xl tracking-wide">Líderes por categoría</h2>
          <Link href={`${base}/ranking`} className="text-xs uppercase tracking-wide text-tg-text-dim hover:text-tg-green">
            Ver todo
          </Link>
        </div>
        {lideres.length === 0 ? (
          <p className="text-center text-tg-text-dim text-sm py-8">
            Todavía no hay corredores cargados en este torneo.
          </p>
        ) : (
          <motion.div initial="hidden" animate="show" variants={listVariants} className="flex flex-col gap-2">
            {lideres.map((lider) => {
              const accent = getCategoryAccent(lider.categoriaSlug);
              return (
                <motion.div key={lider.categoriaId} variants={itemVariants}>
                  <Link
                    href={`${base}/ranking?categoria=${lider.categoriaId}`}
                    className="flex items-center gap-3 rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 transition-all hover:border-tg-green/60 hover:-translate-y-0.5"
                  >
                    <RiderAvatar nombre={lider.nombre} fotoUrl={lider.fotoUrl} categoriaId={lider.categoriaSlug} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] uppercase tracking-widest font-semibold ${accent.text}`}>
                        {lider.categoriaNombre}
                      </p>
                      <p className="truncate font-semibold">{lider.nombre}</p>
                    </div>
                    <p className="font-display text-tg-green text-lg">{lider.totalPuntos}</p>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      <section className="text-center text-xs text-tg-text-dim">
        {carrerasDisputadas} de {totalCarreras} fechas disputadas · acumulado vigente antes de la próxima fecha
      </section>

      <SponsorFooter />
    </div>
  );
}
