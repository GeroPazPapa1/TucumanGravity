-- ============================================================================
-- Datos de prueba: categorías básicas + 10 corredores por torneo (ficticios,
-- para probar la app) en los 7 torneos que hoy están vacíos.
-- Tucumán Gravity NO se toca (ya tiene datos reales).
-- Seguro de correr más de una vez (usa ON CONFLICT DO NOTHING).
-- ============================================================================

-- ============================================================================
-- CATEGORÍAS
-- ============================================================================

-- Regionales nuevos + Campeonato Argentino: mismo esquema simple de Tucumán Gravity
insert into public.categorias (torneo_id, slug, nombre, orden)
select t.id, c.slug, c.nombre, c.orden
from public.torneos t
cross join (values
  ('master-pro', 'Master Pro', 1),
  ('pro', 'Pro', 2),
  ('elite', 'Elite', 3),
  ('ebike-elite', 'E-Bike Elite', 4)
) as c(slug, nombre, orden)
where t.id in ('cordoba', 'mendoza', 'patagonia', 'campeonato-argentino')
on conflict (torneo_id, slug) do nothing;

-- Copa Argentina: subset real de sus categorías UCI
insert into public.categorias (torneo_id, slug, nombre, orden) values
  ('copa-argentina', 'elite', 'Elite', 1),
  ('copa-argentina', 'master-a', 'Master A', 2),
  ('copa-argentina', 'damas-elite', 'Damas Elite', 3),
  ('copa-argentina', 'elite-pro', 'Elite PRO', 4)
on conflict (torneo_id, slug) do nothing;

-- Open Shimano y Latam: subset real de sus categorías
insert into public.categorias (torneo_id, slug, nombre, orden)
select t.id, c.slug, c.nombre, c.orden
from public.torneos t
cross join (values
  ('elite-pro', 'Elite Pro', 1),
  ('master-pro', 'Master Pro', 2),
  ('damas-pro', 'Damas Pro', 3),
  ('amateur-men', 'Amateur Men', 4)
) as c(slug, nombre, orden)
where t.id in ('open-shimano', 'latam')
on conflict (torneo_id, slug) do nothing;

-- ============================================================================
-- CORREDORES DE PRUEBA (corredores_precarga, "sin registrar")
-- ============================================================================

-- CÓRDOBA
insert into public.corredores_precarga (id, torneo_id, nombre, categoria_id, puntos_iniciales)
select 'cordoba-' || x.slug, 'cordoba', x.nombre, c.id, x.puntos
from (values
  ('franco-medina', 'Franco Medina', 'master-pro', 640),
  ('ivo-salcedo', 'Ivo Salcedo', 'master-pro', 580),
  ('bruno-ferreyra', 'Bruno Ferreyra', 'master-pro', 510),
  ('nazareno-quiroga', 'Nazareno Quiroga', 'pro', 655),
  ('tomas-bulacio', 'Tomás Bulacio', 'pro', 600),
  ('lucas-peralta', 'Lucas Peralta', 'pro', 545),
  ('ezequiel-toledo', 'Ezequiel Toledo', 'elite', 670),
  ('milo-cabral', 'Milo Cabral', 'elite', 590),
  ('agustin-robledo', 'Agustín Robledo', 'ebike-elite', 620),
  ('federico-nazar', 'Federico Nazar', 'ebike-elite', 560)
) as x(slug, nombre, categoria_slug, puntos)
join public.categorias c on c.torneo_id = 'cordoba' and c.slug = x.categoria_slug
on conflict (id) do nothing;

-- MENDOZA
insert into public.corredores_precarga (id, torneo_id, nombre, categoria_id, puntos_iniciales)
select 'mendoza-' || x.slug, 'mendoza', x.nombre, c.id, x.puntos
from (values
  ('rodrigo-aguirre', 'Rodrigo Aguirre', 'master-pro', 630),
  ('santino-correa', 'Santino Correa', 'master-pro', 575),
  ('bautista-molina', 'Bautista Molina', 'master-pro', 500),
  ('ian-escobar', 'Ian Escobar', 'pro', 660),
  ('thiago-funes', 'Thiago Funes', 'pro', 595),
  ('gonzalo-rios', 'Gonzalo Ríos', 'pro', 540),
  ('valentin-ojeda', 'Valentín Ojeda', 'elite', 665),
  ('mateo-ledesma', 'Mateo Ledesma', 'elite', 585),
  ('joaquin-barrios', 'Joaquín Barrios', 'ebike-elite', 615),
  ('nicolas-villalba', 'Nicolás Villalba', 'ebike-elite', 555)
) as x(slug, nombre, categoria_slug, puntos)
join public.categorias c on c.torneo_id = 'mendoza' and c.slug = x.categoria_slug
on conflict (id) do nothing;

-- PATAGONIA
insert into public.corredores_precarga (id, torneo_id, nombre, categoria_id, puntos_iniciales)
select 'patagonia-' || x.slug, 'patagonia', x.nombre, c.id, x.puntos
from (values
  ('kevin-huenul', 'Kevin Huenul', 'master-pro', 625),
  ('braian-currumil', 'Braian Currumil', 'master-pro', 570),
  ('ulises-paillao', 'Ulises Paillao', 'master-pro', 505),
  ('dylan-antileo', 'Dylan Antileo', 'pro', 650),
  ('ramiro-nahuel', 'Ramiro Nahuel', 'pro', 590),
  ('facundo-calfu', 'Facundo Calfú', 'pro', 535),
  ('maximiliano-curin', 'Maximiliano Curín', 'elite', 660),
  ('elian-trekan', 'Elián Trekan', 'elite', 580),
  ('cristian-millapan', 'Cristian Millapán', 'ebike-elite', 610),
  ('ariel-quintupuray', 'Ariel Quintupuray', 'ebike-elite', 550)
) as x(slug, nombre, categoria_slug, puntos)
join public.categorias c on c.torneo_id = 'patagonia' and c.slug = x.categoria_slug
on conflict (id) do nothing;

