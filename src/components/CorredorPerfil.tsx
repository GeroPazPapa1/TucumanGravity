"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RiderAvatar from "@/components/RiderAvatar";
import { getCategoryAccent } from "@/components/categoryColors";
import { useEnTorneo } from "@/lib/useEnTorneo";

interface CorredorPerfilProps {
  torneoId: string;
  torneoNombre: string;
  nombre: string;
  fotoUrl: string | null;
  bici: string | null;
  equipo: string | null;
  numero: number | null;
  categoriaNombre: string | null;
  categoriaSlug: string | null;
  posicion: number | null;
  totalPuntos: number | null;
  federado?: boolean;
  requiereFederado?: boolean;
  reglasActivas?: boolean;
  cantFechas?: number | null;
  puntosSuma?: number | null;
  puntosDescartados?: number | null;
  puntosPresentismo?: number | null;
  puntosRegionalBonus?: number | null;
}

export default function CorredorPerfil({
  torneoId,
  torneoNombre,
  nombre,
  fotoUrl,
  bici,
  equipo,
  numero,
  categoriaNombre,
  categoriaSlug,
  posicion,
  totalPuntos,
  federado,
  requiereFederado,
  reglasActivas,
  cantFechas,
  puntosSuma,
  puntosDescartados,
  puntosPresentismo,
  puntosRegionalBonus,
}: CorredorPerfilProps) {
  const enTorneo = useEnTorneo();
  const accent = getCategoryAccent(categoriaSlug ?? "", !enTorneo);
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const border = enTorneo ? "border-tg-border" : "border-plat-border";
  const surface = enTorneo ? "bg-tg-surface" : "bg-plat-surface";
  const accentText = enTorneo ? "text-tg-green" : "text-plat-celeste";
  const hoverAccent = enTorneo ? "hover:text-tg-green" : "hover:text-plat-celeste";

  const datos: { label: string; value: string }[] = [];
  if (numero) datos.push({ label: "Número", value: `#${numero}` });
  if (bici) datos.push({ label: "Bici", value: bici });
  if (equipo) datos.push({ label: "Equipo", value: equipo });

  const mostrarBadgeFederado = requiereFederado;
  const excluidoPorFederado = requiereFederado && !federado && categoriaNombre && posicion === null;

  const desglose: { label: string; value: string }[] = [];
  if (reglasActivas && posicion !== null) {
    if (cantFechas != null) desglose.push({ label: "Fechas corridas", value: String(cantFechas) });
    if (puntosSuma != null) desglose.push({ label: "Puntos en pista", value: String(puntosSuma) });
    if (puntosDescartados) desglose.push({ label: "Descarte de la peor fecha", value: `-${puntosDescartados}` });
    if (puntosPresentismo) desglose.push({ label: "Bono de presentismo", value: `+${puntosPresentismo}` });
    if (puntosRegionalBonus) desglose.push({ label: "Bono por tu regional", value: `+${puntosRegionalBonus}` });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
      <Link href={`/t/${torneoId}/corredores`} className={`text-xs uppercase tracking-wide ${dim} ${hoverAccent}`}>
        ← Todos los corredores
      </Link>

      <div className="flex flex-col items-center text-center gap-3 relative pt-2">
        <div className="absolute inset-x-0 top-0 h-24 tg-gradient-bar opacity-20 blur-2xl -z-10 rounded-full" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
          <RiderAvatar nombre={nombre} fotoUrl={fotoUrl} categoriaId={categoriaSlug ?? ""} size={128} />
        </motion.div>
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="font-display text-2xl tracking-wide">{nombre}</h1>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {categoriaNombre && (
              <span className={`inline-block text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${accent.border} ${accent.bg} ${accent.text}`}>
                {categoriaNombre}
              </span>
            )}
            {mostrarBadgeFederado && (
              <span
                className={`inline-block text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${
                  federado
                    ? "text-tg-cyan border-tg-cyan/40 bg-tg-cyan/10"
                    : "text-tg-magenta border-tg-magenta/40 bg-tg-magenta/10"
                }`}
              >
                {federado ? "Federado" : "No federado"}
              </span>
            )}
          </div>
        </div>
      </div>

      {excluidoPorFederado && (
        <p className={`text-center text-sm px-4 rounded-lg border py-3 ${border} ${surface}`}>
          Este torneo exige estar federado para sumar puntos oficiales. {nombre} corre y aparece en los
          resultados de cada fecha, pero no figura en el ranking general hasta federarse.
        </p>
      )}

      {posicion !== null && totalPuntos !== null && (
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl border ${border} ${surface} p-4 text-center`}>
            <p className={`font-display text-3xl ${accentText}`}>{posicion}°</p>
            <p className={`text-[11px] uppercase tracking-widest mt-1 ${dim}`}>en {categoriaNombre}</p>
          </div>
          <div className={`rounded-xl border ${border} ${surface} p-4 text-center`}>
            <p className={`font-display text-3xl ${accentText}`}>{totalPuntos}</p>
            <p className={`text-[11px] uppercase tracking-widest mt-1 ${dim}`}>puntos acumulados</p>
          </div>
        </div>
      )}

      {desglose.length > 0 && (
        <div>
          <p className={`text-[11px] uppercase tracking-widest mb-2 ${dim}`}>Cómo se compone el puntaje</p>
          <div className={`rounded-xl border ${border} ${surface} divide-y ${enTorneo ? "divide-tg-border" : "divide-plat-border"}`}>
            {desglose.map((d) => (
              <div key={d.label} className="flex items-center justify-between px-4 py-3">
                <span className={`text-xs uppercase tracking-widest ${dim}`}>{d.label}</span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {datos.length > 0 && (
        <div className={`rounded-xl border ${border} ${surface} divide-y ${enTorneo ? "divide-tg-border" : "divide-plat-border"}`}>
          {datos.map((dato) => (
            <div key={dato.label} className="flex items-center justify-between px-4 py-3">
              <span className={`text-xs uppercase tracking-widest ${dim}`}>{dato.label}</span>
              <span className="font-semibold">{dato.value}</span>
            </div>
          ))}
        </div>
      )}

      <p className={`text-center text-sm px-4 ${dim}`}>
        {categoriaNombre
          ? `Parte de ${torneoNombre}. Corriendo en ${categoriaNombre}, temporada tras temporada.`
          : `Parte de ${torneoNombre}.`}
      </p>
    </motion.div>
  );
}
