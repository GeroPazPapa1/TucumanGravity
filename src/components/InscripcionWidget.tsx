"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
type Inscripcion = Database["public"]["Tables"]["torneo_inscripciones"]["Row"];

interface InscripcionWidgetProps {
  torneoId: string;
  torneoNombre: string;
  categorias: Categoria[];
}

export default function InscripcionWidget({ torneoId, torneoNombre, categorias }: InscripcionWidgetProps) {
  const { user, cargando: cargandoAuth } = useAuth();
  const [inscripcion, setInscripcion] = useState<Inscripcion | null | undefined>(undefined);
  const [categoriaId, setCategoriaId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- refleja que no hay sesión, no busca datos
      setInscripcion(null);
      return;
    }
    const supabase = createClient();
    supabase
      .from("torneo_inscripciones")
      .select("*")
      .eq("torneo_id", torneoId)
      .eq("perfil_id", user.id)
      .maybeSingle()
      .then(({ data }) => setInscripcion(data));
  }, [user, torneoId]);

  if (cargandoAuth || !user || inscripcion === undefined || categorias.length === 0) return null;
  if (inscripcion?.categoria_id) return null;

  async function inscribirse(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !categoriaId) return;
    setGuardando(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("torneo_inscripciones")
      .upsert({ torneo_id: torneoId, perfil_id: user.id, categoria_id: categoriaId }, { onConflict: "torneo_id,perfil_id" });
    setGuardando(false);
    if (!error) {
      setGuardado(true);
      setInscripcion({ id: "", torneo_id: torneoId, perfil_id: user.id, categoria_id: categoriaId, numero: null, puntos_iniciales: 0, created_at: "" });
    }
  }

  return (
    <AnimatePresence>
      {!guardado && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={inscribirse}
          className="rounded-xl border border-tg-green/40 bg-tg-green/10 p-4 flex flex-col gap-3"
        >
          <p className="text-sm font-semibold">Todavía no estás inscripto en {torneoNombre}</p>
          <div className="flex gap-2">
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="flex-1 rounded-lg border border-tg-border bg-tg-bg px-3 py-2 text-sm"
              required
            >
              <option value="">Elegí tu categoría…</option>
              {categorias
                .slice()
                .sort((a, b) => a.orden - b.orden)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              disabled={guardando || !categoriaId}
              className="rounded-lg bg-tg-green text-tg-bg text-xs font-semibold uppercase px-4 disabled:opacity-40"
            >
              {guardando ? "…" : "Inscribirme"}
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
