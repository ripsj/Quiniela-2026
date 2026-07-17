# Guion de producción — Wrapped global 2026

## Objetivo

Crear un vídeo global de aproximadamente 65 segundos que cierre la quiniela, celebre al ganador y recuerde los momentos estadísticos más divertidos del torneo.

El vídeo debe entenderse completamente sin sonido. El audio añade ritmo y emoción, pero ningún dato depende de una narración.

## Formato de la experiencia web

- Lienzo responsive a pantalla completa.
- Composición base: 16:9, adaptable a móvil vertical.
- Duración objetivo: 62–68 segundos.
- Zona segura para texto: 10% de margen lateral y 8% vertical.
- Render visual: React y CSS, alimentado por Sheets durante el build.
- Audio opcional: `public/wrapped-2026.mp3`.
- Controles visibles: anterior, pausa/reanudar, siguiente, sonido y omitir.

## Identidad visual

- Usar `quiniela-banner.png` como referencia principal.
- Paleta: azul profundo, violeta, rojo, turquesa y lima.
- Pato Merlín como hilo conductor entre escenas, no como elemento fijo que tape datos.
- Formas redondeadas y bandas geométricas inspiradas en el banner.
- Tipografía: Poppins, consistente con la aplicación.
- Texto principal blanco sobre azul profundo; evitar texto sobre zonas rojas o lima sin placa de contraste.
- Transiciones rápidas y limpias, sin flashes agresivos.

## Storyboard definitivo

| Tiempo | Escena | Texto en pantalla | Datos | Movimiento y audio |
|---|---|---|---|---|
| 00:00–00:05 | Apertura | `QUINIELA MUNDIAL 2026` / `El torneo que vivimos juntos` | Ninguno | Entrada desde negro. Bandas geométricas forman el fondo. Primer golpe musical. |
| 00:05–00:10 | La escala | `{participantes} participantes` / `{partidos} partidos` / `{pronosticos} pronósticos` | Participantes, partidos finalizados y pronósticos válidos | Los tres números aparecen uno por uno con conteo rápido. Confeti discreto. |
| 00:10–00:15 | Mundial real | `{campeon_mundial}` / `Campeón del mundo` | Resultado oficial de `campeon` | Silueta o nombre del equipo entra desde el centro. No usar escudo si no existe un asset autorizado. |
| 00:15–00:23 | Ganador de la quiniela | `Y quien conquistó la quiniela fue…` → `{ganador}` / `{puntos_totales} puntos` | Primer lugar del ranking final | Pausa de un segundo antes del nombre. Escala grande, celebración y aparición del Pato Merlín. Momento musical principal. |
| 00:23–00:29 | Podio | `EL PODIO FINAL` / `1. {primero}` / `2. {segundo}` / `3. {tercero}` | Primeros tres del ranking | Pedestales entran desde abajo. Mostrar puntos junto a cada nombre. |
| 00:29–00:35 | Exactos | `PUNTERÍA PERFECTA` / `{rey_exactos}` / `{exactos} marcadores exactos` | `stats.masExactos` | Diana o marcador animado. Efecto sonoro breve al encajar el número. |
| 00:35–00:41 | Racha | `IMPARABLE` / `{rey_racha}` / `{racha} resultados seguidos` | `stats.mejorRacha` | Tarjetas de partidos avanzan como una racha. Pulso rítmico por cada acierto. |
| 00:41–00:47 | Mejor jornada | `UN DÍA PARA RECORDAR` / `{rey_jornada}` / `{puntos_jornada} puntos el {fecha_jornada}` | `stats.mejorJornada` | Calendario o contador de puntos. La fecha usa formato corto: `17 de junio`. |
| 00:47–00:53 | El oráculo | `EL ORÁCULO` / `{rey_resultados}` / `{resultados_acertados} resultados acertados` | `stats.masResultados` | Un balón-oráculo ilumina tarjetas de resultados correctos. Destellos breves por cada acierto. |
| 00:53–00:59 | Especiales | `{aciertos_campeon} predijeron al campeón` / `{lider_especiales} ganó {puntos_especiales} puntos en especiales` | Categoría `campeon` y mayor `puntosEspeciales` | Opciones eliminadas se apagan; el campeón queda iluminado. |
| 00:59–01:09 | Cierre | `GRACIAS POR JUGAR` / `Nos vemos en la próxima quiniela` | Ninguno | Regreso al arte completo del banner. Pato Merlín al frente. La escena permanece 10 segundos para que la música resuelva y funda a negro. |

## Copia exacta y reglas de sustitución

Los textos en mayúsculas son títulos fijos. Los valores entre llaves se sustituyen al cerrar el torneo.

### Ranking final

- `{ganador}`: `ranking[0].nombre`.
- `{puntos_totales}`: `ranking[0].puntos`.
- `{primero}`, `{segundo}`, `{tercero}`: `ranking[0..2].nombre`.
- En el podio se muestran también `ranking[0..2].puntos`.
- El orden debe coincidir exactamente con los desempates de `buildRanking`.

