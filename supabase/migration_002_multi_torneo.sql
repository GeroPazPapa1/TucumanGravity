-- ============================================================================
-- Migración 002 — Estructura multi-torneo
-- Corré esto DESPUÉS de schema.sql + seed.sql, una sola vez, en el SQL
-- Editor de Supabase. Es seguro volver a correrlo (usa "if not exists" /
-- "or replace" en todo lo que se puede).
--
-- Qué hace: convierte la app de "un solo torneo" a "muchos torneos", cada
-- uno con sus propias categorías, carreras, corredores inscriptos y
-- organizador — sin perder los datos de Tucumán Gravity que ya existen
-- (quedan migrados adentro del torneo 'tucuman-gravity').
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE TORNEOS
-- ============================================================================

create table if not exists public.torneos (
  id text primary key,
  nombre text not null,
  tipo text not null default 'regional' check (tipo in ('regional', 'nacional', 'internacional')),
  activo boolean not null default true,
  logo_url text,
  color_primario text,
  color_secundario text,
  created_at timestamptz not null default now()
);

alter table public.torneos enable row level security;

drop policy if exists "torneos visibles para todos" on public.torneos;
create policy "torneos visibles para todos" on public.torneos for select using (true);

drop policy if exists "superadmin gestiona torneos" on public.torneos;
create policy "superadmin gestiona torneos" on public.torneos for all
  using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

insert into public.torneos (id, nombre, tipo) values
  ('tucuman-gravity', 'Tucumán Gravity', 'regional'),
  ('cordoba', 'Regional Córdoba', 'regional'),
  ('mendoza', 'Regional Mendoza', 'regional'),
  ('patagonia', 'Regional Patagonia', 'regional'),
  ('copa-argentina', 'Copa Argentina', 'nacional'),
  ('open-shimano', 'Open Shimano', 'internacional'),
  ('latam', 'Latam', 'internacional'),
  ('campeonato-argentino', 'Campeonato Argentino', 'nacional')
on conflict (id) do nothing;

-- ============================================================================
-- 2. PERFILES: identidad real de la persona (DNI, fecha de nacimiento)
--    Se saca "numero", "categoria_id" y "puntos_iniciales" de acá: ahora
--    son datos de la INSCRIPCIÓN a un torneo puntual, no de la persona.
-- ============================================================================

alter table public.perfiles add column if not exists dni text;
alter table public.perfiles add column if not exists fecha_nacimiento date;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'perfiles_dni_key'
  ) then
    alter table public.perfiles add constraint perfiles_dni_key unique (dni);
  end if;
end $$;

-- ============================================================================
-- 3. CATEGORÍAS: pasan a tener id propio (uuid) y ser específicas de cada
--    torneo (el mismo nombre "Master Pro" puede significar algo distinto
--    en cada torneo).
-- ============================================================================

create table if not exists public.categorias_v2 (
  id uuid primary key default gen_random_uuid(),
  torneo_id text not null references public.torneos (id),
  slug text not null,
  nombre text not null,
  orden int not null,
  edad_min int,
  edad_max int,
  genero text check (genero in ('masculino', 'femenino', 'mixto')),
  unique (torneo_id, slug)
);

insert into public.categorias_v2 (torneo_id, slug, nombre, orden)
select 'tucuman-gravity', id, nombre, orden
from public.categorias
on conflict (torneo_id, slug) do nothing;

-- ============================================================================
-- 4. TORNEO_INSCRIPCIONES: en qué torneo está anotado cada corredor, con
--    qué categoría, número y puntos_iniciales en ESE torneo puntual.
-- ============================================================================

create table if not exists public.torneo_inscripciones (
  id uuid primary key default gen_random_uuid(),
  torneo_id text not null references public.torneos (id),
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  categoria_id uuid references public.categorias_v2 (id),
  numero int,
  puntos_iniciales int not null default 0,
  created_at timestamptz not null default now(),
  unique (torneo_id, perfil_id)
);

