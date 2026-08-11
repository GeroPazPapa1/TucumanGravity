-- Solo lectura, no cambia nada. Correlo y pasame los resultados de cada bloque.

-- 1. Deberían aparecer los 8 torneos
select id, nombre, tipo from public.torneos order by nombre;

-- 2. Las 4 categorías de Tucumán Gravity, ahora con torneo_id y id tipo uuid
select id, torneo_id, slug, nombre, orden from public.categorias order by orden;

-- 3. Las 4 carreras, ahora con torneo_id
select id, torneo_id, numero, nombre, estado from public.carreras order by numero;

-- 4. Los 20 corredores precargados, ahora con torneo_id
select count(*) as total_precarga, torneo_id from public.corredores_precarga group by torneo_id;

-- 5. Tu perfil: debería tener dni y fecha_nacimiento (probablemente null todavía),
--    y YA NO debería tener categoria_id, numero ni puntos_iniciales como columnas
select id, nombre, rol, dni, fecha_nacimiento from public.perfiles;

-- 6. El ranking general de Tucumán Gravity debería verse igual que antes
select nombre, categoria_id, total_puntos, es_precarga
from public.ranking_general
where torneo_id = 'tucuman-gravity'
order by total_puntos desc
limit 5;
