import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeHero from "@/components/HomeHero";
import InscripcionWidget from "@/components/InscripcionWidget";

interface TorneoHomeProps {
  params: Promise<{ torneo: string }>;
}

export default async function TorneoHomePage({ params }: TorneoHomeProps) {
  const { torneo: torneoId } = await params;
  const supabase = await createClient();

  const { data: torneo } = await supabase.from("torneos").select("*").eq("id", torneoId).single();
  if (!torneo) notFound();

  const [{ data: categorias }, { data: carreras }, { data: ranking }] = await Promise.all([
    supabase.from("categorias").select("*").eq("torneo_id", torneoId).order("orden"),
    supabase.from("carreras").select("*").eq("torneo_id", torneoId).order("numero"),
    supabase.from("ranking_general").select("*").eq("torneo_id", torneoId),
  ]);

  const proximaCarrera = (carreras ?? []).find((c) => c.estado === "proxima") ?? null;
  const carrerasDisputadas = (carreras ?? []).filter((c) => c.estado === "disputada").length;
  const totalCarreras = carreras?.length ?? 0;

  const lideres = (categorias ?? [])
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((categoria) => {
      const deLaCategoria = (ranking ?? [])
        .filter((r) => r.categoria_id === categoria.id)
        .sort((a, b) => b.total_puntos - a.total_puntos);
      const lider = deLaCategoria[0];
      if (!lider) return null;
      return {
        categoriaId: categoria.id,
        categoriaSlug: categoria.slug,
        categoriaNombre: categoria.nombre,
        nombre: lider.nombre,
        fotoUrl: lider.foto_url,
        totalPuntos: lider.total_puntos,
        corredorId: lider.corredor_id,
        esPrecarga: lider.es_precarga,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <div className="flex flex-col gap-4">
      <InscripcionWidget torneoId={torneoId} torneoNombre={torneo.nombre} categorias={categorias ?? []} />
      <HomeHero
        torneo={torneo}
        proximaCarrera={proximaCarrera}
        carrerasDisputadas={carrerasDisputadas}
        totalCarreras={totalCarreras}
        lideres={lideres}
      />
    </div>
  );
}
