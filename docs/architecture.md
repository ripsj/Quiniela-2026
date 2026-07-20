# Arquitectura y contexto técnico

## Propósito

Este documento explica las decisiones que no son evidentes al abrir un archivo aislado. Para columnas y formatos de Sheets, consultar [DATA_MODEL.md](../DATA_MODEL.md). Para adaptar el sistema a otro torneo, consultar [reusing-for-another-tournament.md](./reusing-for-another-tournament.md).

## Arquitectura

La aplicación usa Next.js App Router. `app/page.tsx` es un Server Component asíncrono que carga en paralelo cinco fuentes CSV, construye todos los modelos derivados y entrega datos serializables a los componentes visuales.

No existen API routes, Server Actions ni almacenamiento local de negocio. `localStorage` se usa únicamente para recordar si un dispositivo ya vio el Wrapped.

### Flujo de datos

1. `lib/sheets.ts` define las URLs de exportación de cada hoja.
2. `lib/googleSheets.ts` descarga y parsea CSV con Papa Parse.
3. Next.js mantiene los datos hasta 60 segundos mediante `revalidate` y la etiqueta `google-sheets`.
4. `app/page.tsx` ejecuta las funciones de dominio de `lib/`.
5. Los componentes reciben modelos preparados; no vuelven a consultar Sheets.
6. Vercel renderiza la página y vuelve a validarla según la caché.

`loadCsv` se usa para hojas obligatorias. `loadOptionalCsv` devuelve `[]` si una fuente opcional falla; actualmente se usa para `goleadores`.

## Responsabilidades por módulo

| Archivo | Responsabilidad |
|---|---|
| `lib/types.ts` | Contratos de filas CSV y del ranking. |
| `lib/scoring.ts` | Regla atómica de puntuación de un partido. |
| `lib/ranking.ts` | Total confirmado, potencial restante, techo, desempates y eliminación matemática. |
| `lib/specialPredictions.ts` | Categorías, puntos, estados, resultados, opciones vivas e historial de especiales. |
| `lib/specialAliases.ts` | Equivalencias de texto libre para equipos, jugadores y fases. |
| `lib/pointsHistory.ts` | Puntos acumulados por jornada y especiales resueltos. También contiene la inferencia de jornadas. |
| `lib/rankingHistory.ts` | Posición acumulada usando las mismas jornadas y eventos especiales. |
| `lib/matchPredictions.ts` | Matriz partido × participante para la tabla de pronósticos. |
| `lib/matchDay.ts` | Fechas de Sheets y zona horaria de la jornada. |
| `lib/stats.ts` | Exactos, resultados, rachas y mejor día. |
| `lib/recentForm.ts` | Forma reciente por participante. |
| `app/page.tsx` | Orquestación y composición de la portada. |

Los archivos de `components/` deben encargarse de presentación, filtros y estado de interfaz. Una regla que afecte puntos o posiciones debe vivir en `lib/`.

## Reglas de dominio

### Partidos

`calculateMatchPoints` compara primero el signo del resultado (`local`, `visitante` o `empate`) y después el marcador:

- signo correcto: +1;
- marcador exacto: +1 adicional;
- máximo por partido: 2.

El ranking ignora partidos cuyo `finalizado` no sea exactamente `TRUE`. Los pronósticos pendientes solo aportan potencial si ambos goles son numéricos; cada partido pendiente pronosticado agrega dos puntos al techo.

### Ranking y desempates

El orden oficial se resuelve por:

1. puntos totales;
2. marcadores exactos;
3. resultados correctos;
4. nombre en español.

`puedeAlcanzarLider` queda en `null` cuando hay especiales con estado desconocido, porque el techo no es confiable. No se declara a nadie eliminado matemáticamente con información incompleta.

### Especiales

`SPECIAL_CATEGORIES` es la configuración canónica de categorías y puntos. Una categoría se evalúa con esta precedencia:

1. resultado oficial único (`*_resultado`, `*_ganador`, `*_real` o `*_oficial`);
2. lista global de opciones vivas;
3. estado por fila (`*_estado`, `*_status` o `*_vivo`);
4. `unknown` si no hay información suficiente.

Un resultado oficial tiene prioridad y convierte automáticamente las predicciones coincidentes en `hit` y el resto en `eliminated`. Una lista separada por `|`, `;`, `,` o salto de línea se interpreta como opciones todavía vivas, no como resultado final.

Los aliases normalizan tildes, mayúsculas y variantes comunes antes de comparar. Si dos textos representan la misma entidad, la equivalencia debe añadirse en `lib/specialAliases.ts`.

### Historiales

Puntos y posiciones generan un snapshot después de cada jornada, no después de cada partido. `jornada` puede venir explícita en Sheets. Si falta, se infiere dentro de cada grupo ordenando por fecha e ID y asignando cada par de partidos a Jornadas 1, 2 y 3.

Después de las jornadas se agregan los especiales resueltos en el orden definido por `SPECIAL_HISTORY_ORDER`. Este orden es de presentación histórica y puede diferir del orden de tarjetas.

## Caché y actualización

Hay dos valores de 60 segundos:

- `export const revalidate = 60` en `app/page.tsx`;
- `SHEETS_REVALIDATE_SECONDS = 60` en `lib/googleSheets.ts`.

`SHEETS_CACHE_VERSION` agrega una clave a las URLs. Incrementarla fuerza una URL nueva cuando cambie la interpretación de datos y sea necesario evitar respuestas antiguas en capas intermedias. No debe incrementarse en cada actualización normal de Sheets.

## Límites y decisiones conscientes

- No hay autenticación: la información debe ser apta para publicación.
- No hay panel de administración: se opera desde Google Sheets.
- No hay escritura desde la web: Apps Script es el único automatismo que modifica Sheets.
- La disponibilidad de la página depende de fuentes externas durante regeneración/build.
- No existe una suite automatizada de pruebas. TypeScript, ESLint, build y una revisión de datos son hoy la barrera de calidad.
- Varios textos y assets están fijados a 2026; no confundir reutilización de lógica con configuración completa. Ver la guía de migración.

## Decisiones que deben conservarse

- Sheets sigue siendo la fuente única de verdad.
- Los estados desconocidos deben hacerse visibles.
- Los cálculos confirmados y potenciales nunca deben mezclarse.
- El orden del ranking usado por tabla, podio y Wrapped debe provenir de `buildRanking`.
- Las gráficas de puntos y posiciones deben compartir los mismos eventos temporales.
- Un cambio de reglas exige actualizar código y documentación en el mismo cambio.