-- Migrar a los corredores que ya tenían categoría cargada en Tucumán Gravity
insert into public.torneo_inscripciones (torneo_id, perfil_id, categoria_id, numero, puntos_iniciales)
select
  'tucuman-gravity',
  p.id,
  cv2.id,
  p.numero,
  coalesce(p.puntos_iniciales, 0)
from public.perfiles p
join public.categorias_v2 cv2
  on cv2.torneo_id = 'tucuman-gravity' and cv2.slug = p.categoria_id
where p.categoria_id is not null
on conflict (torneo_id, perfil_id) do nothing;

-- ============================================================================
-- 5. CARRERAS y CORREDORES_PRECARGA: pasan a pertenecer a un torneo
-- ============================================================================

alter table public.carreras add column if not exists torneo_id text references public.torneos (id);
update public.carreras set torneo_id = 'tucuman-gravity' where torneo_id is null;
alter table public.carreras alter column torneo_id set not null;

alter table public.corredores_precarga add column if not exists torneo_id text references public.torneos (id);
update public.corredores_precarga set torneo_id = 'tucuman-gravity' where torneo_id is null;
alter table public.corredores_precarga alter column torneo_id set not null;

-- corredores_precarga.categoria_id pasa de texto (slug) a uuid (categorias_v2)
alter table public.corredores_precarga add column if not exists categoria_id_v2 uuid references public.categorias_v2 (id);
update public.corredores_precarga cp
set categoria_id_v2 = cv2.id
from public.categorias_v2 cv2
where cv2.torneo_id = cp.torneo_id and cv2.slug = cp.categoria_id
  and cp.categoria_id_v2 is null;

-- resultados.categoria_id pasa de texto (slug) a uuid (categorias_v2)
alter table public.resultados add column if not exists categoria_id_v2 uuid references public.categorias_v2 (id);
update public.resultados r
set categoria_id_v2 = cv2.id
from public.carreras c, public.categorias_v2 cv2
where c.id = r.carrera_id and cv2.torneo_id = c.torneo_id and cv2.slug = r.categoria_id
  and r.categoria_id_v2 is null;

-- ============================================================================
-- 6. SWAP: dejar categorias_v2 como la tabla real "categorias"
-- ============================================================================

drop view if exists public.ranking_general;

alter table public.categorias rename to categorias_legacy;
alter table public.categorias_v2 rename to categorias;

alter table public.corredores_precarga drop column if exists categoria_id;
alter table public.corredores_precarga rename column categoria_id_v2 to categoria_id;
alter table public.corredores_precarga alter column categoria_id set not null;

alter table public.resultados drop column if exists categoria_id;
alter table public.resultados rename column categoria_id_v2 to categoria_id;
alter table public.resultados alter column categoria_id set not null;

alter table public.perfiles drop column if exists categoria_id;
alter table public.perfiles drop column if exists puntos_iniciales;
alter table public.perfiles drop column if exists numero;

drop table if exists public.categorias_legacy;

-- ============================================================================
-- 7. TORNEO_MIEMBROS: quién es organizador de cada torneo (reemplaza el
--    rol global "organizador" — ahora es por torneo).
-- ============================================================================

create table if not exists public.torneo_miembros (
  id uuid primary key default gen_random_uuid(),
  torneo_id text not null references public.torneos (id),
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  rol text not null default 'organizador' check (rol in ('organizador')),
  created_at timestamptz not null default now(),
  unique (torneo_id, perfil_id)
);

-- ============================================================================
-- 8. FUNCIÓN HELPER: ¿esta sesión es organizadora de este torneo puntual?
--    (superadmin siempre cuenta como organizador de cualquier torneo)
-- ============================================================================

