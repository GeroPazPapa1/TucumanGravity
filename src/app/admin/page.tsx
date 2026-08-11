"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RoleGate from "@/components/RoleGate";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import type { Database, Rol } from "@/lib/supabase/types";

type Torneo = Database["public"]["Tables"]["torneos"]["Row"];
type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];
type Precarga = Database["public"]["Tables"]["corredores_precarga"]["Row"];
type Inscripcion = Database["public"]["Tables"]["torneo_inscripciones"]["Row"];
type Miembro = Database["public"]["Tables"]["torneo_miembros"]["Row"];

const nombreRol: Record<Rol, string> = {
  corredor: "Corredor",
  superadmin: "Super admin",
};

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function PanelSuperAdmin() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [resultadosCount, setResultadosCount] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [torneoSeleccionado, setTorneoSeleccionado] = useState<string>("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [precarga, setPrecarga] = useState<Precarga[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  const [nuevoOrganizador, setNuevoOrganizador] = useState("");
  const [vinculando, setVinculando] = useState<string | null>(null);

  async function cargarGlobal() {
    const supabase = createClient();
    const [{ data: t }, { data: perf }, { count }] = await Promise.all([
      supabase.from("torneos").select("*").order("nombre"),
      supabase.from("perfiles").select("*").order("nombre"),
      supabase.from("resultados").select("*", { count: "exact", head: true }),
    ]);
    setTorneos(t ?? []);
    setPerfiles(perf ?? []);
    setResultadosCount(count ?? 0);
    if (!torneoSeleccionado && t && t.length > 0) setTorneoSeleccionado(t[0].id);
    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos desde Supabase al montar
    cargarGlobal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarTorneo(torneoId: string) {
    if (!torneoId) return;
    const supabase = createClient();
    const [{ data: cat }, { data: insc }, { data: pre }, { data: miem }] = await Promise.all([
      supabase.from("categorias").select("*").eq("torneo_id", torneoId).order("orden"),
      supabase.from("torneo_inscripciones").select("*").eq("torneo_id", torneoId),
      supabase.from("corredores_precarga").select("*").eq("torneo_id", torneoId),
      supabase.from("torneo_miembros").select("*").eq("torneo_id", torneoId),
    ]);
    setCategorias(cat ?? []);
    setInscripciones(insc ?? []);
    setPrecarga(pre ?? []);
    setMiembros(miem ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga datos del torneo elegido
    if (torneoSeleccionado) cargarTorneo(torneoSeleccionado);
  }, [torneoSeleccionado]);

  async function cambiarRol(perfilId: string, nuevoRol: Rol) {
    const supabase = createClient();
    const { error } = await supabase.rpc("asignar_rol", { perfil_id_destino: perfilId, nuevo_rol: nuevoRol });
    if (error) {
      setMensaje("Error: " + error.message);
      return;
    }
    mostrarMensaje("Rol actualizado.");
    await cargarGlobal();
  }

  function mostrarMensaje(texto: string) {
    setMensaje(texto);
    setTimeout(() => setMensaje(null), 3000);
  }

  async function vincular(precargaId: string) {
    const perfilId = seleccion[precargaId];
    if (!perfilId) return;
    setVinculando(precargaId);
    const supabase = createClient();
    const { error } = await supabase.rpc("vincular_precarga", {
      precarga_id: precargaId,
      perfil_id_destino: perfilId,
    });
    setVinculando(null);
    if (error) {
      mostrarMensaje("Error: " + error.message);
      return;
    }
    mostrarMensaje("Corredor vinculado. Sus puntos ya pasaron a su cuenta.");
    await cargarTorneo(torneoSeleccionado);
  }

  async function alternarActivo(torneo: Torneo) {
    const supabase = createClient();
    const { error } = await supabase.from("torneos").update({ activo: !torneo.activo }).eq("id", torneo.id);
    if (error) {
      mostrarMensaje("Error: " + error.message);
      return;
    }
    await cargarGlobal();
  }

  async function agregarOrganizador() {
    if (!nuevoOrganizador || !torneoSeleccionado) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("asignar_organizador", {
      p_torneo_id: torneoSeleccionado,
      p_perfil_id: nuevoOrganizador,
    });
    if (error) {
      mostrarMensaje("Error: " + error.message);
      return;
    }
    setNuevoOrganizador("");
    mostrarMensaje("Organizador asignado.");
    await cargarTorneo(torneoSeleccionado);
  }

  async function quitarOrganizador(perfilId: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc("quitar_organizador", {
      p_torneo_id: torneoSeleccionado,
      p_perfil_id: perfilId,
    });
    if (error) {
      mostrarMensaje("Error: " + error.message);
      return;
    }
    await cargarTorneo(torneoSeleccionado);
  }

  if (cargando) return <div className="py-16 text-center text-sm text-plat-text-dim">Cargando…</div>;

  const precargaSinVincular = precarga.filter((p) => !p.perfil_id);
  const perfilesYaVinculados = new Set(precarga.filter((p) => p.perfil_id).map((p) => p.perfil_id));
  const torneoActual = torneos.find((t) => t.id === torneoSeleccionado);
  const organizadoresIds = new Set(miembros.map((m) => m.perfil_id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-plat-text">SUPER ADMIN</h1>
        <p className="text-plat-text-dim text-sm">Control total: torneos, usuarios, identidad visual y sponsors.</p>
      </div>

      {mensaje && <p className="text-sm text-plat-celeste">{mensaje}</p>}

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-plat-text-dim mb-2">Resumen de la plataforma</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat valor={torneos.length} label="Torneos" />
          <Stat valor={perfiles.length} label="Corredores" />
          <Stat valor={resultadosCount} label="Resultados cargados" />
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-plat-text-dim mb-2">Torneos</h2>
        <div className="rounded-xl border border-plat-border bg-plat-surface divide-y divide-plat-border">
          {torneos.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex-1 text-sm font-semibold text-plat-text">{t.nombre}</span>
              <button
                onClick={() => alternarActivo(t)}
                className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border ${
                  t.activo
                    ? "text-plat-celeste border-plat-celeste/40 bg-plat-celeste/10"
                    : "text-plat-text-dim border-plat-border"
                }`}
              >
                {t.activo ? "Activo" : "Inactivo"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-plat-text-dim mb-2">Identidad visual</h2>
        <div className="rounded-xl border border-plat-border bg-plat-surface p-4 flex items-center gap-4">
          <Logo size={56} />
          <div className="flex-1">
            <p className="font-semibold text-sm text-plat-text">Escudo oficial</p>
            <p className="text-xs text-plat-text-dim">Gestión de assets de marca por torneo: próximamente en este panel.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-plat-text-dim mb-2">Sponsors</h2>
        <div className="flex gap-3 flex-wrap">
          <div className="px-4 py-3 rounded-lg border border-plat-border bg-plat-surface font-display text-sm tracking-wide text-plat-text">Radoc</div>
          <div className="px-4 py-3 rounded-lg border border-plat-border bg-plat-surface font-display text-sm tracking-wide text-plat-text">Commencal</div>
          <div className="px-4 py-3 rounded-lg border border-dashed border-plat-border text-xs text-plat-text-dim flex items-center">
            + Agregar sponsor (próximamente)
          </div>
        </div>
      </section>

      <section className="border-t border-plat-border pt-5">
        <h2 className="text-[11px] uppercase tracking-widest text-plat-text-dim mb-2">Gestión por torneo</h2>
        <select
          value={torneoSeleccionado}
          onChange={(e) => setTorneoSeleccionado(e.target.value)}
          className="w-full rounded-lg border border-plat-border bg-plat-surface text-plat-text px-3 py-2.5 text-sm mb-4"
        >
          {torneos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>

        {torneoActual && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-plat-text-dim mb-2">Organizadores</p>
              <div className="rounded-xl border border-plat-border bg-plat-surface divide-y divide-plat-border mb-2">
                {miembros.length === 0 && (
                  <p className="px-4 py-3 text-sm text-plat-text-dim">Todavía nadie organiza este torneo.</p>
                )}
                {miembros.map((m) => {
                  const perfil = perfiles.find((p) => p.id === m.perfil_id);
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="flex-1 text-sm text-plat-text">{perfil?.nombre ?? m.perfil_id}</span>
                      <button
                        onClick={() => quitarOrganizador(m.perfil_id)}
                        className="text-[10px] uppercase tracking-widest text-tg-magenta"
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <select
                  value={nuevoOrganizador}
                  onChange={(e) => setNuevoOrganizador(e.target.value)}
                  className="flex-1 rounded-lg border border-plat-border bg-plat-surface text-plat-text px-2 py-1.5 text-xs"
                >
                  <option value="">Elegir corredor…</option>
                  {perfiles
                    .filter((p) => !organizadoresIds.has(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                </select>
                <button
                  onClick={agregarOrganizador}
                  disabled={!nuevoOrganizador}
                  className="rounded-lg bg-plat-celeste text-white text-xs font-semibold uppercase px-3 disabled:opacity-40"
                >
                  Asignar
                </button>
              </div>
            </div>

            {precargaSinVincular.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-plat-text-dim mb-2">
                  Ranking histórico sin vincular ({precargaSinVincular.length})
                </p>
                <div className="rounded-xl border border-plat-border bg-plat-surface divide-y divide-plat-border">
                  {precargaSinVincular.map((p) => {
                    const candidatos = perfiles.filter((perfil) => {
                      const insc = inscripciones.find((i) => i.perfil_id === perfil.id);
                      return insc?.categoria_id === p.categoria_id && !perfilesYaVinculados.has(perfil.id);
                    });
                    return (
                      <div key={p.id} className="flex flex-col gap-2 px-3 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-plat-text">{p.nombre}</span>
                          <span className="font-display text-plat-celeste text-sm">{p.puntos_iniciales} pts</span>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={seleccion[p.id] ?? ""}
                            onChange={(e) => setSeleccion((s) => ({ ...s, [p.id]: e.target.value }))}
                            className="flex-1 rounded-lg border border-plat-border bg-plat-surface-alt text-plat-text px-2 py-1.5 text-xs"
                          >
                            <option value="">
                              {candidatos.length ? "Elegir cuenta registrada…" : "Nadie inscripto en esa categoría todavía"}
                            </option>
                            {candidatos.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nombre}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => vincular(p.id)}
                            disabled={!seleccion[p.id] || vinculando === p.id}
                            className="rounded-lg bg-plat-celeste text-white text-xs font-semibold uppercase px-3 disabled:opacity-40"
                          >
                            {vinculando === p.id ? "…" : "Vincular"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {categorias.length === 0 && (
              <p className="text-sm text-plat-text-dim">
                Este torneo todavía no tiene categorías — el organizador las carga desde su panel.
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-plat-text-dim mb-2">
          Corredores registrados ({perfiles.length})
        </h2>
        <motion.div
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="rounded-xl border border-plat-border bg-plat-surface divide-y divide-plat-border max-h-[420px] overflow-y-auto"
        >
          {perfiles.map((p) => (
            <motion.div key={p.id} variants={itemVariants} className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex-1 text-sm truncate text-plat-text">{p.nombre}</span>
              <select
                value={p.rol}
                onChange={(e) => cambiarRol(p.id, e.target.value as Rol)}
                className="rounded-md border border-plat-border bg-plat-surface-alt text-plat-text px-2 py-1 text-xs"
              >
                {(Object.keys(nombreRol) as Rol[]).map((r) => (
                  <option key={r} value={r}>
                    {nombreRol[r]}
                  </option>
                ))}
              </select>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

function Stat({ valor, label }: { valor: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-plat-border bg-plat-surface p-3 text-center">
      <p className="font-display text-2xl text-plat-celeste">{valor}</p>
      <p className="text-[10px] uppercase tracking-widest text-plat-text-dim mt-1">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGate soloSuperadmin seccion="Panel de super admin">
      <PanelSuperAdmin />
    </RoleGate>
  );
}
