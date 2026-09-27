# Tutoriales 2026-09-27 — 12 guías how-to

## Objective

Redactar las 12 guías del vertical `tutoriales` del scan 27/09 (`scripts/candidates.json`,
`generated: 2026-09-27T18:19:46Z`), una carpeta por artículo en `src/content/news/<slug>/`.

## Scope

- Solo vertical `tutoriales`. Las 5 URLs duplicadas de ComputerHoy colapsan en 2 piezas.
-quedan fuera (con motivo): `guia-mesas-escritorio` (hogar, fuera de los 9 verticales),
  `macbook-deals-septiembre-2026` y `moviles-rugerizados-guia-compra` (guías de compra =
  `noticia` según el gate, y el pedido fue solo tutoriales).
- `readiness-score-apple-watch-antiguo` se mantiene: verificado contra
  `wearable-readiness-scores-evidence-gap` (22/09) — aquel es análisis de evidencia,
  esto es guía práctica. Historia distinta.

## Constraints

- Cuerpo y frontmatter en español neutro/profesional, sin voseo. Slug español kebab-case ASCII.
- `tags[0] = 'Tutoriales'`. `featured: false`, `breaking: false` (promoción al cierre).
- Imágenes descargadas a `assets/`, nunca hotlink. Cover raster (`image()` rechaza SVG).
- Pasada SEO pre-publicación por artículo; no toca `title`, `tags`, `featured`, `breaking`, `pubDate`.
- Controles previos hechos: `npm run find` sin coincidencias salvo readiness (verificada
  distinta); `npm run slug` libre en los 12 slugs.
- Commit y push: los hace el usuario. No commitear.

## Checklist

- [x] T01 `modo-escritorio-android-movil-pc` — https://www.engadget.com/2267572/how-to-use-desktop-mode-android-phone/ (Engadget)
- [x] T02 `modo-running-spotify-ios-android` — https://www.engadget.com/2267524/how-to-use-spotify-running-mode-ios-android-guide/ (Engadget)
- [x] T03 `seguridad-router-10-minutos` — https://www.engadget.com/2267401/how-to-improve-router-security-10-minutes/ (Engadget)
- [x] T04 `retroid-pocket-duo-lite-optimizacion-guia` — https://retrohandhelds.gg/retroid-pocket-duo-lite-optimization-guide/ (Retro Handhelds)
- [x] T05 `switch-2-ruido-calor-dock-solucion` — https://www.nintenderos.com/nintendo-switch-2/tu-nintendo-switch-2-hace-ruido-o-se-calienta-en-el-dock-cuidado-asi-puedes-solucionarlo-paso-a-paso/ (Nintenderos)
- [x] T06 `live-text-iphone-como-usarlo` — https://www.engadget.com/2266810/how-to-use-live-text-feature-iphone/ (Engadget)
- [x] T07 `apps-android-windows-pc` — https://www.engadget.com/2266521/how-to-use-android-apps-on-windows-pc/ (Engadget)
- [x] T08 `ocultar-nombre-foto-perfil-windows-11` — https://computerhoy.20minutos.es/software/como-ocultar-nombre-foto-perfil-menu-inicio-windows-11_7037940_0.html (ComputerHoy)
- [x] T09 `ocultar-conversaciones-whatsapp-guia` — https://computerhoy.20minutos.es/moviles/como-guardar-secretos-whatsapp-2026-guia-completa-para-ocultar-conversaciones-privadas-aunque-te-espien-movil_7032876_0.html (ComputerHoy)
- [x] T10 `compartir-ubicacion-tiempo-real-whatsapp` — https://hipertextual.com/guias/compartir-ubicacion-whatsapp-tiempo-real/ (Hipertextual)
- [x] T11 `restablecer-home-mini-fabrica` — https://www.engadget.com/2266523/how-to-factory-reset-google-home-mini/ (Engadget)
- [x] T12 `readiness-score-apple-watch-antiguo` — https://www.stuff.tv/features/dont-have-apple-watch-ultra-4-or-series-12-heres-how-to-get-a-readiness-score-on-your-older-apple-watch/ (Stuff)

## Acceptance

- 12 × `src/content/news/<slug>/index.mdx` + `assets/` con cover e imágenes.
- `npm run build` verde al cierre (uno solo, lo corre el orquestador).
- `npm run index` regenerado al cierre del lote.

## Route and trigger evidence

- Route: delegated direct (un writer por artículo, aislados por carpeta). Write trigger:
  12 archivos non-trivial.
- Si la delegación no está disponible en este runtime, fallback inline por artículo.
- Checks por tarea: `find`/`slug` previos OK; build global al cierre, no por artículo.
