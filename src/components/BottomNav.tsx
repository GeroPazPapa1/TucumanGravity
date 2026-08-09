"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const items: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/corredores",
    label: "Corredores",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="9" r="2.3" />
        <path d="M15 20c.3-2.6 2.1-4.6 4.6-5" />
      </svg>
    ),
  },
  {
    href: "/ranking",
    label: "Ranking",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
        <path d="M4 21V13" />
        <path d="M12 21V7" />
        <path d="M20 21V11" />
        <path d="M2 21h20" />
      </svg>
    ),
  },
  {
    href: "/carreras",
    label: "Carreras",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
        <path d="M5 3v18" />
        <path d="M5 4h11l-2 3.2L16 10H5" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-tg-border bg-tg-bg/95 backdrop-blur">
      <div className="w-full max-w-3xl mx-auto grid grid-cols-3">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                active ? "text-tg-green" : "text-tg-text-dim hover:text-tg-text"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-3 top-0.5 h-0.5 rounded-full bg-tg-green"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
