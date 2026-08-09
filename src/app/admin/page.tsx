"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RoleGate from "@/components/RoleGate";
import Logo from "@/components/Logo";
import { getCategoryAccent } from "@/components/categoryColors";
import { createClient } from "@/lib/supabase/client";
import type { Database, Rol } from "@/lib/supabase/types";

type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];
type Precarga = Database["public"]["Tables"]["corredores_precarga"]["Row"];
type Carrera = Database["public"]["Tables"]["carreras"]["Row"];

const nombreRol: Record<Rol, string> = {
  corredor: "Corredor",
  organizador: "Organizador",
  superadmin: "Super admin",
};

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function PanelSuperAdmin() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [resultadosCount, setResultadosCount] = useState(0);
  const [precarga, setPrecarga] = useState<Precarga[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vinculando, setVinculando] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargarTodo() {
    const supabase = createClient();
    const [{ data: cat }, { data: perf }, { data: carr }, { count }, { data: pre }] = await Promise.all([
      supabase.from("categorias").select("*").order("orden"),
      supabase.from("perfiles").select("*").order("nombre"),
      supabase.from("carreras").select("*"),
      supabase.from("resultados").select("*", { count: "exact", head: true }),
      supabase.from("corredores_precarga").select("*"),
    ]);
    setCategorias(cat ?? []);
    setPerfiles(perf ?? []);
    setCarreras(carr ?? []);
    setResultadosCount(count ?? 0);
    setPrecarga(pre ?? []);
    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos desde Supabase al montar
    cargarTodo();
  }, []);

  async function cambiarRol(perfilId: string, nuevoRol: Rol) {
    const supabase = createClient();
    const { error } = await supabase.rpc("asignar_rol", { perfil_id_destino: perfilId, nuevo_rol: nuevoRol });
    if (error) {
      setMensaje("Error: " + error.message);
      return;
    }
    setMensaje("Rol actualizado.");
    setTimeout(() => setMensaje(null), 2500);
    await cargarTodo();
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
      setMensaje("Error: " + error.message);
      return;
    }
    setMensaje("Corredor vinculado. Sus puntos ya pasaron a su cuenta.");
    setTimeout(() => setMensaje(null), 3000);
    await cargarTodo();
  }

  if (cargando) return <div className="py-16 text-center text-sm text-tg-text-dim">Cargando…</div>;

  const disputadas = carreras.filter((c) => c.estado === "disputada").length;
  const precargaSinVincular = precarga.filter((p) => !p.perfil_id);
  const perfilesYaVinculados = new Set(precarga.filter((p) => p.perfil_id).map((p) => p.perfil_id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide">SUPER ADMIN</h1>
        <p className="text-tg-text-dim text-sm">Control total: usuarios, identidad visual y sponsors.</p>
      </div>

      {mensaje && <p className="text-sm text-tg-green">{mensaje}</p>}

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-tg-text-dim mb-2">Resumen del torneo</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat valor={perfiles.length} label="Corredores" />
          <Stat valor={`${disputadas}/${carreras.length}`} label="Fechas corridas" />
          <Stat valor={resultadosCount} label="Resultados cargados" />
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-tg-text-dim mb-2">Identidad visual</h2>
        <div className="rounded-xl border border-tg-border bg-tg-surface p-4 flex items-center gap-4">
          <Logo size={56} />
          <div className="flex-1">
            <p className="font-semibold text-sm">Escudo oficial</p>
            <p className="text-xs text-tg-text-dim">Gestión de assets de marca: próximamente en este panel.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-tg-text-dim mb-2">Sponsors</h2>
        <div className="flex gap-3 flex-wrap">
          <div className="px-4 py-3 rounded-lg border border-tg-border bg-tg-surface font-display text-sm tracking-wide">Radoc</div>
          <div className="px-4 py-3 rounded-lg border border-tg-border bg-tg-surface font-display text-sm tracking-wide">Commencal</div>
          <div className="px-4 py-3 rounded-lg border border-dashed border-tg-border text-xs text-tg-text-dim flex items-center">
            + Agregar sponsor (próximamente)
          </div>
        </div>
      </section>

      {precargaSinVincular.length > 0 && (
        <section>
          <h2 className="text-[11px] uppercase tracking-widest text-tg-text-dim mb-2">
            Ranking histórico sin vincular ({precargaSinVincular.length})
          </h2>
          <p className="text-xs text-tg-text-dim mb-2">
            Corredores reales del ranking cargado que todavía no crearon su cuenta. Cuando alguien se registre y
            complete su categoría, vinculalo acá para que sus puntos pasen a su perfil real.
          </p>
          <div className="rounded-xl border border-tg-border bg-tg-surface divide-y divide-tg-border">
            {precargaSinVincular.map((p) => {
              const candidatos = perfiles.filter(
                (perfil) => perfil.categoria_id === p.categoria_id && !perfilesYaVinculados.has(perfil.id)
              );
              return (
                <div key={p.id} className="flex flex-col gap-2 px-3 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{p.nombre}</span>
                    <span className="font-display text-tg-green text-sm">{p.puntos_iniciales} pts</span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={seleccion[p.id] ?? ""}
                      onChange={(e) => setSeleccion((s) => ({ ...s, [p.id]: e.target.value }))}
                      className="flex-1 rounded-lg border border-tg-border bg-tg-bg px-2 py-1.5 text-xs"
                    >
                      <option value="">
                        {candidatos.length ? "Elegir cuenta registrada…" : "Nadie registrado en esta categoría todavía"}
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
                      className="rounded-lg bg-tg-green text-tg-bg text-xs font-semibold uppercase px-3 disabled:opacity-40"
                    >
                      {vinculando === p.id ? "…" : "Vincular"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-tg-text-dim mb-2">
          Corredores registrados ({perfiles.length})
        </h2>
        <motion.div
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="rounded-xl border border-tg-border bg-tg-surface divide-y divide-tg-border max-h-[420px] overflow-y-auto"
        >
          {perfiles.map((p) => {
            const categoria = categorias.find((c) => c.id === p.categoria_id);
            const accent = getCategoryAccent(p.categoria_id ?? "");
            return (
              <motion.div key={p.id} variants={itemVariants} className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.nombre}</p>
                  {categoria && (
                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${accent.text}`}>
                      {categoria.nombre}
                    </span>
                  )}
                </div>
                <select
                  value={p.rol}
                  onChange={(e) => cambiarRol(p.id, e.target.value as Rol)}
                  className="rounded-md border border-tg-border bg-tg-bg px-2 py-1 text-xs"
                >
                  {(Object.keys(nombreRol) as Rol[]).map((r) => (
                    <option key={r} value={r}>
                      {nombreRol[r]}
                    </option>
                  ))}
                </select>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}

function Stat({ valor, label }: { valor: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-tg-border bg-tg-surface p-3 text-center">
      <p className="font-display text-2xl text-tg-green">{valor}</p>
      <p className="text-[10px] uppercase tracking-widest text-tg-text-dim mt-1">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGate permitido={["superadmin"]}>
      <PanelSuperAdmin />
    </RoleGate>
  );
}
