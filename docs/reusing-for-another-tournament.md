# Reutilizar la quiniela en otro torneo

## Estrategia recomendada

Crear un repositorio y un Google Sheet nuevos a partir de copias. Conservar el proyecto 2026 como referencia histórica inmutable. No reutilizar el mismo spreadsheet si se quiere preservar el torneo anterior.

## 1. Preparar Google Sheets

Crear estas pestañas:

| Pestaña | Obligatoria | Headers mínimos |
|---|---|---|
| `participantes` | Sí | `id,nombre` |
| `partidos` | Sí | `id,fecha,dia,hora,equipo_local,equipo_visitante,grupo,jornada,ronda,goles_local,goles_visitante,finalizado` |
| `pronosticos` | Sí | `participante_id,participante,partido_id,goles_local,goles_visitante` |
| `especiales` | Sí | `participante_id,participante` más una columna por categoría |
| `goleadores` | No | `posicion,jugador,equipo,goles,asistencias,penales,actualizado` |

Reglas de IDs:

- IDs únicos y estables durante todo el torneo.
- `pronosticos.participante_id` debe existir en `participantes.id`.
- `pronosticos.partido_id` debe existir en `partidos.id`.
- No reciclar IDs al borrar filas.

Publicar las pestañas de modo que sus URLs de exportación CSV sean accesibles desde Vercel. No incluir información privada.

## 2. Conectar el nuevo spreadsheet

En `lib/sheets.ts`:

1. sustituir `SHEET_ID`;
2. sustituir los cuatro `gid`;
3. mantener `goleadores` por nombre o adaptar su URL.

Abrir cada URL en una ventana privada y confirmar que devuelve CSV, no una página de login o HTML de error.

## 3. Definir las reglas

### Partidos

Si cambia la regla de puntuación, modificar `lib/scoring.ts`. Después revisar:

- máximo posible en `lib/ranking.ts` (hoy usa `2` por partido pendiente);
- ejemplos y totales de `PRODUCT.md`;
- textos de la interfaz que mencionen puntos.

### Especiales

Modificar `SPECIAL_CATEGORIES` en `lib/specialPredictions.ts`:

- `key`: header canónico de Sheets;
- `label`: texto visible;
- `points`: valor;
- `aliases`: variantes aceptadas para el header.

Actualizar también `SPECIAL_HISTORY_ORDER` para definir cuándo aparecen en las gráficas. Agregar aliases de valores —equipos, jugadores o fases— en `lib/specialAliases.ts`.

Si una categoría es nueva, añadir su propiedad opcional a `SpecialPrediction` en `lib/types.ts` para que el contrato sea explícito, aunque el índice dinámico permita leerla.

### Jornadas

La implementación actual está diseñada para una fase de grupos de tres jornadas con dos partidos por grupo en cada jornada. Lo más seguro para otro formato es rellenar `partidos.jornada` explícitamente.

Si el torneo tiene más jornadas o una estructura distinta, adaptar `buildJornadaIndex` en `lib/pointsHistory.ts`. Puntos y posiciones comparten este índice; mantener ambos historiales alineados.

## 4. Sustituir identidad y contenido

Buscar todas las referencias específicas:

```bash
rg -n "2026|Mundial|WorldCup|WC|México|Mexico|Pato|wrapped-2026|quiniela-2026" \
  app components lib scripts docs package.json PRODUCT.md DATA_MODEL.md ROADMAP.md
```

Lista actual de puntos de cambio:

| Ubicación | Qué adaptar |
|---|---|
| `package.json` | Nombre del paquete. |
| `app/layout.tsx` | Título y descripción SEO. |
| `app/page.tsx` | Título, subtítulo, texto alternativo y datos simulados del Wrapped. |
| `quiniela-banner.png`, `fifa_logo.jpg`, `pato_merlin.jpg` | Identidad visual y licencias. |
| `components/WrappedVideoIntro.tsx` | Textos, asset de audio, año y clave de `localStorage`. |
| `public/wrapped-2026.mp3` | Audio final y nombre del archivo. |
| `.env.example` | Notas de activación. |
| `lib/matchDay.ts` | Zona horaria operativa. |
| `lib/sheets.ts` | Spreadsheet y GIDs. |
| `lib/specialPredictions.ts` | Categorías, puntos y orden histórico. |
| `lib/specialAliases.ts` | Equipos, jugadores y fases relevantes. |
| `PRODUCT.md` | Nombre, cantidad de partidos, máximos y reglas. |
| `docs/wrapped-*` | Guion, duración, nombres de archivos y checklist. |

