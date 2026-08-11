import { createClient } from "@/lib/supabase/server";
import TorneoSelector from "@/components/TorneoSelector";

export default async function Home() {
  const supabase = await createClient();
  const { data: torneos } = await supabase.from("torneos").select("*").order("nombre");

  return <TorneoSelector torneos={torneos ?? []} />;
}