-- CAMPEONATO ARGENTINO
insert into public.corredores_precarga (id, torneo_id, nombre, categoria_id, puntos_iniciales)
select 'campeonato-argentino-' || x.slug, 'campeonato-argentino', x.nombre, c.id, x.puntos
from (values
  ('emanuel-rios', 'Emanuel Ríos', 'master-pro', 645),
  ('pablo-sosa', 'Pablo Sosa', 'master-pro', 585),
  ('damian-acosta', 'Damián Acosta', 'master-pro', 520),
  ('leandro-vega', 'Leandro Vega', 'pro', 665),
  ('matias-ibanez', 'Matías Ibáñez', 'pro', 600),
  ('nahuel-cardozo', 'Nahuel Cardozo', 'pro', 545),
  ('ignacio-farias', 'Ignacio Farías', 'elite', 680),
  ('franco-benitez', 'Franco Benítez', 'elite', 595),
  ('rodrigo-paz', 'Rodrigo Paz', 'ebike-elite', 625),
  ('andres-silva', 'Andrés Silva', 'ebike-elite', 565)
) as x(slug, nombre, categoria_slug, puntos)
join public.categorias c on c.torneo_id = 'campeonato-argentino' and c.slug = x.categoria_slug
on conflict (id) do nothing;

-- COPA ARGENTINA
insert into public.corredores_precarga (id, torneo_id, nombre, categoria_id, puntos_iniciales)
select 'copa-argentina-' || x.slug, 'copa-argentina', x.nombre, c.id, x.puntos
from (values
  ('juan-cruz-dominguez', 'Juan Cruz Domínguez', 'elite', 670),
  ('bruno-alvarado', 'Bruno Alvarado', 'elite', 610),
  ('tomas-segovia', 'Tomás Segovia', 'elite', 550),
  ('diego-herrera', 'Diego Herrera', 'master-a', 640),
  ('marcelo-juarez', 'Marcelo Juárez', 'master-a', 580),
  ('camila-suarez', 'Camila Suárez', 'damas-elite', 630),
  ('lucia-fernandez', 'Lucía Fernández', 'damas-elite', 570),
  ('santiago-molina', 'Santiago Molina', 'elite-pro', 690),
  ('federico-ortiz', 'Federico Ortiz', 'elite-pro', 620),
  ('julian-castro', 'Julián Castro', 'elite-pro', 560)
) as x(slug, nombre, categoria_slug, puntos)
join public.categorias c on c.torneo_id = 'copa-argentina' and c.slug = x.categoria_slug
on conflict (id) do nothing;

-- OPEN SHIMANO
insert into public.corredores_precarga (id, torneo_id, nombre, categoria_id, puntos_iniciales)
select 'open-shimano-' || x.slug, 'open-shimano', x.nombre, c.id, x.puntos
from (values
  ('mariano-luque', 'Mariano Luque', 'elite-pro', 685),
  ('emiliano-ponce', 'Emiliano Ponce', 'elite-pro', 615),
  ('gaston-villagra', 'Gastón Villagra', 'elite-pro', 555),
  ('hernan-zarate', 'Hernán Zárate', 'master-pro', 645),
  ('cristian-bazan', 'Cristian Bazán', 'master-pro', 585),
  ('antonella-rojas', 'Antonella Rojas', 'damas-pro', 635),
  ('milagros-vera', 'Milagros Vera', 'damas-pro', 575),
  ('lautaro-chavez', 'Lautaro Chávez', 'amateur-men', 605),
  ('ezequiel-moyano', 'Ezequiel Moyano', 'amateur-men', 545),
  ('franco-araoz', 'Franco Aráoz', 'amateur-men', 500)
) as x(slug, nombre, categoria_slug, puntos)
join public.categorias c on c.torneo_id = 'open-shimano' and c.slug = x.categoria_slug
on conflict (id) do nothing;

-- LATAM
insert into public.corredores_precarga (id, torneo_id, nombre, categoria_id, puntos_iniciales)
select 'latam-' || x.slug, 'latam', x.nombre, c.id, x.puntos
from (values
  ('andres-salazar', 'Andrés Salazar', 'elite-pro', 690),
  ('cristobal-vidal', 'Cristóbal Vidal', 'elite-pro', 620),
  ('mateo-rengifo', 'Mateo Rengifo', 'elite-pro', 560),
  ('sebastian-munoz', 'Sebastián Muñoz', 'master-pro', 650),
  ('rodrigo-contreras', 'Rodrigo Contreras', 'master-pro', 590),
  ('valentina-rojas', 'Valentina Rojas', 'damas-pro', 640),
  ('fernanda-castillo', 'Fernanda Castillo', 'damas-pro', 580),
  ('joaquin-bravo', 'Joaquín Bravo', 'amateur-men', 610),
  ('nicolas-toro', 'Nicolás Toro', 'amateur-men', 550),
  ('felipe-araya', 'Felipe Araya', 'amateur-men', 505)
) as x(slug, nombre, categoria_slug, puntos)
join public.categorias c on c.torneo_id = 'latam' and c.slug = x.categoria_slug
on conflict (id) do nothing;
