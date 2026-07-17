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

Estado: en progreso. El ranking ya muestra puntos confirmados, puntos por ganar y techo; falta representar la distancia al líder y la eliminación matemática.

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

### 4. Reordenar la portada para eliminatorias

Orden propuesto:

1. Resumen de la quiniela: líder, diferencia y puntos restantes.
2. Partidos de hoy; si no hay, próximos partidos.
3. Ranking compacto con puntos actuales y techo posible.
4. Especiales vivos.
5. Acceso al cuadro del torneo.

Navegación principal propuesta: `Inicio`, `Cuadro`, `Especiales`, `Ranking` y `Histórico`.

Criterio de terminado: en móvil se llega a partidos, ranking, especiales y cuadro sin recorrer gráficas o estadísticas históricas.

## Siguiente entrega — P1

### 5. Partidos de hoy y próximos partidos

Partir del módulo existente y completarlo:

- Mostrar hora, ronda y estado del partido.
- No se hicieron predicciones en esta quiniela, así que solo mostrar el marcador en tiempo real será suficiente.
- Si tiene implicaciones en especiales (por ejemplo, el campeón predecido de alguien está jugando y puede quedar eliminado)

No se intentará calcular puntuación en vivo a partir de un marcador parcial como si fuera definitiva.

### 6. Cuadro del torneo

Primera versión:

- Diesciseisavos, octavos, cuartos, semifinales, tercer lugar y final.
- Resultado y estado de cada cruce.
- Equipo clasificado resaltado cuando el partido finalice.
- Diseño móvil navegable por rondas, sin obligar a encoger todo el cuadro.
- Enlace del cruce a sus predicciones.

Datos mínimos requeridos en `partidos`:

- `ronda` normalizada.
- Orden estable dentro de cada ronda, mediante `orden_cuadro`.
- Relación opcional `siguiente_partido_id` para conectar cruces sin inferencias frágiles.

La primera versión puede agrupar partidos por ronda y orden. Las líneas de conexión entre cruces quedan condicionadas a disponer de `siguiente_partido_id`.

Criterio de terminado: el cuadro se genera desde Sheets y no contiene equipos, cruces ni resultados escritos a mano en el código.

## Después del overhaul — P2

- Simulador “qué pasa si” para próximos resultados.
- Escenarios de cambio de líder por partido.
- Probabilidad de ganar, solo después de definir y validar un modelo.
- Comparador entre dos participantes.
- Notificaciones o resumen diario.
- Tema visual específico del Mundial, sin bloquear mejoras funcionales.

## Orden recomendado de implementación

1. Definir y validar estados/resultados de especiales en Google Sheets.
2. Crear un único cálculo de puntos confirmados y potenciales.
3. Integrar especiales resueltos en el ranking.
4. Simplificar portada y navegación.
5. Mejorar `Hoy` con fallback a próximos partidos.
6. Normalizar datos del cuadro en Sheets.
7. Construir el cuadro del torneo.
8. Mover estadísticas y gráficas a `Histórico` o retirarlas según uso.

## Riesgos y reglas de producto

- Un estado faltante en especiales puede cambiar el techo de puntos; debe ser visible como error de datos.
- Los aliases de equipos y jugadores deben seguir normalizándose para evitar falsos eliminados o falsos aciertos.
- La puntuación debe vivir en una sola capa de dominio y reutilizarse en ranking, especiales y escenarios.
- Los componentes no deben inferir reglas de negocio a partir de colores o etiquetas de UI.
- El cuadro no debe depender del nombre textual de una ronda ni del orden accidental de las filas.

## Definición de éxito del corto plazo

El overhaul está completo cuando un participante puede abrir la portada desde el móvil y, sin hacer cálculos por su cuenta, entender quién lidera, qué se juega hoy, qué especiales siguen vivos, cuántos puntos puede ganar todavía y cómo está el cuadro del torneo.
