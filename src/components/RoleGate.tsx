"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import type { Rol } from "@/lib/supabase/types";

const nombreRol: Record<Rol, string> = {
  corredor: "Corredor",
  organizador: "Organizador",
  superadmin: "Super admin",
};

interface RoleGateProps {
  permitido: Rol[];
  children: React.ReactNode;
}

export default function RoleGate({ permitido, children }: RoleGateProps) {
  const { user, rol, cargando } = useAuth();

  if (cargando) {
    return <div className="py-16 text-center text-sm text-tg-text-dim">Cargando…</div>;
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-3 rounded-2xl border border-tg-border bg-tg-surface p-8 mt-6"
      >
        <div className="w-12 h-12 rounded-full bg-tg-cyan/15 border border-tg-cyan/40 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-tg-cyan">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
        </div>
        <p className="font-display text-xl tracking-wide">NECESITÁS INICIAR SESIÓN</p>
        <p className="text-sm text-tg-text-dim max-w-xs">
          Entrá con tu cuenta de Tucumán Gravity para acceder a esta sección.
        </p>
        <Link
          href="/ingresar"
          className="mt-2 rounded-lg bg-tg-green text-tg-bg font-semibold uppercase tracking-wide text-sm px-6 py-2.5"
        >
          Ingresar
        </Link>
      </motion.div>
    );
  }

  if (!rol || !permitido.includes(rol)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-3 rounded-2xl border border-tg-border bg-tg-surface p-8 mt-6"
      >
        <div className="w-12 h-12 rounded-full bg-tg-magenta/15 border border-tg-magenta/40 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-tg-magenta">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <p className="font-display text-xl tracking-wide">ACCESO RESTRINGIDO</p>
        <p className="text-sm text-tg-text-dim max-w-xs">
          Tu cuenta es <strong className="text-tg-text">{rol ? nombreRol[rol] : "sin perfil"}</strong>. Esta
          sección es solo para {permitido.map((r) => nombreRol[r]).join(" / ")}.
        </p>
        <Link href="/" className="mt-2 text-xs uppercase tracking-widest text-tg-green hover:underline">
          Volver al inicio
        </Link>
      </motion.div>
    );
  }

  return <>{children}</>;
}
