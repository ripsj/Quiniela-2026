# Roadmap — fase eliminatoria

## Objetivo de producto

La fase de grupos terminó. La aplicación debe dejar de comportarse como un archivo de todo el torneo y convertirse en una pantalla de seguimiento de las eliminatorias.

Al entrar, un participante debería poder responder rápidamente:

1. ¿Cómo va la quiniela?
2. ¿Qué partidos se juegan hoy o cuál es el siguiente?
3. ¿Qué predicciones especiales siguen vivas y cuántos puntos valen?
4. ¿Cuántos puntos quedan en juego para cada participante?
5. ¿Cómo avanza el cuadro del torneo?

Google Sheets continúa siendo la única fuente de verdad. No se añadirá una base de datos.

## Decisiones de alcance

### Mantener y dar más protagonismo

- Ranking general y podio.
- Predicciones especiales, distinguiendo `fuera`, `acertado` y `pendiente`.
- Cambios recientes de posición como información secundaria del ranking.

### Sacar de la vista principal

Estas funciones no se eliminan de inmediato, pero dejan de competir por espacio en la portada:

- Evolución histórica de puntos y posiciones.
- Forma reciente de la fase de grupos.
- Estadísticas acumuladas como precisión, remontada y jugador del día.
- Tabla completa de todos los partidos y pronósticos.

Podrán vivir bajo una sección `Fase de grupos` o quedar temporalmente ocultas. Primero se simplifica la experiencia; después se decidirá si merece la pena mantenerlas.

### No construir todavía

- Probabilidad de ganar basada en un modelo estadístico.
- Comparador entre participantes.
- Cambios puramente cosméticos o un tema visual completo.

Antes de estimar probabilidades, la aplicación debe calcular correctamente los puntos resueltos y los puntos aún posibles.

## Prioridad inmediata — P0

### 1. Integrar los especiales en la puntuación

Estado: implementado.

Hoy los especiales se muestran, pero no suman al ranking. Esta es la principal deuda funcional.

Entregable:

- Sumar al ranking los especiales con estado `acertado`.
- No sumar especiales `fuera` o `pendientes`.
- Mostrar por participante el desglose `partidos + especiales = total`.
- Mantener los valores actuales: campeón 15, subcampeón 10, tercer lugar 5, fase de México 7, MVP 3 y goleador 3.

Criterio de terminado: el total visible de cada participante se puede reproducir únicamente con las hojas `pronosticos`, `partidos` y `especiales`.

### 2. Mostrar quién sigue vivo en los especiales

Estado: implementado.

La UI ya entiende estados, pero necesita una vista centrada en lo relevante durante eliminatorias.

Entregable:

- Vista por participante con sus especiales vivos, eliminados y acertados.
- Vista por categoría con las opciones que todavía pueden cumplirse.
- Resumen visible: `X participantes siguen vivos` y `Y puntos en juego`.
- Filtro para ocultar opciones eliminadas sin perder la posibilidad de consultarlas.
- Estado desconocido claramente señalado para detectar datos faltantes en Sheets.

Criterio de terminado: nunca se presenta un estado desconocido como si estuviera vivo.

### 3. Calcular los puntos todavía en juego

Estado: implementado.

Este cálculo debe ser determinista, no una probabilidad.

Por participante se mostrará:

- Puntos actuales por partidos.
- Puntos ya ganados en especiales.
- Puntos posibles en partidos pendientes.
- Puntos posibles de especiales que siguen vivos.
- Techo de puntuación: `puntos actuales + puntos todavía posibles`.
- Distancia al líder y si aún puede alcanzarlo matemáticamente.

Para especiales, solo cuenta como posible el estado `pendiente`; un estado desconocido debe aparecer como dato incompleto y no alimentar el cálculo silenciosamente.

Criterio de terminado: cada cifra ofrece un desglose comprensible y no mezcla puntos confirmados con puntos potenciales.

## Wrapped global — post torneo

Estado: implementado.

- Vídeo global a pantalla completa en la primera visita del dispositivo.
- Autoplay silenciado compatible con las políticas de navegador.
- Control para activar sonido, omitir y volver a reproducir.
- Activación manual mediante `NEXT_PUBLIC_WRAPPED_ENABLED` al finalizar el torneo.
- Datos generados directamente desde Sheets durante el build.
- Audio opcional esperado: `public/wrapped-2026.mp3`.