### Escala del torneo

- `{participantes}`: número de filas válidas en `participantes`.
- `{partidos}`: partidos con `finalizado = TRUE` y marcador válido.
- `{pronosticos}`: pronósticos con partido existente y ambos goles numéricos.

### Mundial y especiales

- `{campeon_mundial}`: resultado oficial de la categoría `campeon`.
- `{aciertos_campeon}`: participantes con estado `hit` en `campeon`, sin duplicados.
- `{lider_especiales}`: participante con más `puntosEspeciales`.
- `{puntos_especiales}`: valor máximo de `puntosEspeciales`.
- Si varias personas empatan en especiales, usar: `{cantidad} participantes sumaron {puntos_especiales} puntos en especiales`.

### Premios estadísticos

- `{rey_exactos}` y `{exactos}`: `stats.masExactos`.
- `{rey_racha}` y `{racha}`: `stats.mejorRacha`.
- `{rey_jornada}`, `{puntos_jornada}` y `{fecha_jornada}`: `stats.mejorJornada`.
- `{rey_resultados}` y `{resultados_acertados}`: `stats.masResultados`.

## Tratamiento de empates

Los premios estadísticos no deben ocultar un empate en la métrica principal:

- Dos ganadores: mostrar ambos nombres unidos por `y`.
- Tres ganadores: mostrar los tres nombres separados por comas.
- Más de tres: usar `{cantidad} participantes` y enseñar los nombres pequeños en una segunda línea si caben.
- El ganador de la quiniela y el podio sí respetan los desempates oficiales del ranking; no se presentan como empate.

## Fallbacks obligatorios

- Si `campeon_resultado` no tiene un único valor definitivo, el vídeo no está listo para renderizar.
- Si quedan especiales con estado `unknown` o `alive`, el vídeo no está listo para publicar.
- Si falta una mejor jornada válida, sustituir la escena por el total de resultados acertados del líder.
- Si hay menos de tres participantes, adaptar el podio al número disponible.

## Diseño sonoro

- Base instrumental enérgica sin voz.
- Comenzar silenciado por política del navegador.
- La pista comienza junto con la primera escena, aunque esté silenciada.
- El botón `Activar sonido` debe permitir entrar a la música en cualquier punto sin reiniciar el vídeo.
- Pausar la secuencia visual no pausa ni reinicia la pista de audio.
- Usar efectos puntuales: conteos, marcador exacto, podio y revelación del ganador.
- Evitar depender de letras, locución o material con licencias dudosas.
- Mantener sonoridad integrada aproximada de `-14 LUFS` y pico máximo de `-1 dBTP`.

## Archivos de producción

Entregables finales:

- `public/wrapped-2026.mp3`: música web opcional.
- `production/wrapped-2026-master.mp4`: exportación opcional para redes, no necesaria para el sitio.
- `production/wrapped-2026-data.json`: snapshot de los valores usados.
- `production/wrapped-2026-script.txt`: copia final ya sustituida, útil para revisar errores ortográficos.

No publicar una exportación para redes sin conservar el snapshot de datos que la generó. La experiencia web lee los valores directamente durante el build.

Usar [wrapped-data-template.json](./wrapped-data-template.json) como contrato del snapshot final. Copiarlo a `production/wrapped-2026-data.json` y sustituir todos los valores `null`; no modificar los nombres de las propiedades durante producción.

## Checklist después de la final

1. Completar todos los campos `*_resultado` en Google Sheets.
2. Confirmar que no queden partidos sin finalizar.
3. Confirmar que ningún especial esté `alive` o `unknown`.
4. Ejecutar el build y comparar ranking, podio y estadísticas con Sheets.
5. Ejecutar el dry run y revisar cada escena con los datos definitivos.
6. Revisar empates y aplicar las reglas anteriores si una escena requiere texto plural.
7. Desactivar `NEXT_PUBLIC_WRAPPED_DRY_RUN`.
8. Desplegar todavía con `NEXT_PUBLIC_WRAPPED_ENABLED=false` y verificar la portada.
9. Cambiar `NEXT_PUBLIC_WRAPPED_ENABLED=true` y crear el deployment final.
10. Probar primera visita, sonido, cierre, finalización y repetición.
11. Opcional: congelar los datos y exportar un MP4 separado para redes sociales.

## Criterio de aprobación

El Wrapped está listo cuando:

- todos los números coinciden con el snapshot y con la aplicación;
- el ganador y el podio coinciden con el ranking final;
- se entiende completamente sin audio;
- ningún texto sale de la zona segura en móvil;
- el vídeo comienza silenciado, permite activar sonido y no vuelve a interrumpir al mismo dispositivo;
- la secuencia carga de manera fluida en un dispositivo móvil razonable.
