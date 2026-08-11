"use client";

import { useEnTorneo } from "@/lib/useEnTorneo";

export default function TextDim({
  children,
  className = "",
  as: Tag = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span";
}) {
  const enTorneo = useEnTorneo();
  return (
    <Tag className={`${className} ${enTorneo ? "text-tg-text-dim" : "text-plat-text-dim"}`}>{children}</Tag>
  );
}
