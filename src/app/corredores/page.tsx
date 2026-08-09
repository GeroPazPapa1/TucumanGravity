import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CorredoresGrid from "@/components/CorredoresGrid";

export const metadata: Metadata = {
  title: "Corredores · Tucumán Gravity",
};

interface CorredoresPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

export default async function CorredoresPage({ searchParams }: CorredoresPageProps) {
  const { categoria } = await searchParams;
  const supabase = await createClient();

  const [{ data: categorias }, { data: corredores }] = await Promise.all([
    supabase.from("categorias").select("*").order("orden"),
    supabase
      .from("perfiles")
      .select("id, nombre, categoria_id, foto_url")
      .not("categoria_id", "is", null)
      .order("nombre"),
  ]);

  const filtroActivo = categoria && categorias?.some((c) => c.id === categoria) ? categoria : "todos";

  const lista = (corredores ?? []).filter(
    (c) => filtroActivo === "todos" || c.categoria_id === filtroActivo
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">CORREDORES</h1>
        <p className="text-tg-text-dim text-sm">
          {corredores?.length ?? 0} corredores registrados en Tucumán Gravity.
        </p>
      </div>

      <CorredoresGrid categorias={categorias ?? []} filtroActivo={filtroActivo} corredores={lista} />
    </div>
  );
}
