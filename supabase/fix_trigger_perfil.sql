-- ============================================================================
-- Arregla el trigger que protege la tabla perfiles: antes bloqueaba
-- también los cambios hechos a mano desde el SQL Editor (como ascender a
-- alguien a super admin). Corré esto una sola vez.
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

-- Ahora sí, te promovemos a super admin (reemplazá el email si te registraste con otro):
update public.perfiles
set rol = 'superadmin'
where id = (select id from auth.users where email = 'ing.pazgeronimo@gmail.com');

-- Verificación: esta vez debería devolver rol = 'superadmin'
select id, nombre, rol from public.perfiles
where id = (select id from auth.users where email = 'ing.pazgeronimo@gmail.com');
