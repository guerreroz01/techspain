# Wearables 2026-09-27 — 24 noticias

## Objective

Redactar las 24 noticias del vertical `wearables` del scan 27/09 (`scripts/candidates.json`,
`generated: 2026-09-27T18:19:46Z`), una carpeta por artículo en `src/content/news/<slug>/`.
Todas tipo `noticia` (ninguna es guía paso a paso).

## Scope

- Solo vertical `wearables`. Fuera: #12 readiness (publicada como T12 en el lote anterior)
  y #23 demanda IOENGINE/Samsung (publicada el 25/09 como
  `galaxy-s23-watch-ultra-demanda-patentes`).
- Ángulos verificados como distintos pese a match parcial en `find`: #3 Vision Pro ligero
  vs `john-ternus-vision-pro-defense` (defensa ejecutiva, otra historia); #13 Series 12 vs
  Fenix 9 Pro (comparativa de entreno) vs piezas de microLED/glucosa; #21 novedades watchOS 27
  vs piezas 27.0.1/Siri/app-switcher.

## Constraints

- Cuerpo y frontmatter en español neutro/profesional, sin voseo. Slug español kebab-case ASCII.
- `tags[0] = 'Wearables'`. `featured: false`, `breaking: false` (promoción al cierre).
- Noticia: contrastar con tech-media/reviews, confirmar con primary, chequear saturación
  es-competition, cubrir como rumor con hedging si solo hay rumor.
- Imágenes descargadas a `assets/`, nunca hotlink. Cover raster (`image()` rechaza SVG).
- Pasada SEO pre-publicación por artículo; no toca `title`, `tags`, `featured`, `breaking`, `pubDate`.
- Controles previos hechos: `npm run find` por historia (2 descartes arriba); `npm run slug`
  libre en los 24 slugs.
- Commit y push: los hace el usuario. No commitear.

## Checklist

- [x] W01 `xiaomi-reloj-menos-100-euros` — https://www.larazon.es/tecnologia-consumo/xiaomi/este-xiaomi-es-mejor-reloj-inteligente-te-puedo-recomendar-menos-100-euros-2000-nits-llamadas-24-dias-bateria_202609276ab6564da520494aafd6759b.html (Andro4all) ['Wearables','Móviles']
- [x] W02 `amazfit-cheetah-2-ultra-coordenadas` — https://gadgetsandwearables.com/2026/09/27/amazfit-cheetah-2-ultra-utm-mgrs-coordinates/ (Gadgets & Wearables)
- [x] W03 `apple-vision-pro-ligero-nuevos-formatos` — https://9to5mac.com/2026/09/27/apple-working-on-new-lighter-vision-pro-version/ (9to5Mac)
- [x] W04 `pixel-watch-controlar-google-tv` — https://www.androidpolice.com/started-using-pixel-watch-to-control-tv/ (Android Police) ['Wearables','Móviles']
- [x] W05 `ducharse-smartwatch-agua-razones` — https://www.movilzona.es/noticias/power-on/raznes-nunca-deberias-ducharte-smartwatch/ (MovilZona) ['Wearables','Salud']
- [x] W06 `huawei-watch-gt-7-46mm` — https://www.smartwatchspecifications.com/huawei-watch-gt-7-smartwatch-46-mm-is-here-with-20-health-metrics/ (Smartwatch Specifications) ['Wearables','Móviles']
- [x] W07 `celly-trainerwatch-deportivo-barato` — https://www.smartwatchspecifications.com/celly-trainerwatch-smartwatch-affordable-sport-smartwatch/ (Smartwatch Specifications)
- [x] W08 `garmin-forerunner-165-oferta-aliexpress` — https://topesdegama.com/ofertas/aliexpress/garmin-forerunner-165-reloj-deportivo-240926 (Topes de Gama)
- [x] W09 `coros-pace-4-pro-analisis-precio` — https://the5krunner.com/2026/09/26/coros-pace-4-pro-review-opinion/ (the5krunner)
- [x] W10 `insta360-gafas-inteligentes-comodidad` — https://www.androidheadlines.com/2026/09/insta360-smart-glasses-battery-design-comfort-first.html (AndroidHeadlines)
- [x] W11 `apple-watch-series-12-semana-despues` — https://9to5mac.com/2026/09/26/apple-watch-series-12-one-week-later/ (9to5Mac)
- [x] W13 `apple-watch-series-12-garmin-fenix-9-pro-comparativa` — https://www.techradar.com/health-fitness/smartwatches/i-was-expecting-the-apple-watch-series-12-and-garmin-fenix-9-pro-to-display-very-similar-stats-during-a-workout-i-was-wrong (TechRadar) ['Wearables','Salud']
- [x] W14 `meta-gafas-ia-cuota-omdia` — https://mixed-news.com/en/omdia-meta-81-3-percent-ai-glasses-1h26-even-realities-second/ (Mixed)
- [x] W15 `garmin-cirqa-entrenos-desaparecen` — https://www.the5krunner.com/2026/09/26/garmin-cirqa-workouts-disappearing/ (the5krunner)
- [x] W16 `garmin-fenix-9-94-errores` — https://www.the5krunner.com/2026/09/26/garmin-fenix-9-bugs/ (the5krunner)
- [x] W17 `vo2-max-estrategias-datos-wearables` — https://www.runnersworld.com/training/a73691670/wearable-data-vo2-max/ (Runner's World) ['Wearables','Salud']
- [x] W18 `galaxy-watch9-classic-filtracion` — https://gadgetsandwearables.com/2026/09/26/samsung-galaxy-watch9-classic-filing-timing/ (Gadgets & Wearables) ['Wearables','Móviles']
- [x] W19 `xiaomi-apple-watch-hyperos` — https://gadgetsandwearables.com/2026/09/26/xiaomi-apple-watch-hyperos-4-support/ (Gadgets & Wearables) ['Wearables','Móviles']
- [x] W20 `google-health-cardio-load-garmin` — https://gadgetsandwearables.com/2026/09/26/google-health-cardio-load-garmin-apple-watch/ (Gadgets & Wearables) ['Wearables','Salud']
- [x] W21 `watchos-27-novedades` — https://www.macrumors.com/guide/watchos-27-new-things-apple-watch/ (MacRumors)
- [~] W22 `google-health-5-09-pixel-watch` — FRENADO por el writer: duplicado de W20 (misma historia 5.09/Cardio Load, publicada hoy). No se escribió.
- [x] W24 `garmin-fenix-9-ultra-4-cual-comprar` — https://the5krunner.com/2026/09/25/garmin-fenix-9-vs-apple-watch-ultra-4/ (the5krunner)
- [x] W25 `apple-watch-ultra-3-descuento-199` — https://www.macrumors.com/2026/09/25/apple-watch-ultra-3-returns/ (MacRumors)
- [x] W26 `ultra-4-series-12-comparativa` — https://www.the5krunner.com/2026/09/25/apple-watch-ultra-4-vs-series-12-comparison/ (the5krunner)

## Acceptance

- 24 × `src/content/news/<slug>/index.mdx` + `assets/` con cover e imágenes.
- `npm run build` verde al cierre (uno solo, lo corre el orquestador).
- `npm run index` regenerado al cierre del lote.

## Route and trigger evidence

- Route: delegated direct (un writer por artículo, aislados por carpeta). Write trigger:
  24 archivos non-trivial.
- Checks por tarea: `find`/`slug` previos OK; build global al cierre, no por artículo.
