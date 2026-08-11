-- Solo lectura, no cambia nada. Correlo y pasame captura de los 4 bloques.

-- 1. Copa Argentina debería tener sus reglas activadas; el resto en 0/false
select id, descartes_permitidos, presentismo_puntos_por_fecha, requiere_federado, suma_fecha_regional
from public.torneos
order by (id = 'copa-argentina') desc, id;

-- 2. Debería haber 30 filas para copa-argentina
select count(*) as filas_tabla_puntos from public.puntos_por_posicion where torneo_id = 'copa-argentina';

-- 3. El ranking de Tucumán Gravity debería verse IGUAL que siempre
-- (mismos puntos que ya conocemos: 690, 685, 680, 675, 635...)
select nombre, total_puntos, es_precarga
from public.ranking_general
where torneo_id = 'tucuman-gravity'
order by total_puntos desc
limit 5;

-- 4. El ranking de Copa Argentina (con las reglas nuevas aplicadas)
select nombre, total_puntos, es_precarga
from public.ranking_general
where torneo_id = 'copa-argentina'
order by total_puntos desc
limit 5;
