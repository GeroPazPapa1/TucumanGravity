# Plataforma de torneos de descenso (ex Tucumán Gravity)

App multi-torneo de descenso (downhill MTB). Una sola cuenta, un solo
login, y desde ahí elegís entre varios torneos — cada uno con su propio
ranking, sus propias fechas y su propio organizador, sin mezclarse entre
sí.

> Estado actual: **v4 — estructura multi-torneo real.** Ocho torneos
> conviven en la misma plataforma: los 4 regionales (Tucumán Gravity,
> Córdoba, Mendoza, Patagonia), la Copa Argentina, el Open Shimano, el
> Latam y el Campeonato Argentino. Todos los datos y la seguridad de
> Tucumán Gravity que ya tenías cargados se migraron sin perder nada.

## Cómo correr la app en tu máquina

```bash
cd tucuman-gravity
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Las variables de
entorno ya están en `.env.local`.

## Estructura de torneos

- **`/`** — selector de torneos (nueva portada).
- **`/t/[torneo]`** — portada de un torneo puntual (ej: `/t/tucuman-gravity`).
- **`/t/[torneo]/ranking`**, **`/carreras`**, **`/corredores`** — igual que antes, pero encerrados dentro de su torneo.
- **`/t/[torneo]/organizador`** — panel del organizador de ESE torneo. Ahora carga resultados, fechas **y categorías** (los torneos nuevos arrancan sin categorías cargadas, el organizador las crea).
- **`/mi-perfil`** — sigue siendo global: tu identidad (nombre, foto, bici, equipo, DNI, fecha de nacimiento) es una sola, para todos los torneos.
- **`/admin`** — ahora gestiona todos los torneos: activar/desactivar, asignar o quitar organizadores por torneo, vincular ranking histórico por torneo.

## Cómo funcionan los roles ahora

- El rol **organizador ya no es global** — es por torneo. Alguien puede
  organizar Copa Argentina sin poder tocar nada de Tucumán Gravity, y
  viceversa. Lo controla la tabla `torneo_miembros` + seguridad (RLS) en
  la base de datos, no el frontend.
- El **super admin** (vos) sigue siendo global: ve y gestiona todos los
  torneos desde `/admin`.
- Un **corredor** se registra una sola vez y después se **inscribe** en
  cada torneo donde compite, eligiendo su categoría en ese torneo
  puntual (un cartel se lo pide automáticamente la primera vez que entra
  a un torneo nuevo). Puede correr en categorías distintas en cada
  torneo.

## DNI y fecha de nacimiento obligatorios

Después de registrarte (con Google o con email), la app te pide
completar tu **DNI y fecha de nacimiento** antes de dejarte usar el
resto — no se puede saltear. Esto evita cuentas duplicadas de la misma
persona (el DNI es único en la base) y deja la fecha de nacimiento lista
para cuando armemos el motor de categorías UCI (Fase 2).

## Sobre el ranking real que ya tenías cargado

Los 20 corredores del ranking real de Tucumán Gravity siguen intactos,
ahora en `corredores_precarga` filtrados por `torneo_id = 'tucuman-gravity'`.
Se vinculan igual que antes, desde `/admin` → elegís el torneo → "Ranking
histórico sin vincular".

## Estructura del proyecto

```
supabase/
  schema.sql                 esquema original (auth, roles globales, RLS)
  seed.sql                   datos reales de arranque de Tucumán Gravity
  migration_002_multi_torneo.sql   pasa la app a multi-torneo (torneos, categorías por
                              torneo, inscripciones, roles por torneo)
  fix_trigger_perfil.sql, promover_superadmin.sql   scripts puntuales ya usados

src/app/
  page.tsx                   selector de torneos
  t/[torneo]/                todo lo que vive adentro de un torneo puntual
  mi-perfil/, completar-perfil/, admin/, registro/, ingresar/   globales

src/components/
  AuthProvider.tsx           sesión + perfil + en qué torneos sos organizador
  OnboardingGate.tsx          fuerza completar DNI/fecha de nacimiento tras el primer login
  RoleGate.tsx                bloquea contenido: sesión / organizador de un torneo / superadmin
  InscripcionWidget.tsx       le pide al corredor su categoría la primera vez que entra a un torneo
```

## Logo

Se usa el archivo oficial (`public/brand/logo-tucuman-gravity.png`) en
el header de toda la plataforma por ahora — todavía no hay identidad
visual propia por torneo. Eso es a propósito: primero la estructura y la
funcionalidad, después el diseño por torneo (logos, colores) cuando los
tengas listos.

## Próximos pasos

1. **Vos:** probar con tu cuenta real los flujos que necesitan login —
   inscribirte a un torneo, el panel del organizador, el panel de admin
   (asignar organizadores, activar/desactivar torneos). No pude probar
   estos con tu contraseña real, así que son los que más conviene que
   revises vos.
2. Motor de categorías UCI automático (recalcular categoría por edad).
3. Importador de Excel para corredores y rankings regionales externos.
4. Motor de puntos de Copa Argentina (descarte, presentismo, fecha regional).
5. Resultados en vivo + integración visual de Cronometraje Instantáneo.
6. Login con Google (falta crear las credenciales en Google Cloud Console).
7. Identidad visual y logo propios por torneo.
