import type { Metadata } from "next";
import CategoryTabs from "@/components/CategoryTabs";
import RankingList from "@/components/RankingList";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ranking · Tucumán Gravity",
};

interface RankingPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const { categoria } = await searchParams;
  const supabase = await createClient();

  const { data: categorias } = await supabase.from("categorias").select("*").order("orden");
  const categoriaActiva = categorias?.find((c) => c.id === categoria)?.id ?? categorias?.[0]?.id ?? "";

  const { data: filas } = await supabase
    .from("ranking_general")
    .select("*")
    .eq("categoria_id", categoriaActiva)
    .order("total_puntos", { ascending: false });

  const categoriaInfo = categorias?.find((c) => c.id === categoriaActiva);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">RANKING</h1>
        <p className="text-tg-text-dim text-sm">
          Acumulado general por categoría. Se recalcula con cada fecha cargada.
        </p>
      </div>

      <CategoryTabs categorias={categorias ?? []} activa={categoriaActiva} basePath="/ranking" />

      <p className="text-xs uppercase tracking-widest text-tg-text-dim">
        {categoriaInfo?.nombre} · {filas?.length ?? 0} corredores
      </p>

      <RankingList
        filas={(filas ?? []).map((f) => ({
          corredorId: f.corredor_id,
          nombre: f.nombre,
          numero: f.numero,
          bici: f.bici,
          equipo: f.equipo,
          fotoUrl: f.foto_url,
          categoriaId: f.categoria_id,
          totalPuntos: f.total_puntos,
          esPrecarga: f.es_precarga,
        }))}
      />
    </div>
  );
}
