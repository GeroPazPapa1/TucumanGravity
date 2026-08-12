-- ============================================================================
-- DEMO — Copa Argentina: simulación completa del motor de puntos
-- Corré esto DESPUÉS de migration_002 y migration_003 (ya corridas).
--
-- Qué hace: crea 6 corredores REALES de prueba (con su cuenta, no
-- "precarga"), los inscribe en Copa Argentina (y a dos de ellos también
-- en el Regional Córdoba), les carga resultados en 4-5 fechas armadas a
-- propósito para que se vea, con números concretos, cada regla del
-- reglamento funcionando:
--   - descarte de la peor fecha
--   - presentismo escalonado
--   - filtro de federado (solo suman puntos oficiales los federados)
--   - bono de fecha regional (posición en su regional se traduce a puntos)
--
-- Es 100% data de prueba, aislada por emails @demo.copa-argentina.test y
-- por IDs que empiezan con 10000000-... — al final del archivo hay un
-- bloque de limpieza comentado para borrar todo después de la presentación.
--
-- Si el paso 1 tira un error tipo "function extensions.crypt does not
-- exist", es que en tu proyecto pgcrypto no está en el schema
-- "extensions" — reemplazá extensions.crypt(...) y extensions.gen_salt(...)
-- por crypt(...) y gen_salt(...) a secas (sin el prefijo) y corré de nuevo.
-- ============================================================================

-- ============================================================================
-- 0. LIMPIAR LOS CORREDORES FICTICIOS QUE YA HABÍA (seed_corredores_prueba.sql)
--    Son "precarga" (sin registrar), no tienen cuenta ni están vinculados a
--    nadie — se pueden borrar sin afectar nada más. Esto es lo que hoy se ve
--    en /t/copa-argentina/ranking con el cartelito "sin registrar".
-- ============================================================================

delete from public.corredores_precarga where torneo_id = 'copa-argentina';

