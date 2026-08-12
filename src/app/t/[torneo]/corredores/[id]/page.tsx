import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CorredorPerfil from "@/components/CorredorPerfil";

interface CorredorPageProps {
  params: Promise<{ torneo: string; id: string }>;
}

export async function generateMetadata({ params }: CorredorPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: corredor } = await supabase.from("perfiles").select("nombre").eq("id", id).single();
  return { title: corredor ? corredor.nombre : "Corredor" };
}

export default async function CorredorPage({ params }: CorredorPageProps) {
  const { torneo: torneoId, id } = await params;
  const supabase = await createClient();

  const [{ data: torneo }, { data: corredor }, { data: inscripcion }] = await Promise.all([
    supabase
      .from("torneos")
      .select("id, nombre, descartes_permitidos, presentismo_puntos_por_fecha, requiere_federado, suma_fecha_regional")
      .eq("id", torneoId)
      .single(),
    supabase.from("perfiles").select("*").eq("id", id).single(),
    supabase
      .from("torneo_inscripciones")
      .select("*")
      .eq("torneo_id", torneoId)
      .eq("perfil_id", id)
      .maybeSingle(),
  ]);

  if (!torneo || !corredor) notFound();

  const { data: categoria } = inscripcion?.categoria_id
    ? await supabase.from("categorias").select("*").eq("id", inscripcion.categoria_id).single()
    : { data: null };

  let posicion: number | null = null;
  let totalPuntos: number | null = null;
  let cantFechas: number | null = null;
  let puntosSuma: number | null = null;
  let puntosDescartados: number | null = null;
  let puntosPresentismo: number | null = null;
  let puntosRegionalBonus: number | null = null;

  if (inscripcion?.categoria_id) {
    const { data: ranking } = await supabase
      .from("ranking_general")
      .select("*")
      .eq("torneo_id", torneoId)
      .eq("categoria_id", inscripcion.categoria_id)
      .order("total_puntos", { ascending: false });

    const index = (ranking ?? []).findIndex((r) => r.corredor_id === corredor.id);
    if (index >= 0) {
      const fila = ranking![index];
      posicion = index + 1;
      totalPuntos = fila.total_puntos;
      cantFechas = fila.cant_fechas;
      puntosSuma = fila.puntos_suma;
      puntosDescartados = fila.puntos_descartados;
      puntosPresentismo = fila.puntos_presentismo;
      puntosRegionalBonus = fila.puntos_regional_bonus;
    }
  }

  const reglasActivas =
    torneo.descartes_permitidos > 0 || torneo.presentismo_puntos_por_fecha > 0 || torneo.suma_fecha_regional;

  return (
    <CorredorPerfil
      torneoId={torneoId}
      torneoNombre={torneo.nombre}
      nombre={corredor.nombre}
      fotoUrl={corredor.foto_url}
      bici={corredor.bici}
      equipo={corredor.equipo}
      numero={inscripcion?.numero ?? null}
      categoriaNombre={categoria?.nombre ?? null}
      categoriaSlug={categoria?.slug ?? null}
      posicion={posicion}
      totalPuntos={totalPuntos}
      federado={corredor.federado}
      requiereFederado={torneo.requiere_federado}
      reglasActivas={reglasActivas}
      cantFechas={cantFechas}
      puntosSuma={puntosSuma}
      puntosDescartados={puntosDescartados}
      puntosPresentismo={puntosPresentismo}
      puntosRegionalBonus={puntosRegionalBonus}
    />
  );
}
