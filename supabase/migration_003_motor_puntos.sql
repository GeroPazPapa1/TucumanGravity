-- ============================================================================
-- Migración 003 — Motor de reglas de puntaje por torneo
-- Corré esto DESPUÉS de migration_002_multi_torneo.sql, una sola vez.
--
-- Qué hace: le suma a cada torneo su propia configuración de reglas
-- (cuántas fechas se descartan, si hay bono de presentismo, si hace falta
-- estar federado, si suma una fecha extra del regional) y recalcula el
-- ranking general con esas reglas — con los valores por defecto (0/false),
-- el resultado da EXACTAMENTE IGUAL que hoy, así que ningún otro torneo
-- se rompe. Solo Copa Argentina queda con sus reglas reales activadas.
-- ============================================================================

-- ============================================================================
-- 1. REGLAS POR TORNEO
-- ============================================================================

alter table public.torneos add column if not exists descartes_permitidos int not null default 0;
alter table public.torneos add column if not exists presentismo_puntos_por_fecha int not null default 0;
alter table public.torneos add column if not exists requiere_federado boolean not null default false;
alter table public.torneos add column if not exists suma_fecha_regional boolean not null default false;

-- ============================================================================
-- 2. FEDERADO: dato autodeclarado del corredor (sin validación automática,
--    tal como lo definimos — es un check simple, no una integración con FACiMo).
-- ============================================================================

alter table public.perfiles add column if not exists federado boolean not null default false;

-- ============================================================================
-- 3. TABLA DE PUNTOS POR POSICIÓN (para traducir la posición del corredor
--    en su torneo regional a puntos equivalentes en Copa Argentina)
-- ============================================================================

create table if not exists public.puntos_por_posicion (
  torneo_id text not null references public.torneos (id),
  posicion int not null,
  puntos int not null,
  primary key (torneo_id, posicion)
);

alter table public.puntos_por_posicion enable row level security;
drop policy if exists "puntos por posicion visibles para todos" on public.puntos_por_posicion;
create policy "puntos por posicion visibles para todos" on public.puntos_por_posicion for select using (true);

insert into public.puntos_por_posicion (torneo_id, posicion, puntos)
select 'copa-argentina', x.posicion, x.puntos
from (values
  (1,300),(2,250),(3,220),(4,200),(5,190),(6,180),(7,170),(8,160),(9,150),(10,140),
  (11,130),(12,120),(13,110),(14,100),(15,90),(16,80),(17,70),(18,60),(19,55),(20,50),
  (21,45),(22,40),(23,35),(24,30),(25,25),(26,20),(27,15),(28,10),(29,5),(30,3)
) as x(posicion, puntos)
on conflict (torneo_id, posicion) do nothing;

-- ============================================================================
-- 4. ACTIVAR LAS REGLAS REALES DE COPA ARGENTINA
--    - 1 fecha de descarte
--    - +20 puntos de presentismo por cada fecha corrida (acumulativo)
--    - solo suman puntos los corredores federados (FACiMo)
--    - se suma una fecha extra según la posición en el torneo regional
-- ============================================================================

update public.torneos
set descartes_permitidos = 1,
    presentismo_puntos_por_fecha = 20,
    requiere_federado = true,
    suma_fecha_regional = true
where id = 'copa-argentina';

-- ============================================================================
-- 5. RANKING SIMPLE: el cálculo de siempre (sin reglas avanzadas), usado
--    como base para calcular la posición regional de cada corredor sin caer
--    en una definición circular dentro de la vista avanzada.
-- ============================================================================

create or replace view public.ranking_simple_posicion
with (security_invoker = true) as
select
  torneo_id,
  categoria_id,
  corredor_id,
  total_puntos,
  rank() over (partition by torneo_id, categoria_id order by total_puntos desc) as posicion
from (
  select
    ti.torneo_id,
    ti.categoria_id,
    p.id as corredor_id,
    ti.puntos_iniciales + coalesce(
      (
        select sum(r.puntos)
        from public.resultados r
        join public.carreras c on c.id = r.carrera_id
        where r.corredor_id = p.id and c.torneo_id = ti.torneo_id
      ), 0
    ) as total_puntos
  from public.torneo_inscripciones ti
  join public.perfiles p on p.id = ti.perfil_id
  where ti.categoria_id is not null
) base;

grant select on public.ranking_simple_posicion to anon, authenticated;

-- ============================================================================
-- 6. RANKING GENERAL (avanzado): reemplaza la vista anterior. Con las
--    reglas en 0/false (todos los torneos salvo Copa Argentina) da el mismo
--    resultado que antes. Con las reglas activas, aplica descarte,
--    presentismo, filtro de federado y bono de fecha regional.
-- ============================================================================

-- drop en vez de replace: la versión anterior de la vista tenía
-- total_puntos como bigint, y Postgres no deja cambiar el tipo de una
-- columna con "create or replace view" — hay que tirarla y crearla de nuevo.
drop view if exists public.ranking_general;

create view public.ranking_general
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
  false as es_precarga
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
  true as es_precarga
from public.corredores_precarga cp
where cp.perfil_id is null;

grant select on public.ranking_general to anon, authenticated;
