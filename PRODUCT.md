# PRODUCT.md

# Quiniela Mundial 2026

## Objetivo

Aplicación web para gestionar una quiniela del Mundial FIFA 2026.

Los datos viven en Google Sheets y la aplicación se despliega automáticamente en Vercel.

No existe base de datos propia.

Google Sheets actúa como backend.

## Tecnologías

* Next.js 16
* TypeScript
* Tailwind CSS v4
* Recharts
* Google Sheets CSV Export
* Vercel

## Usuarios

Aproximadamente 20 participantes.

## Sistema de puntuación

### Partidos

Cada participante realiza un pronóstico por partido.

#### Resultado correcto

Si acierta ganador o empate:

+1 punto

#### Marcador exacto

Si acierta exactamente el marcador:

+1 punto adicional

Ejemplos:

Real: 2-1

Predicción: 3-2

Resultado correcto:
+1

Predicción: 2-1

Resultado correcto:
+1

Marcador exacto:
+1

Total:
+2

### Puntos máximos

Cada partido vale:

2 puntos máximos

Actualmente:

72 partidos

Total máximo:

144 puntos

### Especiales

Los especiales resueltos se suman al ranking cuando su estado es `acertado` o la predicción coincide con el resultado oficial.

Valores:

* Campeón: 15
* Subcampeón: 10
* Tercer lugar: 5
* México: 7
* MVP: 3
* Goleador: 3

Total:

43 puntos

Los estados `vivo`, `eliminado`, `pendiente` o desconocido no conceden puntos. Los empates en el ranking se ordenan por total, marcadores exactos, resultados acertados y nombre.

El ranking separa puntos de partidos y especiales. También calcula los puntos todavía posibles y el techo de cada participante; los especiales sin estado conocido se señalan como datos incompletos y no se cuentan silenciosamente.

### Total torneo

144 + 43 = 187 puntos

## Filosofía UX

La aplicación debe sentirse como una plataforma deportiva.

Evitar apariencia corporativa o dashboard empresarial.

Inspiración:

* Flashscore
* SofaScore
* FIFA
* UEFA

Diseño:

* Responsive mobile first
* Visualización rápida
* Métricas deportivas
* Rankings claros
