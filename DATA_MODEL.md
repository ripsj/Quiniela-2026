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
* ronda
* goles_local
* goles_visitante
* finalizado

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

## Problemas conocidos

### Especiales

Los usuarios escriben texto libre.

Ejemplos:

Cristiano Ronaldo
CR7
Ronaldo

Todos representan la misma entidad.

Será necesario implementar normalización mediante aliases.

## Regla importante

Google Sheets es la única fuente de verdad.

Nunca persistir datos localmente.

Nunca duplicar información.
