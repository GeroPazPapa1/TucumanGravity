import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CarreraDetail from "@/components/CarreraDetail";
import type { GrupoCategoria } from "@/components/ResultadosPorFecha";

interface CarreraPageProps {
  params: Promise<{ torneo: string; id: string }>;
}

export async function generateMetadata({ params }: CarreraPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: carrera } = await supabase.from("carreras").select("nombre").eq("id", id).single();
  return { title: carrera ? `${carrera.nombre}` : "Carrera" };
}

export default async function CarreraDetailPage({ params }: CarreraPageProps) {
  const { torneo: torneoId, id } = await params;
  const supabase = await createClient();
  const [{ data: carrera }, { data: torneo }] = await Promise.all([
    supabase.from("carreras").select("*").eq("id", id).eq("torneo_id", torneoId).single(),
    supabase.from("torneos").select("requiere_federado").eq("id", torneoId).single(),
  ]);

  if (!carrera) notFound();

  const { data: resultados } = await supabase
    .from("resultados")
    .select("corredor_id, categoria_id, posicion, puntos")
    .eq("carrera_id", id)
    .order("posicion");

  let grupos: GrupoCategoria[] = [];

  if (resultados && resultados.length > 0) {
    const corredorIds = [...new Set(resultados.map((r) => r.corredor_id))];
    const categoriaIds = [...new Set(resultados.map((r) => r.categoria_id))];

    const [{ data: perfiles }, { data: categorias }] = await Promise.all([
      supabase.from("perfiles").select("id, nombre, federado").in("id", corredorIds),
      supabase.from("categorias").select("id, nombre, orden").in("id", categoriaIds),
    ]);

    const categoriasOrdenadas = (categorias ?? []).slice().sort((a, b) => a.orden - b.orden);

    grupos = categoriasOrdenadas
      .map((cat) => ({
        categoriaId: cat.id,
        categoriaNombre: cat.nombre,
        filas: resultados
          .filter((r) => r.categoria_id === cat.id)
          .map((r) => ({
            corredorId: r.corredor_id,
            nombre: perfiles?.find((p) => p.id === r.corredor_id)?.nombre ?? "Corredor",
            posicion: r.posicion,
            puntos: r.puntos,
            federado: perfiles?.find((p) => p.id === r.corredor_id)?.federado ?? true,
          }))
          .sort((a, b) => a.posicion - b.posicion),
      }))
      .filter((g) => g.filas.length > 0);
  }

  return (
    <CarreraDetail carrera={carrera} torneoId={torneoId} grupos={grupos} requiereFederado={torneo?.requiere_federado ?? false} />
  );
}
