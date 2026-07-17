# Wrapped global 2026

La portada incluye una secuencia cinematográfica global generada con React y datos de Sheets. Se comporta como un vídeo, pero sus cifras se construyen en tiempo real durante el build; por eso no hace falta renderizar un MP4 después de la final.

El storyboard, la copia definitiva, las reglas para empates y el checklist de producción están en [wrapped-guion-2026.md](./wrapped-guion-2026.md).

## Datos y audio

La secuencia visual no necesita un archivo de vídeo. El audio opcional se carga desde:

`public/wrapped-2026.mp3`

Si el archivo no existe, el Wrapped funciona sin audio y el control aparece deshabilitado.

## Activación

En Vercel, añadir la variable:

`NEXT_PUBLIC_WRAPPED_ENABLED=true`

Después se debe crear un nuevo deployment. No activar la variable hasta que ranking, especiales y vídeo sean definitivos.

## Dry run

Para simular el cierre sin modificar Sheets:

`NEXT_PUBLIC_WRAPPED_DRY_RUN=true`

El modo prueba usa resultados ficticios, dura menos y se abre en cada recarga. Nunca debe activarse en producción.

## Comportamiento

- Primera visita: secuencia automática silenciada a pantalla completa.
- El botón `Activar sonido` habilita el audio mediante una interacción permitida por el navegador.
- Al finalizar o cerrar, el reproductor guarda `quiniela-2026-wrapped-seen-v2` en `localStorage`.
- Las siguientes visitas no interrumpen la navegación.
- El botón flotante `Ver Wrapped 2026` permite repetirlo.

Para probar de nuevo la primera visita durante desarrollo:

```js
localStorage.removeItem("quiniela-2026-wrapped-seen-v2")
```
