# Tucumán Gravity

App oficial no-oficial del torneo de descenso (downhill MTB) de Tucumán.
Organiza **Pachamama Bike Shop**. Sponsors: **Radoc** y **Commencal**.

> Estado actual: **v3 — backend real conectado.** Login con email y
> contraseña, tres roles reales (corredor / organizador / super admin)
> aplicados con seguridad a nivel de base de datos, datos persistentes en
> Supabase. Falta un solo paso manual tuyo: correr el SQL (ver abajo).

## Paso obligatorio antes de usarla: correr el SQL en Supabase

La app ya está conectada a tu proyecto de Supabase, pero las tablas
todavía no existen ahí — hay que crearlas una sola vez.

1. Entrá a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor** → **New query**.
2. Pegá **todo** el contenido de [`supabase/schema.sql`](supabase/schema.sql) y tocá **Run**.
3. Repetí el paso 2 con [`supabase/seed.sql`](supabase/seed.sql) (carga las 4 categorías, las 4 carreras y el ranking real de los 20 corredores como "histórico sin vincular").
4. Registrate normalmente en la app (`/registro`) con tu email real.
5. Confirmá tu cuenta desde el mail que te llega.
6. Volvé al SQL Editor y corré [`supabase/promover_superadmin.sql`](supabase/promover_superadmin.sql) (ya tiene tu email precargado: `ing.pazgeronimo@gmail.com` — cambialo ahí si te registraste con otro). Esto te convierte en super admin.

Después de eso, listo: vos entrás como super admin, y desde tu panel de
admin le podés dar el rol de organizador a la cuenta del dueño del
torneo cuando se registre.

## Cómo correr la app en tu máquina

```bash
cd tucuman-gravity
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Las variables de
entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) ya
están en `.env.local` — no hace falta tocarlas para desarrollo local.

## Cómo funcionan los roles (de verdad, no una demo)

- Te registrás → por defecto sos **corredor**, con tu propio perfil.
- **Nadie se autoasigna** organizador ni super admin: eso lo controla la
  base de datos con reglas de seguridad (Row Level Security), no el
  frontend. Aunque alguien mande pedidos directos a la API, no puede
  cambiarse el rol ni inflar sus propios puntos — hay un trigger en
  Postgres que lo bloquea siempre, sin excepción.
- El super admin asigna el rol de **organizador** a la cuenta del dueño
  del torneo desde `/admin`, una vez que esa persona se registra.
- Cada panel (`/mi-perfil`, `/organizador`, `/admin`) chequea el rol real
  de la sesión antes de mostrar nada. Si no corresponde, muestra un
  aviso en vez del contenido.

## Sobre el ranking real que ya tenías cargado

Los 20 corredores del acumulado real (Alejandro Ruiz Campo, Santiago De
Santiago, etc.) están cargados en `corredores_precarga` — visibles en el
ranking con la etiqueta "sin registrar" hasta que cada uno cree su
cuenta. Cuando alguien se registre y complete su categoría, vos o el
organizador lo vinculan desde `/admin` (sección "Ranking histórico sin
vincular"): ahí sus puntos pasan a su cuenta real y deja de aparecer
como precarga.

**Limitación real de esta etapa:** el organizador solo puede cargar
resultados de fechas nuevas para corredores que **ya tienen cuenta
creada**. Si alguien de los 20 históricos corre la fecha 4 antes de
registrarse, ese resultado puntual hay que cargarlo una vez que esa
persona se registre (su acumulado sigue siendo correcto igual, solo se
demora la carga del detalle fecha por fecha).

## Estructura del proyecto

```
supabase/
  schema.sql              tablas, roles, seguridad (RLS), triggers, vista de ranking, storage
  seed.sql                categorías, carreras y ranking real de arranque
  promover_superadmin.sql corré esto una vez, después de registrarte vos

src/lib/supabase/
  client.ts    cliente para componentes de cliente (navegador)
  server.ts    cliente para componentes de servidor
  middleware.ts + src/proxy.ts   mantienen la sesión viva en cada request
  types.ts     tipos de la base de datos

src/components/AuthProvider.tsx   sesión real + perfil + rol, disponible en toda la app
src/components/RoleGate.tsx       bloquea contenido según el rol real de la sesión
src/components/AccountMenu.tsx    menú de cuenta (perfil, paneles, cerrar sesión)
```

Las páginas públicas (portada, ranking, carreras, corredores) se
renderizan en el servidor consultando Supabase directamente — no
dependen de que el usuario esté logueado. Los paneles interactivos (mi
perfil, organizador, admin) corren en el cliente, autenticados con la
sesión real.

## Logo

Se usa el archivo oficial (`public/brand/logo-tucuman-gravity.png`), sin
fondo, apoyado sobre una placa clara en `src/components/Logo.tsx` para
que se lea bien en la UI oscura — el arte no fue modificado.

## Próximos pasos

1. Correr el SQL (ver arriba) y probar el registro/login real de punta a punta.
2. Invitar al dueño del torneo a registrarse y asignarle el rol de organizador.
3. Ir sumando corredores reales y vinculando su histórico desde `/admin`.
4. Sumar login con Google (Supabase ya lo soporta; falta crear las credenciales en Google Cloud Console cuando quieras dar ese paso).
5. Preparar la publicación (Vercel) — variables de entorno iguales a las de `.env.local`.
