import { notFound } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs";
import RankingList from "@/components/RankingList";
import TextDim from "@/components/TextDim";
import { createClient } from "@/lib/supabase/server";

interface RankingPageProps {
  params: Promise<{ torneo: string }>;
  searchParams: Promise<{ categoria?: string }>;
}

export default async function RankingPage({ params, searchParams }: RankingPageProps) {
  const { torneo: torneoId } = await params;
  const { categoria } = await searchParams;
  const supabase = await createClient();

  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre, descartes_permitidos, presentismo_puntos_por_fecha, requiere_federado, suma_fecha_regional")
    .eq("id", torneoId)
    .single();
  if (!torneo) notFound();

  const reglasActivas =
    torneo.descartes_permitidos > 0 || torneo.presentismo_puntos_por_fecha > 0 || torneo.suma_fecha_regional;

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
        <TextDim className="text-sm">
          {torneo.nombre} · acumulado general por categoría. Se recalcula con cada fecha cargada.
        </TextDim>
      </div>

      {categorias && categorias.length > 0 ? (
        <>
          <CategoryTabs categorias={categorias} activa={categoriaActiva} basePath={`/t/${torneoId}/ranking`} />

          <TextDim className="text-xs uppercase tracking-widest">
            {categoriaInfo?.nombre} · {filas?.length ?? 0} corredores
          </TextDim>

          {reglasActivas && (
            <TextDim className="text-xs -mt-2 leading-relaxed">
              Este torneo tiene reglas propias de puntaje:
              {torneo.descartes_permitidos > 0 && " se descarta la peor fecha ·"}
              {torneo.presentismo_puntos_por_fecha > 0 && ` +${torneo.presentismo_puntos_por_fecha} pts de presentismo por fecha corrida ·`}
              {torneo.requiere_federado && " solo suman los corredores federados ·"}
              {torneo.suma_fecha_regional && " suma bono por posición en tu regional"}
            </TextDim>
          )}

          <RankingList
            torneoId={torneoId}
            reglasActivas={reglasActivas}
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
                cantFechas: f.cant_fechas,
                puntosDescartados: f.puntos_descartados,
                puntosPresentismo: f.puntos_presentismo,
                puntosRegionalBonus: f.puntos_regional_bonus,
              };
            })}
          />
        </>
      ) : (
        <TextDim className="text-center text-sm py-10">
          Este torneo todavía no tiene categorías cargadas.
        </TextDim>
      )}
    </div>
  );
}
