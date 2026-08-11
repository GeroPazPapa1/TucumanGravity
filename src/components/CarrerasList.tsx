"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEnTorneo } from "@/lib/useEnTorneo";
import type { EstadoCarrera } from "@/lib/supabase/types";

interface Carrera {
  id: string;
  numero: number;
  nombre: string;
  lugar: string;
  estado: EstadoCarrera;
}

const estadoStyleOscuro: Record<EstadoCarrera, string> = {
  disputada: "text-tg-green border-tg-green/40 bg-tg-green/10",
  proxima: "text-tg-amber border-tg-amber/40 bg-tg-amber/10",
};

const estadoStyleClaro: Record<EstadoCarrera, string> = {
  disputada: "text-plat-celeste border-plat-celeste/40 bg-plat-celeste/10",
  proxima: "text-tg-amber border-tg-amber/40 bg-tg-amber/10",
};

const estadoLabel: Record<EstadoCarrera, string> = {
  disputada: "Disputada",
  proxima: "Próxima",
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function CarrerasList({ carreras, torneoId }: { carreras: Carrera[]; torneoId: string }) {
  const enTorneo = useEnTorneo();
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const border = enTorneo ? "border-tg-border" : "border-plat-border";
  const surface = enTorneo ? "bg-tg-surface" : "bg-plat-surface";
  const hoverBorder = enTorneo ? "hover:border-tg-green/50" : "hover:border-plat-celeste/50";
  const estadoStyle = enTorneo ? estadoStyleOscuro : estadoStyleClaro;

  if (carreras.length === 0) {
    return <p className={`text-center text-sm py-10 ${dim}`}>Este torneo todavía no tiene fechas cargadas.</p>;
  }

  return (
    <motion.ol initial="hidden" animate="show" variants={listVariants} className="flex flex-col gap-3">
      {carreras.map((carrera) => (
        <motion.li key={carrera.id} variants={itemVariants}>
          <Link
            href={`/t/${torneoId}/carreras/${carrera.id}`}
            className={`flex items-center gap-4 rounded-xl border ${border} ${surface} p-4 transition-all ${hoverBorder} hover:-translate-y-0.5`}
          >
            <span className={`font-display text-3xl shrink-0 w-10 text-center ${dim}`}>
              {carrera.numero}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg tracking-wide truncate">{carrera.nombre}</p>
              <p className={`text-sm truncate ${dim}`}>{carrera.lugar}</p>
            </div>
            <span
              className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${estadoStyle[carrera.estado]}`}
            >
              {estadoLabel[carrera.estado]}
            </span>
          </Link>
        </motion.li>
      ))}
    </motion.ol>
  );
}
