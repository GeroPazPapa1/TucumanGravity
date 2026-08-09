const sponsors = [
  { nombre: "Radoc" },
  { nombre: "Commencal" },
];

export default function SponsorFooter() {
  return (
    <div className="mt-10 border-t border-tg-border pt-5">
      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-tg-text-dim mb-3">
        Sponsors del torneo
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {sponsors.map((s) => (
          <span
            key={s.nombre}
            className="px-4 py-2 rounded-md border border-tg-border bg-tg-surface font-display text-sm tracking-wide text-tg-text-dim"
          >
            {s.nombre}
          </span>
        ))}
        <span className="px-4 py-2 rounded-md border border-dashed border-tg-border text-[11px] uppercase tracking-wide text-tg-text-dim/70">
          Espacio para sponsor
        </span>
      </div>
    </div>
  );
}
