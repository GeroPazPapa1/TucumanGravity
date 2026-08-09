import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CarreraDetail from "@/components/CarreraDetail";

interface CarreraPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CarreraPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: carrera } = await supabase.from("carreras").select("nombre").eq("id", id).single();
  return { title: carrera ? `${carrera.nombre} · Tucumán Gravity` : "Carrera · Tucumán Gravity" };
}

export default async function CarreraDetailPage({ params }: CarreraPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: carrera } = await supabase.from("carreras").select("*").eq("id", id).single();

  if (!carrera) notFound();

  return <CarreraDetail carrera={carrera} />;
}