No reutilizar la misma clave de `localStorage` del Wrapped: los dispositivos podrían considerarlo ya visto. Usar una clave versionada y específica del nuevo torneo.

## 5. Adaptar la sincronización automática

En `scripts/google-sheets/syncWorldCupResults.apps-script.js`, revisar todo `RESULT_SYNC_CONFIG`:

- `SHEET_NAME`;
- `COMPETITION_CODE` de football-data.org;
- `SEASON`;
- `DATE_FROM` y `DATE_TO`;
- `MATCH_DATE_TIME_ZONE`;
- `SYNC_IN_PLAY_SCORES`;
- estados finales/vivos;
- `TEAM_ALIASES`.

Confirmar primero que football-data.org cubre la competición. Si no la cubre, el resto de la aplicación puede seguir funcionando con resultados manuales, pero el Apps Script necesitará otro proveedor o debe desactivarse.

Instalar el script en el nuevo Sheet, crear una propiedad privada `FOOTBALL_DATA_API_TOKEN`, ejecutar dry run, completar IDs externos y solo entonces instalar el trigger.

## 6. Configurar despliegue

1. Crear un proyecto nuevo en Vercel.
2. Configurar Node.js 20.
3. Añadir las variables del Wrapped inicialmente en `false`.
4. Desplegar y comprobar acceso desde una sesión sin credenciales de Google.
5. Verificar que la región/horario mostrado corresponda al público objetivo.

No copiar `.env.local` al repositorio. Las variables `NEXT_PUBLIC_*` son visibles en el cliente y nunca deben contener secretos.

## 7. Ensayo mínimo antes de lanzar

Crear datos controlados con al menos dos participantes y tres partidos:

- un marcador exacto;
- un signo correcto con marcador distinto;
- un pronóstico fallado;
- un partido pendiente;
- un especial vivo;
- un especial acertado;
- un especial eliminado;
- un especial sin estado.

Comprobar:

- puntos 2/1/0;
- desempates;
- puntos confirmados frente a posibles;
- estado indeterminado por datos desconocidos;
- agrupación de jornadas;
- filtros en móvil;
- actualización tras 60 segundos.

Ejecutar después:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 8. Checklist de migración

- [ ] Repositorio y Sheet nuevos.
- [ ] IDs y headers validados.
- [ ] URLs CSV accesibles públicamente.
- [ ] `SHEET_ID` y GIDs actualizados.
- [ ] Puntuación y desempates confirmados.
- [ ] Categorías, valores y aliases actualizados.
- [ ] Jornadas/formatos del torneo revisados.
- [ ] Zona horaria actualizada.
- [ ] Textos, metadata y assets reemplazados.
- [ ] Configuración de Apps Script actualizada.
- [ ] Dry run de sincronización correcto.
- [ ] Wrapped renombrado, versionado y desactivado.
- [ ] TypeScript, lint y build correctos.
- [ ] Ensayo manual de reglas completado.
- [ ] Copia de seguridad inicial creada.

## Mejoras recomendadas antes del próximo torneo

Para reducir el trabajo manual, conviene centralizar en un futuro archivo de configuración:

- nombre, año y textos del torneo;
- spreadsheet/GIDs mediante variables de entorno;
- zona horaria;
- categorías y puntos especiales;
- cantidad y composición de jornadas;
- nombres de assets y clave del Wrapped.

También es recomendable añadir pruebas unitarias para `scoring`, `ranking`, especiales e historiales. Estas mejoras no son necesarias para operar la versión actual, pero disminuirían el riesgo de una próxima migración.
