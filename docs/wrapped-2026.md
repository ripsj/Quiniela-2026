# Wrapped global 2026

La portada incluye una secuencia cinematográfica global generada con React y datos de Sheets. Se comporta como un vídeo, pero sus cifras se construyen en tiempo real durante el build; por eso no hace falta renderizar un MP4 después de la final.

El storyboard, la copia definitiva, las reglas para empates y el checklist de producción están en [wrapped-guion-2026.md](./wrapped-guion-2026.md).

## Datos y audio

La secuencia visual no necesita un archivo de vídeo. El audio opcional se carga desde:

`public/wrapped-2026.mp3`

Si el archivo no existe, el Wrapped funciona sin audio y el control aparece deshabilitado.

Formato recomendado para el archivo proporcionado:

- MP3 estéreo.
- Duración mínima de 60 segundos o pista preparada para repetirse en bucle.
- Sin voz, para que los textos funcionen en cualquier momento de reproducción.
- Volumen integrado aproximado de `-14 LUFS`.
- Licencia propia, libre de derechos o expresamente autorizada para publicación web.
- Nombre exacto: `wrapped-2026.mp3`.

No se recomienda enlazar audio desde otra web: puede fallar por CORS, disponibilidad, cambios de URL o restricciones de licencia.

## Activación

En Vercel, añadir la variable:

`NEXT_PUBLIC_WRAPPED_ENABLED=true`

Después se debe crear un nuevo deployment. No activar la variable hasta que ranking, especiales y vídeo sean definitivos.

## Dry run

Para simular el cierre sin modificar Sheets:

`NEXT_PUBLIC_WRAPPED_DRY_RUN=true`

El modo prueba usa resultados ficticios, dura menos y se abre en cada recarga. Nunca debe activarse en producción.

## Comportamiento

- Primera visita: secuencia automática a pantalla completa; la pista de audio empieza al mismo tiempo, inicialmente silenciada.
- El botón `Activar sonido` habilita el audio mediante una interacción permitida por el navegador.
- Los controles permiten ir a la escena anterior, pausar/reanudar y avanzar a la siguiente.
- El botón de sonido solo alterna entre mute y audio activo.
- Pausar las escenas no detiene el audio; la pista continúa de manera independiente.
- Al finalizar o cerrar, el reproductor guarda `quiniela-2026-wrapped-seen-v2` en `localStorage`.
- Las siguientes visitas no interrumpen la navegación.
- El botón flotante `Ver Wrapped 2026` permite repetirlo.

Para probar de nuevo la primera visita durante desarrollo:

```js
localStorage.removeItem("quiniela-2026-wrapped-seen-v2")
```
