import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CorredoresGrid from "@/components/CorredoresGrid";
import TextDim from "@/components/TextDim";

interface CorredoresPageProps {
  params: Promise<{ torneo: string }>;
  searchParams: Promise<{ categoria?: string }>;
}

export default async function CorredoresPage({ params, searchParams }: CorredoresPageProps) {
  const { torneo: torneoId } = await params;
  const { categoria } = await searchParams;
  const supabase = await createClient();

  const { data: torneo } = await supabase.from("torneos").select("id, nombre").eq("id", torneoId).single();
  if (!torneo) notFound();

  const [{ data: categorias }, { data: inscripciones }] = await Promise.all([
    supabase.from("categorias").select("*").eq("torneo_id", torneoId).order("orden"),
    supabase
      .from("torneo_inscripciones")
      .select("perfil_id, categoria_id")
      .eq("torneo_id", torneoId)
      .not("categoria_id", "is", null),
  ]);

  const perfilIds = (inscripciones ?? []).map((i) => i.perfil_id);
  const { data: perfilesData } = perfilIds.length
    ? await supabase.from("perfiles").select("id, nombre, foto_url").in("id", perfilIds).order("nombre")
    : { data: [] };

  const corredores = (perfilesData ?? [])
    .map((p) => {
      const inscripcion = (inscripciones ?? []).find((i) => i.perfil_id === p.id);
      const cat = categorias?.find((c) => c.id === inscripcion?.categoria_id);
      return {
        id: p.id,
        nombre: p.nombre,
        fotoUrl: p.foto_url,
        categoriaId: cat?.id ?? null,
        categoriaNombre: cat?.nombre ?? null,
        categoriaSlug: cat?.slug ?? null,
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const filtroActivo = categoria && categorias?.some((c) => c.id === categoria) ? categoria : "todos";
  const lista = corredores.filter((c) => filtroActivo === "todos" || c.categoriaId === filtroActivo);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">CORREDORES</h1>
        <TextDim className="text-sm">
          {corredores.length} corredores registrados en {torneo.nombre}.
        </TextDim>
      </div>

      <CorredoresGrid torneoId={torneoId} categorias={categorias ?? []} filtroActivo={filtroActivo} corredores={lista} />
    </div>
  );
}
