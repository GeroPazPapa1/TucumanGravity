"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Rol } from "@/lib/supabase/types";

const nombreRol: Record<Rol, string> = {
  corredor: "Corredor",
  superadmin: "Super admin",
};

export default function AccountMenu() {
  const router = useRouter();
  const { user, perfil, rol, cargando, torneosOrganizados } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [torneosNombres, setTorneosNombres] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal solo puede montarse en cliente (evita mismatch de hidratación)
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || torneosOrganizados.length === 0) return;
    const supabase = createClient();
    supabase
      .from("torneos")
      .select("id, nombre")
      .in("id", torneosOrganizados)
      .then(({ data }) => setTorneosNombres(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function cerrarSesion() {
    setSaliendo(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    setSaliendo(false);
    router.push("/");
    router.refresh();
  }

  if (cargando) {
    return <div className="w-9 h-9 rounded-full border border-tg-border bg-tg-surface animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/ingresar"
        className="rounded-full border border-tg-green text-tg-green px-3 py-2 text-xs font-semibold uppercase tracking-wide shrink-0"
      >
        Ingresar
      </Link>
    );
  }

  const sheet = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-tg-border bg-tg-surface p-5 pb-8 max-w-3xl mx-auto max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display text-lg tracking-wide">{perfil?.nombre ?? "Tu cuenta"}</p>
                <p className="text-xs text-tg-text-dim">{user.email}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-tg-text-dim p-1" aria-label="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {rol && (
              <span className="inline-block mb-4 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border border-tg-green/40 bg-tg-green/10 text-tg-green">
                {nombreRol[rol]}
              </span>
            )}

            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-tg-border bg-tg-bg px-4 py-3 text-sm font-semibold"
              >
                Ver todos los torneos
              </Link>
              <Link
                href="/mi-perfil"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-tg-border bg-tg-bg px-4 py-3 text-sm font-semibold"
              >
                Mi perfil
              </Link>

              {torneosOrganizados.length > 0 && (
                <>
                  <p className="text-[11px] uppercase tracking-widest text-tg-text-dim mt-2">Organizás</p>
                  {(torneosNombres.length ? torneosNombres : torneosOrganizados.map((id) => ({ id, nombre: id }))).map(
                    (t) => (
                      <Link
                        key={t.id}
                        href={`/t/${t.id}/organizador`}
                        onClick={() => setOpen(false)}
                        className="rounded-lg border border-tg-border bg-tg-bg px-4 py-3 text-sm font-semibold"
                      >
                        Panel de {t.nombre}
                      </Link>
                    )
                  )}
                </>
              )}

              {rol === "superadmin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-tg-border bg-tg-bg px-4 py-3 text-sm font-semibold"
                >
                  Panel de super admin
                </Link>
              )}
              <button
                onClick={cerrarSesion}
                disabled={saliendo}
                className="mt-2 rounded-lg bg-tg-magenta/10 border border-tg-magenta/40 text-tg-magenta px-4 py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
              >
                {saliendo ? "Saliendo…" : "Cerrar sesión"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-tg-border bg-tg-surface px-3 py-2 text-tg-green shrink-0"
        aria-label="Mi cuenta"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-tg-text-dim">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {mounted && createPortal(sheet, document.body)}
    </>
  );
}
