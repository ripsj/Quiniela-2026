# Operación y mantenimiento

## Antes de abrir el torneo

1. Validar que las cuatro hojas obligatorias exporten CSV.
2. Confirmar que los IDs de participantes y partidos sean únicos y estables.
3. Confirmar que cada pronóstico referencie IDs existentes.
4. Revisar categorías, puntos y aliases de especiales.
5. Verificar zona horaria, fechas y orden de jornadas.
6. Ejecutar `npm run lint`, `npx tsc --noEmit` y `npm run build`.
7. Comparar manualmente al menos un partido exacto, uno con solo signo correcto y uno fallado.
8. Desplegar con Wrapped desactivado.

## Rutina durante el torneo

### Antes de una jornada

- Comprobar que todos los partidos estén cargados y tengan fecha, equipos, grupo/jornada e ID.
- Comprobar que los pronósticos esperados tengan ambos goles.
- Mantener `finalizado` distinto de `TRUE` hasta que el resultado sea definitivo.
- Actualizar opciones vivas o estados de especiales cuando cambie el torneo.

### Después de un partido

Si se usa Apps Script, revisar que el cruce haya actualizado marcador, `finalizado`, fuente y fecha de actualización. Si se opera manualmente:

1. escribir `goles_local` y `goles_visitante`;
2. revisar el marcador;
3. escribir `TRUE` en `finalizado`;
4. esperar hasta 60 segundos y verificar ranking y tabla de pronósticos.

No marcar un partido como finalizado con marcador parcial. Con `SYNC_IN_PLAY_SCORES=true`, Apps Script puede mostrar el marcador en vivo, pero los puntos no se confirman hasta un estado final.

### Especiales

Método recomendado:

- durante el torneo, mantener una columna global `*_opciones_vivas`;
- al resolverse, sustituirla o acompañarla con un único `*_resultado`;
- verificar que la interfaz muestre `hit`/acertado para las predicciones correctas y que los puntos se sumen una sola vez.

Si se usan estados por participante, no dejar celdas sin estado: aparecerán como desconocidas y harán indeterminado el cálculo de eliminación matemática.

## Validación de un despliegue

Ejecutar:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Después revisar en móvil y escritorio:

- ranking y podio;
- desglose de puntos de partidos y especiales;
- partidos del día y pronósticos;
- filtros de especiales;
- gráficas de Jornada 1, 2, 3 y especiales;
- consola del navegador;
- Wrapped, solo si está habilitado.

El build consulta Sheets y Google Fonts. Un error `fetch failed`, `ETIMEDOUT` o de descarga de Poppins puede ser una falla externa transitoria. Reintentar y distinguirla de un error de TypeScript o compilación.

## Diagnóstico rápido

### La web no refleja un cambio de Sheets

1. Abrir directamente la URL CSV de `lib/sheets.ts` y comprobar el valor.
2. Esperar más de 60 segundos.
3. Confirmar que el cambio está en la pestaña/GID correctos.
4. Confirmar mayúsculas exactas de `TRUE`.
5. Si cambió la estructura o interpretación, actualizar `SHEETS_CACHE_VERSION` y desplegar.

### Faltan puntos de un partido

- El partido debe estar `finalizado = TRUE`.
- Los IDs deben coincidir como texto entre partido y pronóstico.
- Ambos marcadores deben ser numéricos.
- El participante debe existir en `participantes`.

### Un especial no suma o aparece desconocido

- Revisar el header contra `DATA_MODEL.md`.
- Comprobar que el resultado sea único, no una lista.
- Revisar tildes y aliases en `lib/specialAliases.ts`.
- Confirmar que el valor no sea `pendiente`, `por definir`, `por decidir`, `en juego` o `tbd`.
- Si se usan estados, utilizar uno de los valores soportados.

### Un partido no cruza con football-data.org

- Ejecutar la previsualización y leer los logs de Apps Script.
- Revisar fecha y zona horaria.
- Añadir un alias de equipo en `TEAM_ALIASES`.
- Como opción más confiable, escribir `external_match_id` manualmente.

### Las jornadas históricas son incorrectas

- Preferir una columna `jornada` explícita en todos los partidos de grupos.
- Sin esa columna, la app asume dos partidos por grupo y jornada, ordenados por fecha e ID.
- Partidos sin `grupo` ni `jornada` no aparecen en los snapshots de jornadas.

## Cierre del torneo

1. Confirmar todos los marcadores y partidos finalizados.
2. Completar resultados oficiales de todos los especiales.
3. Confirmar que no existan especiales `alive` o `unknown`.
4. Reproducir manualmente los puntos del podio.
5. Revisar desempates, estadísticas e historiales.
6. Activar y revisar `NEXT_PUBLIC_WRAPPED_DRY_RUN=true` fuera de producción.
7. Desactivar dry run y hacer un despliegue con Wrapped aún apagado.
8. Activar `NEXT_PUBLIC_WRAPPED_ENABLED=true` y desplegar el cierre.
9. Conservar un snapshot del Sheet y de los datos usados por el Wrapped.

## Recuperación y respaldo

Google Sheets es el único almacenamiento de negocio. Antes de cambios masivos, resultados finales o migraciones:

- crear una copia fechada del spreadsheet;
- exportar las cuatro pestañas obligatorias como CSV;
- conservar el commit y deployment que correspondan a ese snapshot;
- no guardar tokens ni credenciales dentro de los CSV o del repositorio.

## Mantenimiento de documentación

Actualizar en el mismo cambio:

- `PRODUCT.md` si cambian reglas o alcance;
- `DATA_MODEL.md` si cambian columnas o estados;
- `docs/architecture.md` si cambia el flujo o una decisión técnica;
- `docs/operations.md` si cambia la rutina de administración;
- `docs/reusing-for-another-tournament.md` si aparece otro valor específico del torneo.
