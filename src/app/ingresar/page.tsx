"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function IngresarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setEnviando(false);

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError("Todavía no confirmaste tu email. Revisá tu casilla de entrada.");
      } else if (signInError.message.toLowerCase().includes("invalid login")) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-plat-text">INICIAR SESIÓN</h1>
        <p className="text-plat-text-dim text-sm">Entrá a tu cuenta de Downhill App.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-widest text-plat-text-dim mb-1.5">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-plat-border bg-plat-surface px-3 py-2.5 text-sm text-plat-text"
            placeholder="vos@ejemplo.com"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] uppercase tracking-widest text-plat-text-dim mb-1.5">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-plat-border bg-plat-surface px-3 py-2.5 text-sm text-plat-text"
          />
        </label>

        {error && <p className="text-sm text-tg-magenta">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="mt-1 rounded-lg bg-plat-celeste text-white font-semibold uppercase tracking-wide text-sm py-3 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {enviando ? "Entrando…" : "Ingresar"}
        </button>
      </form>

      <p className="text-center text-sm text-plat-text-dim">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" className="text-plat-celeste font-semibold">
          Registrate
        </Link>
      </p>
    </div>
  );
}
