-- ============================================================================
-- Correr UNA sola vez, DESPUÉS de que vos (el super admin) te hayas
-- registrado normalmente en la app con tu email real.
-- Reemplazá el email de abajo por el que usaste para registrarte.
-- ============================================================================

update public.perfiles
set rol = 'superadmin'
where id = (select id from auth.users where email = 'ing.pazgeronimo@gmail.com');

-- Verificación: debería devolver una fila con rol = 'superadmin'
select id, nombre, rol from public.perfiles
where id = (select id from auth.users where email = 'ing.pazgeronimo@gmail.com');
