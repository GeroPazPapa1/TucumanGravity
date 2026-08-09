export default function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <div className="w-9 h-9 rounded-full border-2 border-tg-border border-t-tg-green animate-spin" />
      <p className="text-xs uppercase tracking-widest text-tg-text-dim">Cargando…</p>
    </div>
  );
}