-- ============================================================================
-- 1. LAS 6 CUENTAS DE PRUEBA
--    (esto dispara el trigger on_auth_user_created, que ya les crea la
--    fila en public.perfiles automáticamente con nombre y rol='corredor')
-- ============================================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated',
   'manuel.ibarra@demo.copa-argentina.test', extensions.crypt('Demo123456!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Manuel Ibarra"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated',
   'rocio.ferreyra@demo.copa-argentina.test', extensions.crypt('Demo123456!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Rocío Ferreyra"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated',
   'bruno.castex@demo.copa-argentina.test', extensions.crypt('Demo123456!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Bruno Castex"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated',
   'elian.sosa@demo.copa-argentina.test', extensions.crypt('Demo123456!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Elián Sosa"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated',
   'camila.roldan@demo.copa-argentina.test', extensions.crypt('Demo123456!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Camila Roldán"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated',
   'tomas.aguirre@demo.copa-argentina.test', extensions.crypt('Demo123456!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Tomás Aguirre"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- ============================================================================
-- 2. COMPLETAR SUS PERFILES (dni, fecha de nacimiento, bici, equipo,
--    y el dato clave: quién está federado y quién no)
-- ============================================================================

update public.perfiles set
  dni = case id
    when '10000000-0000-0000-0000-000000000001' then '90000001'
    when '10000000-0000-0000-0000-000000000002' then '90000002'
    when '10000000-0000-0000-0000-000000000003' then '90000003'
    when '10000000-0000-0000-0000-000000000004' then '90000004'
    when '10000000-0000-0000-0000-000000000005' then '90000005'
    when '10000000-0000-0000-0000-000000000006' then '90000006'
  end,
  fecha_nacimiento = '1998-01-01'::date,
  federado = case id
    when '10000000-0000-0000-0000-000000000003' then false  -- Bruno: NO federado, a propósito
    else true
  end,
  bici = case id
    when '10000000-0000-0000-0000-000000000001' then 'Commencal Supreme DH'
    when '10000000-0000-0000-0000-000000000002' then 'YT TUES'
    when '10000000-0000-0000-0000-000000000003' then 'Specialized Demo'
    when '10000000-0000-0000-0000-000000000004' then 'Trek Session'
    when '10000000-0000-0000-0000-000000000005' then 'Santa Cruz V10'
    when '10000000-0000-0000-0000-000000000006' then 'Canyon Sender'
  end,
  equipo = case id
    when '10000000-0000-0000-0000-000000000001' then 'Pachamama Racing'
    when '10000000-0000-0000-0000-000000000002' then 'Andes Gravity Team'
    when '10000000-0000-0000-0000-000000000003' then 'Norte DH Crew'
    when '10000000-0000-0000-0000-000000000004' then 'Sierra Racing'
    when '10000000-0000-0000-0000-000000000005' then 'Córdoba Bike Club'
    when '10000000-0000-0000-0000-000000000006' then 'Córdoba Bike Club'
  end
where id in (
  '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006'
);

-- ============================================================================
-- 3. LAS FECHAS (Copa Argentina: 4 disputadas + 1 próxima; Córdoba: 1 fecha
--    para poder calcular la posición regional de Camila)
-- ============================================================================

insert into public.carreras (id, torneo_id, numero, nombre, lugar, lat, lng, estado) values
  ('ca-demo-f1', 'copa-argentina', 1, 'Fecha 1 — San Rafael', 'San Rafael, Mendoza', -34.6177, -68.3301, 'disputada'),
  ('ca-demo-f2', 'copa-argentina', 2, 'Fecha 2 — La Cumbrecita', 'La Cumbrecita, Córdoba', -31.9046, -64.8258, 'disputada'),
  ('ca-demo-f3', 'copa-argentina', 3, 'Fecha 3 — Tafí del Valle', 'Tafí del Valle, Tucumán', -26.8500, -65.6833, 'disputada'),
  ('ca-demo-f4', 'copa-argentina', 4, 'Fecha 4 — Bariloche', 'San Carlos de Bariloche, Río Negro', -41.1335, -71.3103, 'disputada'),
  ('ca-demo-f5', 'copa-argentina', 5, 'Fecha 5 — Potrerillos (final)', 'Potrerillos, Mendoza', -32.9667, -69.1667, 'proxima'),
  ('cba-demo-f1', 'cordoba', 1, 'Fecha Regional — Villa General Belgrano', 'Villa General Belgrano, Córdoba', -31.9803, -64.5514, 'disputada')
on conflict (id) do nothing;

-- ============================================================================
-- 4. INSCRIPCIONES (categoría Elite en ambos torneos)
-- ============================================================================

insert into public.torneo_inscripciones (torneo_id, perfil_id, categoria_id, puntos_iniciales)
select 'copa-argentina', v.perfil_id::uuid, cat.id, 0
from (select id from public.categorias where torneo_id = 'copa-argentina' and slug = 'elite') cat,
     (values
        ('10000000-0000-0000-0000-000000000001'),
        ('10000000-0000-0000-0000-000000000002'),
        ('10000000-0000-0000-0000-000000000003'),
        ('10000000-0000-0000-0000-000000000004'),
        ('10000000-0000-0000-0000-000000000005')
     ) as v(perfil_id)
on conflict (torneo_id, perfil_id) do nothing;

insert into public.torneo_inscripciones (torneo_id, perfil_id, categoria_id, puntos_iniciales)
select 'cordoba', v.perfil_id::uuid, cat.id, 0
from (select id from public.categorias where torneo_id = 'cordoba' and slug = 'elite') cat,
     (values
        ('10000000-0000-0000-0000-000000000005'),
        ('10000000-0000-0000-0000-000000000006')
     ) as v(perfil_id)
on conflict (torneo_id, perfil_id) do nothing;

-- ============================================================================
-- 5. RESULTADOS — Copa Argentina
--    (los números están elegidos a propósito, ver la hoja de presentación
--    supabase/demo_copa_argentina_presentacion.txt para el detalle de cada uno)
-- ============================================================================

with cat as (
  select id from public.categorias where torneo_id = 'copa-argentina' and slug = 'elite'
)
insert into public.resultados (carrera_id, corredor_id, categoria_id, posicion, puntos)
select v.carrera_id, v.corredor_id::uuid, cat.id, v.posicion, v.puntos
from cat, (values
  -- Manuel Ibarra: parejo en las 4 fechas, sin días malos
  ('ca-demo-f1', '10000000-0000-0000-0000-000000000001', 2, 250),
  ('ca-demo-f2', '10000000-0000-0000-0000-000000000001', 3, 220),
  ('ca-demo-f3', '10000000-0000-0000-0000-000000000001', 2, 240),
  ('ca-demo-f4', '10000000-0000-0000-0000-000000000001', 3, 230),
  -- Rocío Ferreyra: muy fuerte, pero se cae en la Fecha 3
  ('ca-demo-f1', '10000000-0000-0000-0000-000000000002', 1, 280),
  ('ca-demo-f2', '10000000-0000-0000-0000-000000000002', 1, 260),
  ('ca-demo-f3', '10000000-0000-0000-0000-000000000002', 22, 30),
  ('ca-demo-f4', '10000000-0000-0000-0000-000000000002', 1, 270),
  -- Bruno Castex: el más rápido de la temporada, pero NO federado
  ('ca-demo-f1', '10000000-0000-0000-0000-000000000003', 1, 300),
  ('ca-demo-f2', '10000000-0000-0000-0000-000000000003', 1, 300),
  ('ca-demo-f3', '10000000-0000-0000-0000-000000000003', 1, 300),
  ('ca-demo-f4', '10000000-0000-0000-0000-000000000003', 2, 280),
  -- Elián Sosa: se pierde la Fecha 2
  ('ca-demo-f1', '10000000-0000-0000-0000-000000000004', 2, 260),
  ('ca-demo-f3', '10000000-0000-0000-0000-000000000004', 3, 240),
  ('ca-demo-f4', '10000000-0000-0000-0000-000000000004', 2, 250),
  -- Camila Roldán: corre poco la Copa (2 fechas), pero suma bono regional
  ('ca-demo-f1', '10000000-0000-0000-0000-000000000005', 4, 260),
  ('ca-demo-f3', '10000000-0000-0000-0000-000000000005', 5, 240)
) as v(carrera_id, corredor_id, posicion, puntos)
on conflict (carrera_id, corredor_id) do nothing;

-- ============================================================================
-- 6. RESULTADOS — Regional Córdoba (para calcular la posición de Camila)
-- ============================================================================

with cat as (
  select id from public.categorias where torneo_id = 'cordoba' and slug = 'elite'
)
insert into public.resultados (carrera_id, corredor_id, categoria_id, posicion, puntos)
select v.carrera_id, v.corredor_id::uuid, cat.id, v.posicion, v.puntos
from cat, (values
  ('cba-demo-f1', '10000000-0000-0000-0000-000000000006', 1, 300),  -- Tomás gana el regional
  ('cba-demo-f1', '10000000-0000-0000-0000-000000000005', 2, 250)   -- Camila sale 2da
) as v(carrera_id, corredor_id, posicion, puntos)
on conflict (carrera_id, corredor_id) do nothing;

-- ============================================================================
-- 7. VERIFICACIÓN — esto es lo que va a mostrar la página pública de
--    ranking de Copa Argentina, categoría Elite, ya con las reglas aplicadas
-- ============================================================================

select nombre, total_puntos
from public.ranking_general
where torneo_id = 'copa-argentina'
  and categoria_id = (select id from public.categorias where torneo_id = 'copa-argentina' and slug = 'elite')
  and not es_precarga
order by total_puntos desc;

-- Resultado esperado:
--   Rocío Ferreyra   890
--   Manuel Ibarra     800
--   Elián Sosa        570
--   Camila Roldán     550
--   (Bruno Castex no aparece: no está federado)

-- ============================================================================
-- 8. LIMPIEZA (para después de la presentación — descomentar y correr)
-- ============================================================================

-- delete from public.resultados where carrera_id in ('ca-demo-f1','ca-demo-f2','ca-demo-f3','ca-demo-f4','cba-demo-f1');
-- delete from public.torneo_inscripciones where perfil_id in (
--   '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',
--   '10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004',
--   '10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000006'
-- );
-- delete from public.carreras where id in ('ca-demo-f1','ca-demo-f2','ca-demo-f3','ca-demo-f4','ca-demo-f5','cba-demo-f1');
-- delete from auth.users where id in (
--   '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',
--   '10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004',
--   '10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000006'
-- ); -- esto borra en cascada el perfil de cada uno
