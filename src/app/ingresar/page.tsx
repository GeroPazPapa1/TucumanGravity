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
        <h1 className="font-display text-2xl tracking-wide">INICIAR SESIÓN</h1>
        <p className="text-tg-text-dim text-sm">Entrá a tu cuenta de Downhill App.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            placeholder="vos@ejemplo.com"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] uppercase tracking-widest text-tg-text-dim mb-1.5">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {enviando ? "Entrando…" : "Ingresar"}
        </button>
      </form>

      <p className="text-center text-sm text-tg-text-dim">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" className="text-tg-green">
          Registrate
        </Link>
      </p>
    </div>
  );
}
