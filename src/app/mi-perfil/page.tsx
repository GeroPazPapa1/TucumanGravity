"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import RoleGate from "@/components/RoleGate";
import RiderAvatar from "@/components/RiderAvatar";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];

interface MisTorneos {
  torneoId: string;
  torneoNombre: string;
  categoriaNombre: string | null;
}

function MiPerfilForm({ perfilInicial }: { perfilInicial: Perfil }) {
  const { user, refrescarPerfil } = useAuth();
  const [form, setForm] = useState(perfilInicial);
  const [misTorneos, setMisTorneos] = useState<MisTorneos[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("torneo_inscripciones")
      .select("torneo_id, categoria_id")
      .eq("perfil_id", user.id)
      .then(async ({ data: inscripciones }) => {
        if (!inscripciones || inscripciones.length === 0) return;
        const torneoIds = inscripciones.map((i) => i.torneo_id);
        const categoriaIds = inscripciones.map((i) => i.categoria_id).filter((id): id is string => !!id);
        const [{ data: torneos }, { data: categorias }] = await Promise.all([
          supabase.from("torneos").select("id, nombre").in("id", torneoIds),
          categoriaIds.length
            ? supabase.from("categorias").select("id, nombre").in("id", categoriaIds)
            : Promise.resolve({ data: [] }),
        ]);
        setMisTorneos(
          inscripciones.map((i) => ({
            torneoId: i.torneo_id,
            torneoNombre: torneos?.find((t) => t.id === i.torneo_id)?.nombre ?? i.torneo_id,
            categoriaNombre: categorias?.find((c) => c.id === i.categoria_id)?.nombre ?? null,
          }))
        );
      });
  }, [user]);

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
        bici: form.bici,
        equipo: form.equipo,
        foto_url: form.foto_url,
        federado: form.federado,
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
        <h1 className="font-display text-2xl tracking-wide text-plat-text">MI PERFIL</h1>
        <p className="text-plat-text-dim text-sm">Tu identidad en todos los torneos. Un solo perfil, para siempre.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          <RiderAvatar nombre={form.nombre} fotoUrl={form.foto_url} categoriaId="" size={112} />
          <label className="text-xs uppercase tracking-widest text-plat-celeste cursor-pointer">
            {subiendoFoto ? "Subiendo…" : "Cambiar foto"}
            <input type="file" accept="image/*" onChange={handleFoto} className="hidden" disabled={subiendoFoto} />
          </label>
        </div>

        <Campo label="Nombre">
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full rounded-lg border border-plat-border bg-plat-surface text-plat-text px-3 py-2.5 text-sm"
            required
          />
        </Campo>

        <Campo label="Bici (marca y modelo)">
          <input
            value={form.bici ?? ""}
            onChange={(e) => setForm({ ...form, bici: e.target.value })}
            className="w-full rounded-lg border border-plat-border bg-plat-surface text-plat-text px-3 py-2.5 text-sm"
            placeholder="Ej: Commencal Supreme DH"
          />
        </Campo>

        <Campo label="Equipo / corre para">
          <input
            value={form.equipo ?? ""}
            onChange={(e) => setForm({ ...form, equipo: e.target.value })}
            className="w-full rounded-lg border border-plat-border bg-plat-surface text-plat-text px-3 py-2.5 text-sm"
            placeholder="Ej: Pachamama Racing"
          />
        </Campo>

        <label className="flex items-start gap-3 rounded-lg border border-plat-border bg-plat-surface px-3 py-3">
          <input
            type="checkbox"
            checked={form.federado}
            onChange={(e) => setForm({ ...form, federado: e.target.checked })}
            className="accent-plat-celeste w-4 h-4 mt-0.5 shrink-0"
          />
          <span className="text-sm text-plat-text">
            <span className="block font-semibold">Estoy federado (licencia FACiMo vigente)</span>
            <span className="block text-xs text-plat-text-dim mt-0.5">
              Dato autodeclarado — algunos torneos, como la Copa Argentina, solo suman puntos oficiales a
              corredores federados.
            </span>
          </span>
        </label>

        {error && <p className="text-sm text-tg-magenta">{error}</p>}

        <button
          type="submit"
          disabled={guardando || subiendoFoto}
          className="mt-2 rounded-lg bg-plat-celeste text-white font-semibold uppercase tracking-wide text-sm py-3 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>

        <AnimatePresence>
          {guardado && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-plat-celeste"
            >
              ✓ Perfil actualizado
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      {misTorneos.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-plat-text-dim mb-2">Corrés en</p>
          <div className="flex flex-col gap-2">
            {misTorneos.map((t) => (
              <Link
                key={t.torneoId}
                href={`/t/${t.torneoId}`}
                className="flex items-center justify-between rounded-lg border border-plat-border bg-plat-surface px-4 py-3"
              >
                <span className="font-semibold text-sm text-plat-text">{t.torneoNombre}</span>
                <span className="text-xs text-plat-text-dim">{t.categoriaNombre ?? "sin categoría"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link href="/" className="text-center text-xs uppercase tracking-widest text-plat-celeste">
        Ver todos los torneos →
      </Link>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-plat-text-dim mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function MiPerfilGated() {
  const { perfil, cargando } = useAuth();

  if (cargando) return <div className="py-16 text-center text-sm text-plat-text-dim">Cargando…</div>;
  if (!perfil) return <div className="py-16 text-center text-sm text-plat-text-dim">No se encontró tu perfil.</div>;

  return <MiPerfilForm key={perfil.id} perfilInicial={perfil} />;
}

export default function MiPerfilPage() {
  return (
    <RoleGate requiereSesion seccion="Mi perfil">
      <MiPerfilGated />
    </RoleGate>
  );
}
