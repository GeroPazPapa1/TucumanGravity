"use client";

import Link from "next/link";
import PlatformLogo from "./PlatformLogo";
import AccountMenu from "./AccountMenu";
import { useEnTorneo } from "@/lib/useEnTorneo";

export default function Header() {
  const enTorneo = useEnTorneo();

  return (
    <header
      className={
        enTorneo
          ? "sticky top-0 z-40 border-b border-tg-border bg-tg-bg/95 backdrop-blur"
          : "sticky top-0 z-40 border-b border-plat-border bg-plat-surface/90 backdrop-blur"
      }
    >
      <div className="w-full max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <PlatformLogo size={40} />
          <div className="leading-none min-w-0">
            <p className="font-display text-lg tracking-wide truncate">
              {enTorneo ? (
                "DOWNHILL APP"
              ) : (
                <>
                  DOWNHILL <span className="text-plat-celeste">APP</span>
                </>
              )}
            </p>
            <p
              className={
                enTorneo
                  ? "text-[11px] uppercase tracking-widest text-tg-text-dim truncate"
                  : "text-[11px] uppercase tracking-widest text-plat-text-dim truncate"
              }
            >
              Todos los torneos, un solo lugar
            </p>
          </div>
        </Link>
        <div className="ml-auto">
          <AccountMenu />
        </div>
      </div>
      <div className="h-[3px] tg-gradient-bar-animated" />
    </header>
  );
}
