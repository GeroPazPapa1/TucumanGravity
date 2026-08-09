import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CorredorPerfil from "@/components/CorredorPerfil";

interface CorredorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CorredorPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: corredor } = await supabase.from("perfiles").select("nombre").eq("id", id).single();
  return { title: corredor ? `${corredor.nombre} · Tucumán Gravity` : "Corredor · Tucumán Gravity" };
}

export default async function CorredorPage({ params }: CorredorPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: corredor } = await supabase.from("perfiles").select("*").eq("id", id).single();
  if (!corredor) notFound();

  const { data: categoria } = corredor.categoria_id
    ? await supabase.from("categorias").select("*").eq("id", corredor.categoria_id).single()
    : { data: null };

  let posicion: number | null = null;
  let totalPuntos: number | null = null;

  if (corredor.categoria_id) {
    const { data: ranking } = await supabase
      .from("ranking_general")
      .select("corredor_id, total_puntos")
      .eq("categoria_id", corredor.categoria_id)
      .order("total_puntos", { ascending: false });

    const index = (ranking ?? []).findIndex((r) => r.corredor_id === corredor.id);
    if (index >= 0) {
      posicion = index + 1;
      totalPuntos = ranking![index].total_puntos;
    }
  }

  return (
    <CorredorPerfil
      corredor={corredor}
      categoriaNombre={categoria?.nombre ?? null}
      posicion={posicion}
      totalPuntos={totalPuntos}
    />
  );
}
