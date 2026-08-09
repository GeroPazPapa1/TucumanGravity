-- ============================================================================
-- Tucumán Gravity — datos reales de arranque
-- Corré esto DESPUÉS de schema.sql, una sola vez (usa ON CONFLICT DO NOTHING,
-- así que si lo corrés de nuevo no duplica nada).
-- ============================================================================

insert into public.categorias (id, nombre, orden) values
  ('master-pro', 'Master Pro', 1),
  ('pro', 'Pro', 2),
  ('elite', 'Elite', 3),
  ('ebike-elite', 'E-Bike Elite', 4)
on conflict (id) do nothing;

insert into public.carreras (id, numero, nombre, lugar, lat, lng, estado) values
  ('la-rinconada', 1, 'La Rinconada', 'La Rinconada, Tucumán', -26.8115875, -65.3624789, 'disputada'),
  ('la-virgen', 2, 'La Virgen', 'Gruta de la Virgen, Tucumán', -26.8049626, -65.3483209, 'disputada'),
  ('el-cadillal', 3, 'El Cadillal', 'El Cadillal, Tucumán', -26.6234237, -65.2002676, 'disputada'),
  ('mundo-nuevo', 4, 'Mundo Nuevo', 'Mundo Nuevo, Tucumán', -26.863027, -65.343566, 'proxima')
on conflict (id) do nothing;

-- Acumulado real vigente antes de la 4ta fecha. Corredores todavía sin
-- cuenta creada: cuando se registren, el organizador o superadmin los
-- vincula desde el panel de admin (select public.vincular_precarga(...)).
insert into public.corredores_precarga (id, nombre, categoria_id, puntos_iniciales) values
  ('alejandro-ruiz-campo', 'Alejandro Ruiz Campo', 'master-pro', 680),
  ('martin-ahumada', 'Martín Ahumada', 'master-pro', 595),
  ('guille-garcia', 'Guille García', 'master-pro', 582),
  ('juan-pablo-luna', 'Juan Pablo Luna', 'master-pro', 473),
  ('alvaro-garcia', 'Álvaro García', 'master-pro', 463),

  ('santiago-de-santiago', 'Santiago De Santiago', 'pro', 685),
  ('jose-ignacio-gallardo', 'José Ignacio Gallardo', 'pro', 594),
  ('mateo-caceres', 'Mateo Cáceres', 'pro', 580),
  ('seba-gomez-lassalle', 'Seba Gómez Lassalle', 'pro', 525),
  ('benja-gomez-lassalle', 'Benja Gómez Lassalle', 'pro', 484),

  ('juancho-garcia', 'Juancho García', 'elite', 690),
  ('lucas-chaya', 'Lucas Chaya', 'elite', 602),
  ('facundo-kertens', 'Facundo Kertens', 'elite', 577),
  ('juan-blas-lopez', 'Juan Blas López', 'elite', 452),
  ('benjamin-clerici', 'Benjamín Clerici', 'elite', 444),

  ('alejo-dieguez', 'Alejo Diéguez', 'ebike-elite', 675),
  ('agustin-do-campo', 'Agustín Do Campo', 'ebike-elite', 635),
  ('tomas-jimenez-montilla', 'Tomás Jiménez Montilla', 'ebike-elite', 517),
  ('juan-pablo-tula-molina', 'Juan Pablo Tula Molina', 'ebike-elite', 501),
  ('santiago-bernasconi', 'Santiago Bernasconi', 'ebike-elite', 472)
on conflict (id) do nothing;
