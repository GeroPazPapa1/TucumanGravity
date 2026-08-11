import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CarrerasList from "@/components/CarrerasList";
import TextDim from "@/components/TextDim";

interface CarrerasPageProps {
  params: Promise<{ torneo: string }>;
}

export default async function CarrerasPage({ params }: CarrerasPageProps) {
  const { torneo: torneoId } = await params;
  const supabase = await createClient();

  const { data: torneo } = await supabase.from("torneos").select("id, nombre").eq("id", torneoId).single();
  if (!torneo) notFound();

  const { data: carreras } = await supabase
    .from("carreras")
    .select("*")
    .eq("torneo_id", torneoId)
    .order("numero");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">CARRERAS</h1>
        <TextDim className="text-sm">{torneo.nombre} · así se viene dando el campeonato, fecha a fecha.</TextDim>
      </div>

      <CarrerasList carreras={carreras ?? []} torneoId={torneoId} />
    </div>
  );
}
