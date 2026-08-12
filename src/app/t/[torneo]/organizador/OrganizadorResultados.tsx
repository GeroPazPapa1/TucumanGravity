"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useEnTorneo } from "@/lib/useEnTorneo";
import type { Database } from "@/lib/supabase/types";

type Carrera = Database["public"]["Tables"]["carreras"]["Row"];
type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
type Resultado = Database["public"]["Tables"]["resultados"]["Row"];

interface CorredorInscripto {
  id: string;
  nombre: string;
  puntosIniciales: number;
  federado: boolean;
}

interface ReglasTorneo {
  descartesPermitidos: number;
  presentismoPuntosPorFecha: number;
  requiereFederado: boolean;
  sumaFechaRegional: boolean;
}

interface FilaForm {
  posicion: number;
  puntos: number;
}

function filasIniciales(corredores: CorredorInscripto[], carreraId: string, resultados: Resultado[]) {
  const iniciales: Record<string, FilaForm> = {};
  corredores.forEach((c, index) => {
    const existente = resultados.find((r) => r.carrera_id === carreraId && r.corredor_id === c.id);
    iniciales[c.id] = existente
      ? { posicion: existente.posicion, puntos: existente.puntos }
      : { posicion: index + 1, puntos: 0 };
  });
  return iniciales;
}

interface CargaResultadosFormProps {
  carreraId: string;
  categoriaId: string;
  corredoresCategoria: CorredorInscripto[];
  resultadosCategoria: Resultado[];
  reglas: ReglasTorneo;
  onGuardado: () => void;
}

