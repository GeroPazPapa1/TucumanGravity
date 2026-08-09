"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RoleGate from "@/components/RoleGate";
import RiderAvatar from "@/components/RiderAvatar";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];
type Categoria = Database["public"]["Tables"]["categorias"]["Row"];

function MiPerfilForm({ perfilInicial }: { perfilInicial: Perfil }) {
  const { user, refrescarPerfil } = useAuth();
  const [form, setForm] = useState(perfilInicial);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categorias")
      .select("*")
      .order("orden")
      .then(({ data }) => setCategorias(data ?? []));
  }, []);

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSubiendoFoto(true);
    setError(null);
    const supabase = createClient();
    const extension = file.name.split(".").pop();
    const ruta = `${user.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from("fotos-perfil").upload(ruta, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      setError("No se pudo subir la foto: " + uploadError.message);
      setSubiendoFoto(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("fotos-perfil").getPublicUrl(ruta);
    setForm((f) => ({ ...f, foto_url: urlData.publicUrl }));
    setSubiendoFoto(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setGuardando(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("perfiles")
      .update({
        nombre: form.nombre,
        numero: form.numero,
        categoria_id: form.categoria_id,
        bici: form.bici,
        equipo: form.equipo,
        foto_url: form.foto_url,
      })
      .eq("id", user.id);

    setGuardando(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refrescarPerfil();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl tracking-wide">MI PERFIL</h1>
        <p className="text-tg-text-dim text-sm">Así te ven los demás corredores en Tucumán Gravity.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          <RiderAvatar nombre={form.nombre} fotoUrl={form.foto_url} categoriaId={form.categoria_id ?? ""} size={112} />
          <label className="text-xs uppercase tracking-widest text-tg-green cursor-pointer">
            {subiendoFoto ? "Subiendo…" : "Cambiar foto"}
            <input type="file" accept="image/*" onChange={handleFoto} className="hidden" disabled={subiendoFoto} />
          </label>
        </div>

        <Campo label="Nombre">
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            required
          />
        </Campo>

        <Campo label="Número de corredor">
          <input
            type="number"
            value={form.numero ?? ""}
            onChange={(e) => setForm({ ...form, numero: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            placeholder="Ej: 27"
          />
        </Campo>

        <Campo label="Categoría">
          <select
            value={form.categoria_id ?? ""}
            onChange={(e) => setForm({ ...form, categoria_id: e.target.value || null })}
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
          >
            <option value="">Sin categoría todavía</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Bici (marca y modelo)">
          <input
            value={form.bici ?? ""}
            onChange={(e) => setForm({ ...form, bici: e.target.value })}
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            placeholder="Ej: Commencal Supreme DH"
          />
        </Campo>

        <Campo label="Equipo / corre para">
          <input
            value={form.equipo ?? ""}
            onChange={(e) => setForm({ ...form, equipo: e.target.value })}
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            placeholder="Ej: Pachamama Racing"
          />
        </Campo>

        {error && <p className="text-sm text-tg-magenta">{error}</p>}

        <button
          type="submit"
          disabled={guardando || subiendoFoto}
          className="mt-2 rounded-lg bg-tg-green text-tg-bg font-semibold uppercase tracking-wide text-sm py-3 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>

        <AnimatePresence>
          {guardado && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-tg-green"
            >
              ✓ Perfil actualizado
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function MiPerfilGated() {
  const { perfil, cargando } = useAuth();

  if (cargando) return <div className="py-16 text-center text-sm text-tg-text-dim">Cargando…</div>;
  if (!perfil) return <div className="py-16 text-center text-sm text-tg-text-dim">No se encontró tu perfil.</div>;

  return <MiPerfilForm key={perfil.id} perfilInicial={perfil} />;
}

export default function MiPerfilPage() {
  return (
    <RoleGate permitido={["corredor", "organizador", "superadmin"]}>
      <MiPerfilGated />
    </RoleGate>
  );
}
