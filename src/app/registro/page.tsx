"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
        emailRedirectTo: `${window.location.origin}/ingresar`,
      },
    });
    setEnviando(false);

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already registered")) {
        setError("Ese email ya tiene una cuenta. Probá iniciar sesión.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-3 py-16"
      >
        <p className="font-display text-2xl tracking-wide">REVISÁ TU EMAIL</p>
        <p className="text-sm text-tg-text-dim max-w-xs">
          Te mandamos un link de confirmación a <strong className="text-tg-text">{email}</strong>. Tocalo para
          activar tu cuenta y ya podés entrar.
        </p>
        <Link href="/ingresar" className="mt-2 text-tg-green text-xs uppercase tracking-widest">
          Ir a iniciar sesión
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl tracking-wide">CREAR CUENTA</h1>
        <p className="text-tg-text-dim text-sm">Sumate a Tucumán Gravity con tu perfil de corredor.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Campo label="Nombre">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            placeholder="Tu nombre y apellido"
          />
        </Campo>

        <Campo label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            placeholder="vos@ejemplo.com"
          />
        </Campo>

        <Campo label="Contraseña">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
            placeholder="Al menos 6 caracteres"
          />
        </Campo>

        <Campo label="Confirmar contraseña">
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            className="w-full rounded-lg border border-tg-border bg-tg-surface px-3 py-2.5 text-sm"
          />
        </Campo>

        {error && <p className="text-sm text-tg-magenta">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="mt-1 rounded-lg bg-tg-green text-tg-bg font-semibold uppercase tracking-wide text-sm py-3 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-tg-text-dim">
        ¿Ya tenés cuenta?{" "}
        <Link href="/ingresar" className="text-tg-green">
          Iniciá sesión
        </Link>
      </p>
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
