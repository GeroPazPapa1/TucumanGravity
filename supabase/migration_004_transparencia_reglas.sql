-- ============================================================================
-- Migración 004 — Transparencia del motor de reglas
-- Corré esto DESPUÉS de migration_003_motor_puntos.sql.
--
-- Qué hace: la vista ranking_general ya calculaba bien el total, pero no
-- exponía CÓMO llegó a ese número. Esto le agrega columnas de desglose
-- (federado, cuántas fechas corrió, cuánto sumó en pista, cuánto le
-- descontó el descarte, cuánto presentismo sumó, cuánto bono regional) más
-- las reglas del torneo (para que el frontend sepa si vale la pena mostrar
-- todo esto o no). Es un "create or replace" que solo AGREGA columnas al
-- final — no cambia ninguna existente, así que no rompe nada de lo que ya
-- lee la app hoy.
-- ============================================================================

create or replace view public.ranking_general
with (security_invoker = true) as
select
  ti.torneo_id,
  ti.categoria_id,
  p.id::text as corredor_id,
  p.nombre,
  ti.numero,
  p.bici,
  p.equipo,
  p.foto_url,
  ti.puntos_iniciales as puntos_base,
  (
    ti.puntos_iniciales
    + base.suma_puntos
    - case when t.descartes_permitidos >= 1 and base.cant_fechas > 0 then base.peor else 0 end
    + (t.presentismo_puntos_por_fecha * base.cant_fechas)
    + coalesce(regional.puntos_regional, 0)
  ) as total_puntos,
  false as es_precarga,
  p.federado as federado,
  base.cant_fechas as cant_fechas,
  base.suma_puntos as puntos_suma,
  (case when t.descartes_permitidos >= 1 and base.cant_fechas > 0 then base.peor else 0 end) as puntos_descartados,
  (t.presentismo_puntos_por_fecha * base.cant_fechas) as puntos_presentismo,
  coalesce(regional.puntos_regional, 0) as puntos_regional_bonus,
  t.requiere_federado as requiere_federado,
  t.descartes_permitidos as descartes_permitidos,
  t.presentismo_puntos_por_fecha as presentismo_puntos_por_fecha,
  t.suma_fecha_regional as suma_fecha_regional
from public.torneo_inscripciones ti
join public.perfiles p on p.id = ti.perfil_id
join public.torneos t on t.id = ti.torneo_id
cross join lateral (
  select
    coalesce(sum(r.puntos), 0)::int as suma_puntos,
    coalesce(min(r.puntos), 0)::int as peor,
    count(*)::int as cant_fechas
  from public.resultados r
  join public.carreras c on c.id = r.carrera_id
  where r.corredor_id = p.id and c.torneo_id = ti.torneo_id
) base
left join lateral (
  select ppp.puntos as puntos_regional
  from public.torneo_inscripciones ti_reg
  join public.torneos t_reg on t_reg.id = ti_reg.torneo_id and t_reg.tipo = 'regional'
  join public.ranking_simple_posicion rsp
    on rsp.torneo_id = ti_reg.torneo_id
   and rsp.categoria_id = ti_reg.categoria_id
   and rsp.corredor_id = p.id
  join public.puntos_por_posicion ppp
    on ppp.torneo_id = ti.torneo_id and ppp.posicion = rsp.posicion
  where t.suma_fecha_regional and ti_reg.perfil_id = p.id
  order by ppp.puntos desc
  limit 1
) regional on true
where ti.categoria_id is not null
  and (not t.requiere_federado or p.federado)

union all

select
  cp.torneo_id,
  cp.categoria_id,
  cp.id as corredor_id,
  cp.nombre,
  null as numero,
  null as bici,
  null as equipo,
  null as foto_url,
  cp.puntos_iniciales as puntos_base,
  cp.puntos_iniciales as total_puntos,
  true as es_precarga,
  null::boolean as federado,
  0 as cant_fechas,
  cp.puntos_iniciales as puntos_suma,
  0 as puntos_descartados,
  0 as puntos_presentismo,
  0 as puntos_regional_bonus,
  false as requiere_federado,
  0 as descartes_permitidos,
  0 as presentismo_puntos_por_fecha,
  false as suma_fecha_regional
from public.corredores_precarga cp
where cp.perfil_id is null;

grant select on public.ranking_general to anon, authenticated;
