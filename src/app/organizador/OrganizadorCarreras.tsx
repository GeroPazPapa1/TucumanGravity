"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Carrera = Database["public"]["Tables"]["carreras"]["Row"];

export default function OrganizadorCarreras() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [form, setForm] = useState<Carrera | null>(null);
  const [guardadaId, setGuardadaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const supabase = createClient();
    const { data } = await supabase.from("carreras").select("*").order("numero");
    setCarreras(data ?? []);
    setCargando(false);
  }

  function abrir(carrera: Carrera) {
    if (expandidaId === carrera.id) {
      setExpandidaId(null);
      setForm(null);
      return;
    }
    setExpandidaId(carrera.id);
    setForm(carrera);
    setError(null);
  }

  async function guardar() {
    if (!form) return;
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("carreras")
      .update({
        nombre: form.nombre,
        lugar: form.lugar,
        lat: form.lat,
        lng: form.lng,
        estado: form.estado,
      })
      .eq("id", form.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setGuardadaId(form.id);
    setTimeout(() => setGuardadaId(null), 2000);
    await cargar();
  }

  function alternarEstado() {
    if (!form) return;
    setForm({ ...form, estado: form.estado === "disputada" ? "proxima" : "disputada" });
  }

  if (cargando) return <div className="py-10 text-center text-sm text-tg-text-dim">Cargando carreras…</div>;

  return (
    <div className="flex flex-col gap-3">
      {carreras.map((carrera) => {
        const expandida = expandidaId === carrera.id;
        const activo = expandida && form ? form : carrera;
        return (
          <div key={carrera.id} className="rounded-xl border border-tg-border bg-tg-surface overflow-hidden">
            <button onClick={() => abrir(carrera)} className="w-full flex items-center gap-3 p-4 text-left">
              <span className="font-display text-xl text-tg-text-dim w-8 text-center shrink-0">
                {carrera.numero}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{carrera.nombre}</p>
                <p className="text-xs text-tg-text-dim truncate">{carrera.lugar}</p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full border ${
                  carrera.estado === "disputada"
                    ? "text-tg-green border-tg-green/40 bg-tg-green/10"
                    : "text-tg-amber border-tg-amber/40 bg-tg-amber/10"
                }`}
              >
                {carrera.estado === "disputada" ? "Disputada" : "Próxima"}
              </span>
            </button>

            <AnimatePresence>
              {expandida && form && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 flex flex-col gap-3 border-t border-tg-border">
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <label className="block col-span-2">
                        <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">
                          Circuito
                        </span>
                        <input
                          value={form.nombre}
                          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                          className="w-full rounded-lg border border-tg-border bg-tg-bg px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block col-span-2">
                        <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">
                          Lugar
                        </span>
                        <input
                          value={form.lugar}
                          onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                          className="w-full rounded-lg border border-tg-border bg-tg-bg px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">
                          Latitud
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={form.lat}
                          onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
                          className="w-full rounded-lg border border-tg-border bg-tg-bg px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">
                          Longitud
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={form.lng}
                          onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
                          className="w-full rounded-lg border border-tg-border bg-tg-bg px-3 py-2 text-sm"
                        />
                      </label>
                    </div>

                    <button type="button" onClick={alternarEstado} className="text-xs uppercase tracking-widest text-left text-tg-cyan">
                      {activo.estado === "disputada" ? "Marcar como próxima" : "Marcar como disputada"}
                    </button>

                    {error && <p className="text-sm text-tg-magenta">{error}</p>}

                    <button
                      type="button"
                      onClick={guardar}
                      className="rounded-lg bg-tg-green text-tg-bg font-semibold uppercase tracking-wide text-sm py-2.5 transition-transform active:scale-[0.98]"
                    >
                      {guardadaId === carrera.id ? "✓ Guardado" : "Guardar cambios"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
