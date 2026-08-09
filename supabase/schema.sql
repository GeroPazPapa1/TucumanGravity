-- ============================================================================
-- Tucumán Gravity — esquema de base de datos
-- Corré este archivo entero en Supabase → SQL Editor → New query → Run.
-- Es seguro volver a correrlo (usa "if not exists" / "or replace" en todo
-- lo que se puede).
-- ============================================================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABLAS
-- ============================================================================

create table if not exists public.categorias (
  id text primary key,
  nombre text not null,
  orden int not null
);

create table if not exists public.carreras (
  id text primary key,
  numero int not null,
  nombre text not null,
  lugar text not null,
  lat double precision not null,
  lng double precision not null,
  estado text not null check (estado in ('disputada', 'proxima'))
);

-- Un perfil por cada usuario real registrado (auth.users). Se crea solo,
-- automáticamente, cuando alguien se registra (ver trigger más abajo).
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  numero int,
  categoria_id text references public.categorias (id),
  bici text,
  equipo text,
  foto_url text,
  puntos_iniciales int not null default 0,
  rol text not null default 'corredor' check (rol in ('corredor', 'organizador', 'superadmin')),
  created_at timestamptz not null default now()
);

-- Corredores reales del ranking que TODAVÍA no se registraron en la app.
-- Cuando se registren, el organizador/superadmin los "vincula" desde el
-- panel de admin (función vincular_precarga más abajo) y esta fila deja de
-- contar aparte porque sus puntos ya pasaron a formar parte de su perfil.
create table if not exists public.corredores_precarga (
  id text primary key,
  nombre text not null,
  categoria_id text not null references public.categorias (id),
  puntos_iniciales int not null default 0,
  perfil_id uuid unique references public.perfiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.resultados (
  id uuid primary key default gen_random_uuid(),
  carrera_id text not null references public.carreras (id) on delete cascade,
  corredor_id uuid not null references public.perfiles (id) on delete cascade,
  categoria_id text not null references public.categorias (id),
  posicion int not null,
  puntos int not null default 0,
  created_at timestamptz not null default now(),
  unique (carrera_id, corredor_id)
);

-- ============================================================================
-- FUNCIÓN HELPER: rol de quien está haciendo la consulta ahora mismo.
-- security definer para no disparar RLS recursivo al leer perfiles.
-- ============================================================================

create or replace function public.rol_actual()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

-- ============================================================================
-- TRIGGER: crear perfil automáticamente al registrarse (rol 'corredor' por
-- defecto — nadie se autoasigna organizador ni superadmin).
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    'corredor'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- TRIGGER: proteger columnas sensibles de perfiles.
--   - "rol": solo lo puede cambiar un superadmin.
--   - "puntos_iniciales": lo puede cambiar un organizador o un superadmin,
--     pero nunca el propio corredor sobre sí mismo.
-- Cualquier otro campo (nombre, bici, equipo, foto, etc.) en un perfil ajeno
-- solo lo puede tocar un superadmin.
-- ============================================================================

create or replace function public.proteger_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.rol_actual();
  es_dueno boolean := auth.uid() = old.id;
begin
  if auth.uid() is null then
    -- sin sesión de usuario (SQL Editor, scripts de mantenimiento): confiar
    return new;
  end if;

  if actor = 'superadmin' then
    return new;
  end if;

  if es_dueno then
    new.rol := old.rol;
    new.puntos_iniciales := old.puntos_iniciales;
    return new;
  end if;

  if actor = 'organizador' then
    -- el organizador, sobre perfiles ajenos, solo puede tocar puntos_iniciales
    new.nombre := old.nombre;
    new.numero := old.numero;
    new.categoria_id := old.categoria_id;
    new.bici := old.bici;
    new.equipo := old.equipo;
    new.foto_url := old.foto_url;
    new.rol := old.rol;
    return new;
  end if;

  return old;
end;
$$;

drop trigger if exists trg_proteger_perfil on public.perfiles;
create trigger trg_proteger_perfil
  before update on public.perfiles
  for each row execute function public.proteger_perfil();

-- ============================================================================
-- FUNCIÓN: vincular un corredor precargado (histórico) a una cuenta real ya
-- registrada. Solo organizador o superadmin pueden ejecutarla.
-- ============================================================================

create or replace function public.vincular_precarga(precarga_id text, perfil_id_destino uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.rol_actual();
  pts int;
begin
  if actor not in ('organizador', 'superadmin') then
    raise exception 'No tenés permiso para vincular corredores precargados';
  end if;

  select puntos_iniciales into pts
  from public.corredores_precarga
  where id = precarga_id and perfil_id is null;

  if pts is null then
    raise exception 'Corredor precargado no encontrado o ya vinculado';
  end if;

  update public.perfiles set puntos_iniciales = pts where id = perfil_id_destino;
  update public.corredores_precarga set perfil_id = perfil_id_destino where id = precarga_id;
end;
$$;

grant execute on function public.vincular_precarga(text, uuid) to authenticated;

-- ============================================================================
-- FUNCIÓN: asignar rol a un usuario. Solo superadmin puede ejecutarla
-- (queda explícito acá, además de protegido por el trigger de arriba).
-- ============================================================================

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

  if nuevo_rol not in ('corredor', 'organizador', 'superadmin') then
    raise exception 'Rol inválido';
  end if;

  update public.perfiles set rol = nuevo_rol where id = perfil_id_destino;
end;
$$;

grant execute on function public.asignar_rol(uuid, text) to authenticated;

-- ============================================================================
-- VISTA: ranking combinado (perfiles reales + precarga sin vincular)
-- ============================================================================

create or replace view public.ranking_general
with (security_invoker = true) as
select
  categoria_id,
  id::text as corredor_id,
  nombre,
  numero,
  bici,
  equipo,
  foto_url,
  puntos_iniciales as puntos_base,
  puntos_iniciales + coalesce(
    (select sum(r.puntos) from public.resultados r where r.corredor_id = perfiles.id), 0
  ) as total_puntos,
  false as es_precarga
from public.perfiles
where categoria_id is not null

union all

select
  categoria_id,
  id as corredor_id,
  nombre,
  null as numero,
  null as bici,
  null as equipo,
  null as foto_url,
  puntos_iniciales as puntos_base,
  puntos_iniciales as total_puntos,
  true as es_precarga
from public.corredores_precarga
where perfil_id is null;

grant select on public.ranking_general to anon, authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.categorias enable row level security;
alter table public.carreras enable row level security;
alter table public.perfiles enable row level security;
alter table public.corredores_precarga enable row level security;
alter table public.resultados enable row level security;

-- categorias: lectura pública, sin edición vía API (se maneja por SQL)
drop policy if exists "categorias visibles para todos" on public.categorias;
create policy "categorias visibles para todos" on public.categorias for select using (true);

-- carreras: lectura pública, edición organizador/superadmin
drop policy if exists "carreras visibles para todos" on public.carreras;
create policy "carreras visibles para todos" on public.carreras for select using (true);

drop policy if exists "organizador y superadmin gestionan carreras" on public.carreras;
create policy "organizador y superadmin gestionan carreras" on public.carreras for all
  using (public.rol_actual() in ('organizador', 'superadmin'))
  with check (public.rol_actual() in ('organizador', 'superadmin'));

-- resultados: lectura pública, edición organizador/superadmin
drop policy if exists "resultados visibles para todos" on public.resultados;
create policy "resultados visibles para todos" on public.resultados for select using (true);

drop policy if exists "organizador y superadmin gestionan resultados" on public.resultados;
create policy "organizador y superadmin gestionan resultados" on public.resultados for all
  using (public.rol_actual() in ('organizador', 'superadmin'))
  with check (public.rol_actual() in ('organizador', 'superadmin'));

-- corredores_precarga: lectura pública, sin edición directa vía API (solo por la función vincular_precarga)
drop policy if exists "precarga visible para todos" on public.corredores_precarga;
create policy "precarga visible para todos" on public.corredores_precarga for select using (true);

-- perfiles: lectura pública; edición propia, de organizador (limitada por trigger) o de superadmin
drop policy if exists "perfiles visibles para todos" on public.perfiles;
create policy "perfiles visibles para todos" on public.perfiles for select using (true);

drop policy if exists "propio perfil, organizador o superadmin pueden actualizar" on public.perfiles;
create policy "propio perfil, organizador o superadmin pueden actualizar" on public.perfiles for update
  using (auth.uid() = id or public.rol_actual() in ('organizador', 'superadmin'))
  with check (true);

-- ============================================================================
-- STORAGE: fotos de perfil (cada corredor sube/edita solo la suya)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('fotos-perfil', 'fotos-perfil', true)
on conflict (id) do nothing;

drop policy if exists "fotos de perfil visibles para todos" on storage.objects;
create policy "fotos de perfil visibles para todos" on storage.objects for select
  using (bucket_id = 'fotos-perfil');

drop policy if exists "cada uno sube su propia foto" on storage.objects;
create policy "cada uno sube su propia foto" on storage.objects for insert
  with check (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cada uno actualiza su propia foto" on storage.objects;
create policy "cada uno actualiza su propia foto" on storage.objects for update
  using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cada uno borra su propia foto" on storage.objects;
create policy "cada uno borra su propia foto" on storage.objects for delete
  using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);
