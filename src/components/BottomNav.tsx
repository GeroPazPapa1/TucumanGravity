"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const tabs: { slug: string; label: string; icon: ReactNode }[] = [
  {
    slug: "corredores",
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
    slug: "ranking",
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
    slug: "carreras",
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

  const match = pathname?.match(/^\/t\/([^/]+)/);
  const torneoId = match?.[1];

  if (!torneoId) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-tg-border bg-tg-bg/95 backdrop-blur">
      <div className="w-full max-w-3xl mx-auto grid grid-cols-3">
        {tabs.map((tab) => {
          const href = `/t/${torneoId}/${tab.slug}`;
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={tab.slug}
              href={href}
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
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
