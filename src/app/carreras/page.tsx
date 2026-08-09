import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CarrerasList from "@/components/CarrerasList";

export const metadata: Metadata = {
  title: "Carreras · Tucumán Gravity",
};

export default async function CarrerasPage() {
  const supabase = await createClient();
  const { data: carreras } = await supabase.from("carreras").select("*").order("numero");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">CARRERAS</h1>
        <p className="text-tg-text-dim text-sm">Así se viene dando el campeonato, fecha a fecha.</p>
      </div>

      <CarrerasList carreras={carreras ?? []} />
    </div>
  );
}
