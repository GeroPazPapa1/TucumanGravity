"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function CompletarPerfilPage() {
  const { user, perfil, cargando, refrescarPerfil } = useAuth();
  const router = useRouter();

  const [dni, setDni] = useState(perfil?.dni ?? "");
  const [fechaNacimiento, setFechaNacimiento] = useState(perfil?.fecha_nacimiento ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cargando) return <div className="py-16 text-center text-sm text-tg-text-dim">Cargando…</div>;
  if (!user) {
    router.replace("/ingresar");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    const dniLimpio = dni.trim();
    if (!/^\d{6,9}$/.test(dniLimpio)) {
      setError("Ingresá un DNI válido (solo números).");
      return;
    }
    if (!fechaNacimiento) {
      setError("Ingresá tu fecha de nacimiento.");
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("perfiles")
      .update({ dni: dniLimpio, fecha_nacimiento: fechaNacimiento })
      .eq("id", user.id);
    setEnviando(false);

    if (updateError) {
      if (updateError.message.toLowerCase().includes("duplicate") || updateError.message.includes("perfiles_dni_key")) {
        setError("Ya existe una cuenta registrada con este DNI. Si es tuya, contactanos.");
      } else {
        setError(updateError.message);
      }
      return;
    }

    await refrescarPerfil();
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-5 max-w-sm mx-auto pt-6">
      <div className="text-center">
        <h1 className="font-display text-2xl tracking-wide">COMPLETÁ TU PERFIL</h1>
        <p className="text-tg-text-dim text-sm mt-1">
          Necesitamos tu DNI y fecha de nacimiento para identificarte bien en cada torneo — así evitamos
          cuentas duplicadas y podemos ubicarte en tu categoría correcta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">DNI</span>
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            inputMode="numeric"
            required
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            placeholder="Sin puntos, solo números"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">
            Fecha de nacimiento
          </span>
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
          />
        </label>

        {error && <p className="text-sm text-tg-magenta">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="mt-1 rounded-lg bg-tg-green text-tg-bg font-semibold uppercase tracking-wide text-sm py-3 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Continuar"}
        </button>
      </form>
    </div>
  );
}
