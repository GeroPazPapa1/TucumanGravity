import { notFound } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs";
import RankingList from "@/components/RankingList";
import { createClient } from "@/lib/supabase/server";

interface RankingPageProps {
  params: Promise<{ torneo: string }>;
  searchParams: Promise<{ categoria?: string }>;
}

export default async function RankingPage({ params, searchParams }: RankingPageProps) {
  const { torneo: torneoId } = await params;
  const { categoria } = await searchParams;
  const supabase = await createClient();

  const { data: torneo } = await supabase.from("torneos").select("id, nombre").eq("id", torneoId).single();
  if (!torneo) notFound();

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .eq("torneo_id", torneoId)
    .order("orden");

  const categoriaActiva = categorias?.find((c) => c.id === categoria)?.id ?? categorias?.[0]?.id ?? "";
  const categoriaInfo = categorias?.find((c) => c.id === categoriaActiva);

  const { data: filas } = categoriaActiva
    ? await supabase
        .from("ranking_general")
        .select("*")
        .eq("torneo_id", torneoId)
        .eq("categoria_id", categoriaActiva)
        .order("total_puntos", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">RANKING</h1>
        <p className="text-tg-text-dim text-sm">
          {torneo.nombre} · acumulado general por categoría. Se recalcula con cada fecha cargada.
        </p>
      </div>

      {categorias && categorias.length > 0 ? (
        <>
          <CategoryTabs categorias={categorias} activa={categoriaActiva} basePath={`/t/${torneoId}/ranking`} />

          <p className="text-xs uppercase tracking-widest text-tg-text-dim">
            {categoriaInfo?.nombre} · {filas?.length ?? 0} corredores
          </p>

          <RankingList
            torneoId={torneoId}
            filas={(filas ?? []).map((f) => {
              const cat = categorias.find((c) => c.id === f.categoria_id);
              return {
                corredorId: f.corredor_id,
                nombre: f.nombre,
                numero: f.numero,
                bici: f.bici,
                equipo: f.equipo,
                fotoUrl: f.foto_url,
                categoriaSlug: cat?.slug ?? "",
                totalPuntos: f.total_puntos,
                esPrecarga: f.es_precarga,
              };
            })}
          />
        </>
      ) : (
        <p className="text-center text-tg-text-dim text-sm py-10">
          Este torneo todavía no tiene categorías cargadas.
        </p>
      )}
    </div>
  );
}
