-- ============================================================================
-- Migración 005 — Logo de la plataforma configurable por el super admin
-- Corré esto una sola vez en el SQL Editor de Supabase.
--
-- Qué hace: agrega una tabla de configuración global (una sola fila) con
-- la URL del logo de la app, y un bucket de Storage público para subir la
-- imagen. Solo el super admin puede escribir en cualquiera de los dos —
-- todos pueden leerlos (hace falta para que el logo se vea sin sesión).
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE CONFIGURACIÓN (una sola fila, id fijo = 1)
-- ============================================================================

create table if not exists public.plataforma_config (
  id int primary key default 1,
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint plataforma_config_singleton check (id = 1)
);

insert into public.plataforma_config (id, logo_url)
values (1, null)
on conflict (id) do nothing;

alter table public.plataforma_config enable row level security;

drop policy if exists "config de plataforma visible para todos" on public.plataforma_config;
create policy "config de plataforma visible para todos" on public.plataforma_config for select using (true);

drop policy if exists "solo superadmin edita la config de plataforma" on public.plataforma_config;
create policy "solo superadmin edita la config de plataforma" on public.plataforma_config for update
  using (public.rol_actual() = 'superadmin')
  with check (public.rol_actual() = 'superadmin');

grant select on public.plataforma_config to anon, authenticated;
grant update on public.plataforma_config to authenticated;

-- ============================================================================
-- 2. BUCKET DE STORAGE PARA EL LOGO
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('marca-plataforma', 'marca-plataforma', true)
on conflict (id) do nothing;

drop policy if exists "logo de plataforma visible para todos" on storage.objects;
create policy "logo de plataforma visible para todos" on storage.objects for select
  using (bucket_id = 'marca-plataforma');

drop policy if exists "solo superadmin sube el logo de plataforma" on storage.objects;
create policy "solo superadmin sube el logo de plataforma" on storage.objects for insert
  with check (bucket_id = 'marca-plataforma' and public.rol_actual() = 'superadmin');

drop policy if exists "solo superadmin actualiza el logo de plataforma" on storage.objects;
create policy "solo superadmin actualiza el logo de plataforma" on storage.objects for update
  using (bucket_id = 'marca-plataforma' and public.rol_actual() = 'superadmin');

drop policy if exists "solo superadmin borra el logo de plataforma" on storage.objects;
create policy "solo superadmin borra el logo de plataforma" on storage.objects for delete
  using (bucket_id = 'marca-plataforma' and public.rol_actual() = 'superadmin');