create or replace function public.es_organizador_de(p_torneo_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.rol_actual() = 'superadmin'
    or exists (
      select 1 from public.torneo_miembros tm
      where tm.perfil_id = auth.uid() and tm.torneo_id = p_torneo_id and tm.rol = 'organizador'
    );
$$;

-- ============================================================================
-- 9. FUNCIONES: gestionar organizadores por torneo (solo superadmin)
-- ============================================================================

create or replace function public.asignar_organizador(p_torneo_id text, p_perfil_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.rol_actual() is distinct from 'superadmin' then
    raise exception 'Solo el super admin puede asignar organizadores';
  end if;

  insert into public.torneo_miembros (torneo_id, perfil_id, rol)
  values (p_torneo_id, p_perfil_id, 'organizador')
  on conflict (torneo_id, perfil_id) do nothing;
end;
$$;

grant execute on function public.asignar_organizador(text, uuid) to authenticated;

create or replace function public.quitar_organizador(p_torneo_id text, p_perfil_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.rol_actual() is distinct from 'superadmin' then
    raise exception 'Solo el super admin puede quitar organizadores';
  end if;

  delete from public.torneo_miembros where torneo_id = p_torneo_id and perfil_id = p_perfil_id;
end;
$$;

grant execute on function public.quitar_organizador(text, uuid) to authenticated;

-- ============================================================================
-- 10. VISTA: ranking combinado, ahora con torneo_id
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
  ti.puntos_iniciales + coalesce(
    (
      select sum(r.puntos)
      from public.resultados r
      join public.carreras c on c.id = r.carrera_id
      where r.corredor_id = p.id and c.torneo_id = ti.torneo_id
    ), 0
  ) as total_puntos,
  false as es_precarga
from public.torneo_inscripciones ti
join public.perfiles p on p.id = ti.perfil_id
where ti.categoria_id is not null

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

-- ============================================================================
-- 11. RLS: actualizar políticas de carreras, resultados y precarga para
--     que el permiso de escritura sea por torneo, no global.
-- ============================================================================

drop policy if exists "organizador y superadmin gestionan carreras" on public.carreras;
create policy "organizador del torneo gestiona sus carreras" on public.carreras for all
  using (public.es_organizador_de(torneo_id))
  with check (public.es_organizador_de(torneo_id));

drop policy if exists "organizador y superadmin gestionan resultados" on public.resultados;
create policy "organizador del torneo gestiona sus resultados" on public.resultados for all
  using (public.es_organizador_de((select torneo_id from public.carreras where id = resultados.carrera_id)))
  with check (public.es_organizador_de((select torneo_id from public.carreras where id = resultados.carrera_id)));

-- categorías: lectura pública, gestión por organizador de ese torneo
alter table public.categorias enable row level security;
drop policy if exists "categorias visibles para todos" on public.categorias;
create policy "categorias visibles para todos" on public.categorias for select using (true);
drop policy if exists "organizador del torneo gestiona sus categorias" on public.categorias;
create policy "organizador del torneo gestiona sus categorias" on public.categorias for all
  using (public.es_organizador_de(torneo_id))
  with check (public.es_organizador_de(torneo_id));

-- torneo_inscripciones: lectura pública; el propio corredor se auto-inscribe
-- (sin poder tocar sus puntos_iniciales); el organizador del torneo gestiona todo.
alter table public.torneo_inscripciones enable row level security;

drop policy if exists "inscripciones visibles para todos" on public.torneo_inscripciones;
create policy "inscripciones visibles para todos" on public.torneo_inscripciones for select using (true);

drop policy if exists "corredor se autoinscribe" on public.torneo_inscripciones;
create policy "corredor se autoinscribe" on public.torneo_inscripciones for insert
  with check (perfil_id = auth.uid() or public.es_organizador_de(torneo_id));

drop policy if exists "propia inscripcion u organizador actualizan" on public.torneo_inscripciones;
create policy "propia inscripcion u organizador actualizan" on public.torneo_inscripciones for update
  using (perfil_id = auth.uid() or public.es_organizador_de(torneo_id))
  with check (true);

drop policy if exists "organizador borra inscripciones" on public.torneo_inscripciones;
create policy "organizador borra inscripciones" on public.torneo_inscripciones for delete
  using (public.es_organizador_de(torneo_id));

-- corredores_precarga: gestión ahora por organizador de ese torneo
drop policy if exists "precarga visible para todos" on public.corredores_precarga;
create policy "precarga visible para todos" on public.corredores_precarga for select using (true);

-- torneo_miembros: visible para todos (transparencia de quién organiza qué), solo superadmin escribe
alter table public.torneo_miembros enable row level security;
drop policy if exists "miembros visibles para todos" on public.torneo_miembros;
create policy "miembros visibles para todos" on public.torneo_miembros for select using (true);

-- ============================================================================
-- 12. TRIGGER: proteger puntos_iniciales de torneo_inscripciones — solo el
--     organizador de ESE torneo (o superadmin) lo puede tocar, nunca el
--     propio corredor.
-- ============================================================================

create or replace function public.proteger_inscripcion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anterior int := 0;
begin
  if auth.uid() is null then
    return new;
  end if;

  if TG_OP = 'UPDATE' then
    v_anterior := old.puntos_iniciales;
  end if;

  if new.puntos_iniciales is distinct from v_anterior
     and not public.es_organizador_de(new.torneo_id) then
    new.puntos_iniciales := v_anterior;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_proteger_inscripcion on public.torneo_inscripciones;
create trigger trg_proteger_inscripcion
  before insert or update on public.torneo_inscripciones
  for each row execute function public.proteger_inscripcion();

-- ============================================================================
-- 13. ACTUALIZAR vincular_precarga para que chequee el organizador del
--     torneo correspondiente, no un rol global.
-- ============================================================================

create or replace function public.vincular_precarga(precarga_id text, perfil_id_destino uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_torneo_id text;
  v_categoria_id uuid;
  v_pts int;
begin
  select torneo_id, categoria_id, puntos_iniciales
  into v_torneo_id, v_categoria_id, v_pts
  from public.corredores_precarga
  where id = precarga_id and perfil_id is null;

  if v_torneo_id is null then
    raise exception 'Corredor precargado no encontrado o ya vinculado';
  end if;

  if not public.es_organizador_de(v_torneo_id) then
    raise exception 'No tenés permiso para vincular corredores precargados de este torneo';
  end if;

  insert into public.torneo_inscripciones (torneo_id, perfil_id, categoria_id, puntos_iniciales)
  values (v_torneo_id, perfil_id_destino, v_categoria_id, v_pts)
  on conflict (torneo_id, perfil_id)
  do update set puntos_iniciales = excluded.puntos_iniciales, categoria_id = excluded.categoria_id;

  update public.corredores_precarga set perfil_id = perfil_id_destino where id = precarga_id;
end;
$$;

grant execute on function public.vincular_precarga(text, uuid) to authenticated;

-- ============================================================================
-- 14. Simplificar el trigger de perfiles: ya no protege categoria_id ni
--     puntos_iniciales (se fueron de esta tabla) — solo protege "rol".
-- ============================================================================

create or replace function public.proteger_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.rol is distinct from old.rol and public.rol_actual() is distinct from 'superadmin' then
    new.rol := old.rol;
  end if;

  return new;
end;
$$;

-- ============================================================================
-- 15. "organizador" deja de ser un rol global de perfiles — ahora se
--     representa con una fila en torneo_miembros. Sacamos ese valor del
--     check de perfiles.rol para no dejar dos caminos distintos abiertos.
-- ============================================================================

update public.perfiles set rol = 'corredor' where rol = 'organizador';

alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol in ('corredor', 'superadmin'));

create or replace function public.asignar_rol(perfil_id_destino uuid, nuevo_rol text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.rol_actual() is distinct from 'superadmin' then
    raise exception 'Solo el super admin puede asignar roles';
  end if;

  if nuevo_rol not in ('corredor', 'superadmin') then
    raise exception 'Rol inválido';
  end if;

  update public.perfiles set rol = nuevo_rol where id = perfil_id_destino;
end;
$$;
