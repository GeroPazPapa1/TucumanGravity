"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Categoria = Database["public"]["Tables"]["categorias"]["Row"];

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function OrganizadorCategorias({ torneoId }: { torneoId: string }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torneoId]);

  async function cargar() {
    setCargando(true);
    const supabase = createClient();
    const { data } = await supabase.from("categorias").select("*").eq("torneo_id", torneoId).order("orden");
    setCategorias(data ?? []);
    setCargando(false);
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError(null);
    setCreando(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("categorias").insert({
      torneo_id: torneoId,
      slug: slugify(nombre),
      nombre: nombre.trim(),
      orden: categorias.length + 1,
    });

    setCreando(false);

    if (insertError) {
      setError(
        insertError.message.includes("duplicate") ? "Ya existe una categoría con ese nombre en este torneo." : insertError.message
      );
      return;
    }

    setNombre("");
    await cargar();
  }

  if (cargando) return <div className="py-10 text-center text-sm text-tg-text-dim">Cargando…</div>;

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={crear} className="flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la categoría (ej: Elite)"
          className="flex-1 rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={creando || !nombre.trim()}
          className="rounded-lg bg-tg-green text-tg-bg text-xs font-semibold uppercase px-4 disabled:opacity-40"
        >
          {creando ? "…" : "Agregar"}
        </button>
      </form>

      {error && <p className="text-sm text-tg-magenta">{error}</p>}

      {categorias.length === 0 ? (
        <p className="text-center text-sm text-tg-text-dim py-6">Todavía no hay categorías en este torneo.</p>
      ) : (
        <div className="rounded-xl border border-tg-border bg-tg-surface divide-y divide-tg-border">
          {categorias.map((c) => (
            <div key={c.id} className="px-4 py-3 text-sm">
              {c.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
