import { createClient } from "@/lib/supabase/server";
import HomeHero from "@/components/HomeHero";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: categorias }, { data: carreras }, { data: ranking }] = await Promise.all([
    supabase.from("categorias").select("*").order("orden"),
    supabase.from("carreras").select("*").order("numero"),
    supabase.from("ranking_general").select("*"),
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
    <HomeHero
      proximaCarrera={proximaCarrera}
      carrerasDisputadas={carrerasDisputadas}
      totalCarreras={totalCarreras}
      lideres={lideres}
    />
  );
}
