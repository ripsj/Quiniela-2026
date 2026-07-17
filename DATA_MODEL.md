# DATA_MODEL.md

# Fuentes de datos

Los datos provienen de Google Sheets.

## Participantes

Campos:

* id
* nombre

## Partidos

Campos:

* id
* fecha
* dia
* hora
* equipo_local
* equipo_visitante
* grupo
* jornada
* ronda
* goles_local
* goles_visitante
* finalizado

Campos opcionales recomendados para sincronización automática:

* external_match_id
* fuente_resultado
* ultima_actualizacion_resultado

`jornada` es opcional. Si no existe, la app calcula Jornada 1, 2 y 3 usando `grupo` y el orden de partidos de la fase de grupos.

Importante:

Solo los partidos con:

finalizado = TRUE

deben considerarse para cálculos.

## Pronósticos

Campos:

* participante_id
* participante
* partido_id
* goles_local
* goles_visitante

## Especiales

Campos:

* participante_id
* participante
* campeon
* subcampeon
* tercer_lugar
* fase_mexico
* mvp
* goleador

Headers canónicos:

* `tercer_lugar`
* `fase_mexico`

La app también tolera variantes comunes como `tercer lugar`, `3er_lugar`, `fase mexico` y `fase de mexico`, pero conviene mantener los headers canónicos en Google Sheets.

Para `mvp`, la app tolera variantes como `MVP`, `mejor_jugador`, `mejor jugador`, `jugador_mvp` y `jugador mvp`.

Campos opcionales para marcar viabilidad:

* campeon_estado
* subcampeon_estado
* tercer_lugar_estado
* fase_mexico_estado
* mvp_estado
* goleador_estado

Valores soportados:

* vivo
* eliminado
* acertado
* pendiente

Para categorías con pocas opciones todavía posibles, se puede mantener una sola lista en vez de marcar cada fila. Headers soportados:

* campeon_opciones_vivas
* subcampeon_opciones_vivas
* tercer_lugar_opciones_vivas
* fase_mexico_opciones_vivas
* mvp_opciones_vivas
* goleador_opciones_vivas

Las opciones se separan con `|`, `;` o `,`. Ejemplo durante la final:

`campeon_opciones_vivas = España | Argentina`

También se puede escribir provisionalmente esa lista en el campo de resultado existente:

`campeon_resultado = España | Argentina`

Una lista con varias opciones se interpreta como opciones vivas. Cuando quede un único valor, por ejemplo `campeon_resultado = España`, se interpreta como resultado oficial y concede los puntos correspondientes. Valores como `pendiente`, `por definir`, `por decidir`, `en juego` o `tbd` no se interpretan como resultados oficiales.

Alternativa recomendada:

En vez de marcar el estado participante por participante, puedes agregar una sola columna de resultado por categoría. La app compara cada predicción contra ese resultado y marca automáticamente `acertado` o `fuera`.

Headers soportados:

* campeon_resultado
* subcampeon_resultado
* tercer_lugar_resultado
* fase_mexico_resultado
* mvp_resultado
* goleador_resultado

También se aceptan sufijos equivalentes:

* `_ganador`
* `_real`
* `_oficial`

## Goleadores

Campos:

* posicion
* jugador
* equipo
* goles
* asistencias
* penales
* actualizado

Esta pestaña puede ser creada y actualizada por Apps Script con `syncWorldCupScorers`.

## Problemas conocidos

### Especiales

Los usuarios escriben texto libre.

Ejemplos:

Cristiano Ronaldo
CR7
Ronaldo

Todos representan la misma entidad.

La app normaliza estas variantes mediante aliases en `lib/specialAliases.ts`.

Para agregar equivalencias nuevas:

* Editar `SPECIAL_ALIAS_GROUPS`
* Usar el nombre canónico como llave
* Agregar variantes comunes en el arreglo

## Regla importante

Google Sheets es la única fuente de verdad.

Nunca persistir datos localmente.

Nunca duplicar información.

La sincronización automática de resultados debe escribir de vuelta en Google Sheets. La aplicación web sigue leyendo únicamente los CSV publicados desde Sheets.
