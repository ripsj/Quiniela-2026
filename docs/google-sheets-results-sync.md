# Sincronización automática de resultados

Esta pieza prepara la prioridad crítica: que Google Sheets actualice los resultados de partidos desde internet y la app siga leyendo Sheets como única fuente de verdad.

## Fuente

El script usa football-data.org API v4:

* Competición: `WC`
* Temporada: `2026`
* Endpoint: `/v4/competitions/WC/matches?season=2026&dateFrom=2026-06-11&dateTo=2026-07-20`

La API requiere token en el header `X-Auth-Token`.

## Instalación

1. Abre el Google Sheet de la quiniela.
2. Ve a `Extensiones > Apps Script`.
3. Crea un archivo y pega el contenido de `scripts/google-sheets/syncWorldCupResults.apps-script.js`.
4. En Apps Script, abre `Project Settings > Script properties`.
5. Agrega:

```text
FOOTBALL_DATA_API_TOKEN=tu_token
```

6. Ejecuta `previewWorldCupResultSync` una vez para autorizar permisos y revisar logs.
7. Ejecuta `populateWorldCupExternalMatchIds` para completar `external_match_id` en todos los partidos que crucen por fecha/equipos.
8. Ejecuta `syncWorldCupResultsFromInternet` para aplicar resultados.
9. Ejecuta `installWorldCupResultSyncTrigger` para sincronizar cada 15 minutos.

## Columnas de `partidos`

Requeridas, ya existentes:

* `id`
* `fecha`
* `equipo_local`
* `equipo_visitante`
* `goles_local`
* `goles_visitante`
* `finalizado`

Opcionales recomendadas:

* `external_match_id`
* `fuente_resultado`
* `ultima_actualizacion_resultado`

`external_match_id` hace el cruce mucho más confiable. Si no existe o está vacío, el script intenta cruzar por fecha, equipo local y equipo visitante.

Para conseguir los IDs de todos los partidos:

1. Agrega la columna `external_match_id` en la pestaña `partidos`.
2. Déjala vacía.
3. En Apps Script ejecuta `populateWorldCupExternalMatchIds`.
4. Revisa los logs. Las filas que no crucen normalmente necesitan un alias de equipo o ajuste de fecha.

## Comportamiento

* `syncWorldCupResultsFromInternet` solo procesa filas con `finalizado` distinto de `TRUE`.
* Solo marca `finalizado = TRUE` cuando football-data.org devuelve `FINISHED` o `AWARDED`.
* Por defecto no actualiza marcadores en vivo para evitar que el ranking cambie antes de que el partido termine.
* Si quieres mostrar marcadores en vivo sin cerrar partidos, cambia `SYNC_IN_PLAY_SCORES` a `true` dentro del script.
* Cuando el script logra cruzar una fila y existe la columna `external_match_id`, la rellena automáticamente.

## Notas de operación

Si un partido no cruza, revisa:

* Diferencias en nombres de equipos entre Sheets y football-data.org.
* Fecha del partido respecto a la zona horaria configurada.
* Agrega manualmente `external_match_id` en la fila conflictiva.

El script incluye `TEAM_ALIASES` para normalizar nombres comunes. Puedes ampliar ese objeto sin tocar la app.
