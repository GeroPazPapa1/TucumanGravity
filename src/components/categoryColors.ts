const accents = {
  "master-pro": { text: "text-tg-violet", bg: "bg-tg-violet/15", border: "border-tg-violet/40" },
  pro: { text: "text-tg-magenta", bg: "bg-tg-magenta/15", border: "border-tg-magenta/40" },
  elite: { text: "text-tg-cyan", bg: "bg-tg-cyan/15", border: "border-tg-cyan/40" },
  "ebike-elite": { text: "text-tg-amber", bg: "bg-tg-amber/15", border: "border-tg-amber/40" },
} as const;

const defaultAccentOscuro = { text: "text-tg-text-dim", bg: "bg-tg-surface", border: "border-tg-border" };
const defaultAccentClaro = { text: "text-plat-text-dim", bg: "bg-plat-surface-alt", border: "border-plat-border" };

export function getCategoryAccent(categoriaId: string, claro = false) {
  return accents[categoriaId as keyof typeof accents] ?? (claro ? defaultAccentClaro : defaultAccentOscuro);
}