function CargaResultadosForm({
  carreraId,
  categoriaId,
  corredoresCategoria,
  resultadosCategoria,
  reglas,
  onGuardado,
}: CargaResultadosFormProps) {
  const enTorneo = useEnTorneo();
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const border = enTorneo ? "border-tg-border" : "border-plat-border";
  const surface = enTorneo ? "bg-tg-surface" : "bg-plat-surface";
  const surfaceAlt = enTorneo ? "bg-tg-bg" : "bg-plat-surface-alt";
  const divide = enTorneo ? "divide-tg-border" : "divide-plat-border";
  const accentText = enTorneo ? "text-tg-green" : "text-plat-celeste";
  const accentCheckbox = enTorneo ? "accent-tg-green" : "accent-plat-celeste";
  const boton = enTorneo ? "bg-tg-green text-tg-bg" : "bg-plat-celeste text-white";

  const reglasActivas =
    reglas.descartesPermitidos > 0 || reglas.presentismoPuntosPorFecha > 0 || reglas.sumaFechaRegional;

  const [filas, setFilas] = useState<Record<string, FilaForm>>(() =>
    filasIniciales(corredoresCategoria, carreraId, resultadosCategoria)
  );
  const [marcarDisputada, setMarcarDisputada] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Aplica descarte de la peor fecha + bono de presentismo a una lista de
  // puntos por fecha de un corredor. El bono por posición regional NO se
  // calcula acá (requiere consultar otro torneo) — se aclara en la UI.
  function totalConReglas(corredorId: string, puntosPorFecha: number[]): number | null {
    const corredor = corredoresCategoria.find((c) => c.id === corredorId);
    if (!corredor) return null;
    if (reglas.requiereFederado && !corredor.federado) return null;

    const suma = puntosPorFecha.reduce((s, v) => s + v, 0);
    const cantFechas = puntosPorFecha.length;
    const peor = reglas.descartesPermitidos >= 1 && cantFechas > 0 ? Math.min(...puntosPorFecha) : 0;
    const presentismo = reglas.presentismoPuntosPorFecha * cantFechas;
    return corredor.puntosIniciales + suma - peor + presentismo;
  }

  function totalActual(corredorId: string) {
    const puntos = resultadosCategoria.filter((r) => r.corredor_id === corredorId).map((r) => r.puntos);
    return totalConReglas(corredorId, puntos);
  }

  function totalConPendientes(corredorId: string) {
    const otras = resultadosCategoria
      .filter((r) => r.corredor_id === corredorId && r.carrera_id !== carreraId)
      .map((r) => r.puntos);
    return totalConReglas(corredorId, [...otras, filas[corredorId]?.puntos ?? 0]);
  }

  const rankingAntes = useMemo(
    () =>
      corredoresCategoria
        .map((c) => ({ id: c.id, nombre: c.nombre, total: totalActual(c.id) }))
        .filter((r): r is { id: string; nombre: string; total: number } => r.total !== null)
        .sort((a, b) => b.total - a.total),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [corredoresCategoria, resultadosCategoria]
  );

  const rankingDespues = useMemo(
    () =>
      corredoresCategoria
        .map((c) => ({ id: c.id, nombre: c.nombre, total: totalConPendientes(c.id) }))
        .filter((r): r is { id: string; nombre: string; total: number } => r.total !== null)
        .sort((a, b) => b.total - a.total),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [corredoresCategoria, resultadosCategoria, filas]
  );

  const noFederados = reglas.requiereFederado ? corredoresCategoria.filter((c) => !c.federado) : [];

  async function confirmar() {
    setGuardando(true);
    setError(null);

    const supabase = createClient();
    const filasParaGuardar = corredoresCategoria.map((c) => ({
      carrera_id: carreraId,
      corredor_id: c.id,
      categoria_id: categoriaId,
      posicion: filas[c.id]?.posicion ?? 0,
      puntos: filas[c.id]?.puntos ?? 0,
    }));

    const { error: upsertError } = await supabase
      .from("resultados")
      .upsert(filasParaGuardar, { onConflict: "carrera_id,corredor_id" });

    if (upsertError) {
      setError(upsertError.message);
      setGuardando(false);
      return;
    }

    if (marcarDisputada) {
      await supabase.from("carreras").update({ estado: "disputada" }).eq("id", carreraId);
    }

    setGuardando(false);
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2500);
    onGuardado();
  }

  if (corredoresCategoria.length === 0) {
    return (
      <p className={`text-center text-sm py-10 ${dim}`}>
        Todavía no hay corredores inscriptos en esta categoría. Necesitás que se registren y elijan su categoría
        en este torneo antes de poder cargarles resultados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reglasActivas && (
        <p className={`text-xs leading-relaxed rounded-lg border px-3 py-2.5 ${border} ${surface} ${dim}`}>
          Este torneo tiene reglas propias:
          {reglas.descartesPermitidos > 0 && " se descarta la peor fecha de cada corredor ·"}
          {reglas.presentismoPuntosPorFecha > 0 && ` +${reglas.presentismoPuntosPorFecha} pts de presentismo por fecha corrida ·`}
          {reglas.requiereFederado && " solo suman los federados ·"}
          {reglas.sumaFechaRegional && " suma bono por posición regional"}
          {reglas.sumaFechaRegional && (
            <span className="block mt-1">
              ⚠ El bono por posición regional no está incluido en esta vista previa (se calcula al confirmar,
              mirá el ranking público para verlo reflejado).
            </span>
          )}
        </p>
      )}

      <div className={`rounded-xl border ${border} ${surface} divide-y ${divide}`}>
        <div className={`grid grid-cols-[1fr_70px_70px] gap-2 px-3 py-2 text-[10px] uppercase tracking-widest ${dim}`}>
          <span>Corredor</span>
          <span className="text-center">Pos.</span>
          <span className="text-center">Puntos</span>
        </div>
        {corredoresCategoria.map((c) => (
          <div key={c.id} className="grid grid-cols-[1fr_70px_70px] gap-2 px-3 py-2 items-center">
            <span className="text-sm truncate flex items-center gap-1.5 min-w-0">
              <span className="truncate">{c.nombre}</span>
              {reglas.requiereFederado && !c.federado && (
                <span className="shrink-0 text-[9px] uppercase tracking-widest text-tg-magenta border border-tg-magenta/40 rounded-full px-1.5 py-0.5">
                  no federado
                </span>
              )}
            </span>
            <input
              type="number"
              min={1}
              value={filas[c.id]?.posicion ?? ""}
              onChange={(e) =>
                setFilas((f) => ({ ...f, [c.id]: { ...f[c.id], posicion: Number(e.target.value) || 0 } }))
              }
              className={`w-full rounded-md border ${border} ${surfaceAlt} px-2 py-1.5 text-sm text-center`}
            />
            <input
              type="number"
              min={0}
              value={filas[c.id]?.puntos ?? ""}
              onChange={(e) =>
                setFilas((f) => ({ ...f, [c.id]: { ...f[c.id], puntos: Number(e.target.value) || 0 } }))
              }
              className={`w-full rounded-md border ${border} ${surfaceAlt} px-2 py-1.5 text-sm text-center`}
            />
          </div>
        ))}
      </div>

      <div>
        <p className={`text-[11px] uppercase tracking-widest mb-2 ${dim}`}>
          Vista previa del ranking si confirmás
        </p>
        <div className={`rounded-xl border ${border} ${surface} divide-y ${divide}`}>
          {rankingDespues.map((entrada, index) => {
            const antes = rankingAntes.findIndex((r) => r.id === entrada.id);
            const delta = antes - index;
            return (
              <div key={entrada.id} className="flex items-center gap-3 px-3 py-2">
                <span className={`font-display text-lg w-6 text-center ${dim}`}>{index + 1}</span>
                <span className="flex-1 text-sm truncate">{entrada.nombre}</span>
                {delta !== 0 && (
                  <span className={`text-xs font-semibold ${delta > 0 ? accentText : "text-tg-magenta"}`}>
                    {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
                  </span>
                )}
                <span className={`font-display text-base w-12 text-right ${accentText}`}>{entrada.total}</span>
              </div>
            );
          })}
        </div>
        {noFederados.length > 0 && (
          <p className={`text-xs mt-2 ${dim}`}>
            No suman en este ranking por no estar federados: {noFederados.map((c) => c.nombre).join(", ")}.
          </p>
        )}
      </div>

      <label className={`flex items-center gap-2 text-sm ${dim}`}>
        <input
          type="checkbox"
          checked={marcarDisputada}
          onChange={(e) => setMarcarDisputada(e.target.checked)}
          className={`w-4 h-4 ${accentCheckbox}`}
        />
        Marcar esta fecha como disputada al confirmar
      </label>

      {error && <p className="text-sm text-tg-magenta">{error}</p>}

      <button
        onClick={confirmar}
        disabled={guardando}
        className={`rounded-lg font-semibold uppercase tracking-wide text-sm py-3 transition-transform active:scale-[0.98] disabled:opacity-60 ${boton}`}
      >
        {guardando ? "Guardando…" : "Confirmar carga de resultados"}
      </button>

      <AnimatePresence>
        {confirmado && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm ${accentText}`}
          >
            ✓ Resultados cargados. El ranking ya está actualizado.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrganizadorResultados({ torneoId }: { torneoId: string }) {
  const enTorneo = useEnTorneo();
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const border = enTorneo ? "border-tg-border" : "border-plat-border";
  const surface = enTorneo ? "bg-tg-surface" : "bg-plat-surface";

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [reglas, setReglas] = useState<ReglasTorneo>({
    descartesPermitidos: 0,
    presentismoPuntosPorFecha: 0,
    requiereFederado: false,
    sumaFechaRegional: false,
  });
  const [carreraId, setCarreraId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [corredoresCategoria, setCorredoresCategoria] = useState<CorredorInscripto[]>([]);
  const [resultadosCategoria, setResultadosCategoria] = useState<Resultado[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      setCargando(true);
      const supabase = createClient();
      const [{ data: c }, { data: cat }, { data: t }] = await Promise.all([
        supabase.from("carreras").select("*").eq("torneo_id", torneoId).order("numero"),
        supabase.from("categorias").select("*").eq("torneo_id", torneoId).order("orden"),
        supabase
          .from("torneos")
          .select("descartes_permitidos, presentismo_puntos_por_fecha, requiere_federado, suma_fecha_regional")
          .eq("id", torneoId)
          .single(),
      ]);
      setCarreras(c ?? []);
      setCategorias(cat ?? []);
      if (t) {
        setReglas({
          descartesPermitidos: t.descartes_permitidos,
          presentismoPuntosPorFecha: t.presentismo_puntos_por_fecha,
          requiereFederado: t.requiere_federado,
          sumaFechaRegional: t.suma_fecha_regional,
        });
      }
      setCarreraId(c?.[0]?.id ?? "");
      setCategoriaId(cat?.[0]?.id ?? "");
      setCargando(false);
    })();
  }, [torneoId]);

  async function cargarDatosCategoria(catId: string) {
    const supabase = createClient();
    const [{ data: inscripciones }, { data: resultados }] = await Promise.all([
      supabase.from("torneo_inscripciones").select("perfil_id, puntos_iniciales").eq("torneo_id", torneoId).eq("categoria_id", catId),
      supabase.from("resultados").select("*").eq("categoria_id", catId),
    ]);

    const perfilIds = (inscripciones ?? []).map((i) => i.perfil_id);
    const { data: perfilesData } = perfilIds.length
      ? await supabase.from("perfiles").select("id, nombre, federado").in("id", perfilIds).order("nombre")
      : { data: [] };

    const corredores: CorredorInscripto[] = (perfilesData ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      federado: p.federado,
      puntosIniciales: (inscripciones ?? []).find((i) => i.perfil_id === p.id)?.puntos_iniciales ?? 0,
    }));

    setCorredoresCategoria(corredores);
    setResultadosCategoria(resultados ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga datos de Supabase al cambiar de categoría
    if (categoriaId) cargarDatosCategoria(categoriaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId]);

  if (cargando) return <div className={`py-10 text-center text-sm ${dim}`}>Cargando…</div>;

  if (carreras.length === 0 || categorias.length === 0) {
    return (
      <p className={`text-center text-sm py-10 ${dim}`}>
        Necesitás tener al menos una fecha y una categoría cargadas en este torneo antes de poder cargar
        resultados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={`block text-[11px] uppercase tracking-widest mb-1.5 ${dim}`}>Fecha</span>
          <select
            value={carreraId}
            onChange={(e) => setCarreraId(e.target.value)}
            className={`w-full rounded-lg border ${border} ${surface} px-3 py-2.5 text-sm`}
          >
            {carreras.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.numero} · {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={`block text-[11px] uppercase tracking-widest mb-1.5 ${dim}`}>Categoría</span>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className={`w-full rounded-lg border ${border} ${surface} px-3 py-2.5 text-sm`}
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <CargaResultadosForm
        key={`${carreraId}__${categoriaId}`}
        carreraId={carreraId}
        categoriaId={categoriaId}
        corredoresCategoria={corredoresCategoria}
        resultadosCategoria={resultadosCategoria}
        reglas={reglas}
        onGuardado={() => cargarDatosCategoria(categoriaId)}
      />
    </div>
  );
}
