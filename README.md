# Quiniela Mundial 2026

Aplicación web para seguir una quiniela de fútbol: ranking, pronósticos por partido, especiales, estadísticas, evolución histórica y cierre tipo Wrapped. Google Sheets es la única fuente de verdad; la aplicación no usa una base de datos propia.

## Inicio rápido

Requisitos:

- Node.js 20.
- npm.
- Un Google Sheet publicado o accesible mediante exportación CSV.

```bash
npm install
cp .env.example .env.local
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

Comandos habituales:

```bash
npm run dev       # desarrollo
npm run lint      # análisis estático
npx tsc --noEmit  # comprobación de tipos
npm run build     # build de producción
npm run start     # servir el build
```

El build necesita acceso a Google Sheets y a Google Fonts. Si alguna fuente externa no responde, el build puede fallar aunque TypeScript y ESLint estén correctos.

## Cómo funciona

```text
Google Sheets (CSV)
        │
        ▼
app/page.tsx ── carga y transforma datos en el servidor
        │
        ├── lib/* ── puntuación, ranking, especiales e historiales
        │
        ▼
components/* ── tablas, tarjetas, gráficas y Wrapped
        │
        ▼
     Vercel
```

Los CSV se revalidan cada 60 segundos. Los resultados pueden escribirse en Sheets automáticamente mediante el Apps Script incluido; la web siempre vuelve a leer Sheets.

## Configuración

Las URLs de las hojas están en [`lib/sheets.ts`](./lib/sheets.ts). Para conectar otro documento hay que sustituir el ID del spreadsheet y los `gid` de:

- `participantes`
- `partidos`
- `pronosticos`
- `especiales`

La hoja opcional `goleadores` se consulta por nombre.

Variables de entorno:

| Variable | Predeterminado | Uso |
|---|---:|---|
| `NEXT_PUBLIC_WRAPPED_ENABLED` | `false` | Activa el Wrapped final. |
| `NEXT_PUBLIC_WRAPPED_DRY_RUN` | `false` | Simula resultados y muestra el Wrapped en cada recarga. Solo desarrollo. |

No hay credenciales de Google Sheets en `.env.local`: las hojas se consumen como CSV. El token de football-data.org vive en las propiedades privadas de Apps Script, nunca en este repositorio.

## Reglas esenciales

- Partido finalizado: solo cuenta si `finalizado` es exactamente `TRUE`.
- Resultado correcto: 1 punto.
- Marcador exacto: 1 punto adicional.
- Desempate: puntos totales, exactos, resultados acertados y nombre.
- Los especiales suman solo al estar resueltos/acertados.
- Un estado especial desconocido se muestra como dato incompleto; no se considera vivo silenciosamente.
- Las gráficas históricas agrupan los partidos por Jornada 1, 2 y 3 y después agregan los especiales resueltos.

La especificación completa está en [PRODUCT.md](./PRODUCT.md) y [DATA_MODEL.md](./DATA_MODEL.md).

## Documentación

- [Arquitectura y contexto técnico](./docs/architecture.md): flujo de datos, módulos, decisiones e invariantes.
- [Modelo de datos](./DATA_MODEL.md): hojas, columnas y estados soportados.
- [Guía para reutilizar en otro torneo](./docs/reusing-for-another-tournament.md): checklist de clonación y todos los valores a cambiar.
- [Operación y mantenimiento](./docs/operations.md): rutina durante el torneo, despliegue, validación y problemas comunes.
- [Sincronización de resultados](./docs/google-sheets-results-sync.md): instalación y uso de Apps Script.
- [Wrapped final](./docs/wrapped-2026.md): activación y comportamiento.
- [Guion del Wrapped](./docs/wrapped-guion-2026.md): producción y checklist de cierre.
- [Roadmap](./ROADMAP.md): decisiones y trabajo futuro.

## Estructura del repositorio

```text
app/          página, layout y estilos globales
components/   interfaz y componentes interactivos
lib/          tipos y reglas de negocio puras
scripts/      automatizaciones que viven fuera de Next.js
docs/         operación, arquitectura y producción
public/       assets servidos sin transformación
```

## Principios para contribuir

- Mantener Google Sheets como fuente única de verdad.
- Colocar reglas de negocio en `lib/`, no dentro de componentes visuales.
- No cambiar puntuación, desempates ni interpretación de estados sin actualizar `PRODUCT.md`, `DATA_MODEL.md` y las pruebas manuales de operación.
- Revisar la documentación incluida en `node_modules/next/dist/docs/` antes de modificar APIs o convenciones de Next.js; este proyecto usa Next.js 16.
- Ejecutar TypeScript, ESLint y build antes de desplegar.

## Estado conocido

La aplicación está especializada visual y operativamente para el Mundial 2026. La lógica es reutilizable, pero varios identificadores, fechas, textos, assets y claves del Wrapped siguen fijados a este torneo. La lista exhaustiva y el orden recomendado de migración están en [reusing-for-another-tournament.md](./docs/reusing-for-another-tournament.md).
