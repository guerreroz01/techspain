# Audios y móviles 2026-09-30 — 20 piezas (ES + EN)

## Objective

Redactar el lote del scan 30/09 limitado a las verticales prioritarias: 18 piezas de
`Audio` y 2 de `Móviles`, cada una con su compañera en inglés. Fuente: `scripts/candidates.json`
(`generated 2026-09-30T15:37:13Z`), secciones 🎧 Audio y 📱 Móviles de `scripts/seleccion.md`.

## Scope

- Solo audio y móviles. **Wearables: 0** (lo único en esa vertical era un *roundup* de ofertas).
  **Tutoriales: 0 sólidos** (solo un «cómo comprar una Switch 2», guía de compra, no tutorial).
- Excluidos por no ser artículo: 37 hilos de foro (Head-Fi/ASR), la Q&A de What Hi-Fi?, el
  resumen de audioXpress (Voice Coil), notas de prensa de Sennheiser y reseñas de vinilo/plugins.
- Descartados por ya publicados (`npm run find`): Galaxy S27 (`galaxy-s27-ufs-5-1-leak`,
  `galaxy-s27-ultra-funda`), Galaxy Tab S12, iQOO Pad Ultra, AYANEO Konkr Pocket Block.
- Historias repetidas en varios medios colapsadas a una pieza (Technics EAH-A1000 ×5,
  Marshall Bromley 150 ×4, Nothing Headphone Pro ×3, Bose cable ×3).

## Constraints

- Tipo `noticia` para todo (sin tipos nuevos, decisión de la mesa). ES neutro sin voseo.
- `tags[0]` = `Audio` / `Móviles`. `featured: false`, `breaking: false` (promoción al cierre).
- Imágenes descargadas a `assets/` de cada entrada, nunca hotlink. Pasada SEO por pieza ES.
- Slug ES fijado por el orquestador y verificado libre; slug EN elegido por cada redactor.
- **No listar `src/content/news/`**; no ejecutar build por subagente.

## Checklist (ES → EN, fuente)

- [x] `technics-eah-a1000` → `technics-eah-a1000-review` — eCoustics
- [x] `marshall-bromley-150` → `marshall-bromley-150-party-speaker` — AVPasión
- [x] `nothing-headphone-1-pro` → `nothing-headphone-1-pro` — eCoustics
- [x] `bose-auriculares-cable-usb-c` → `bose-noise-cancelling-wired-earbuds` — origen Bose
- [x] `bose-quietcomfort-ultra-auracast` → `bose-quietcomfort-ultra-2nd-gen-auracast` — SoundGuys
- [x] `loewe-neo-altavoz-bluetooth` → `loewe-neo-bluetooth-speaker` — What Hi-Fi?
- [x] `lg-xboom-power` → `lg-xboom-power-speakers` — AVPasión
- [x] `logitech-zone-vibe-pro` → `logitech-zone-vibe-pro-headphones` — SoundGuys
- [x] `beats-360` → `beats-360-review` — SoundGuys
- [x] `jlab-epic-sport-anc-3` → `jlab-epic-sport-anc-3-earbuds-review` — eCoustics
- [x] `juzear-light-shuttle-iem` → `juzear-light-shuttle-iem-review` — eCoustics
- [x] `psb-iq2-altavoces` → `psb-iq2-powered-speakers-review` — SoundGuys
- [x] `jbl-cinema-sb-mk2` → `jbl-cinema-sb-mk2-soundbars-wireless-rear-speakers` — Hifi Pig
- [x] `luxman-l-100` → `luxman-l-100-centennial-integrated-amplifier` — Stereophile
- [x] `thorens-td-404` → `thorens-td-404-dd-measurements` — Stereophile
- [x] `airpods-5-reparabilidad` → `airpods-5-repairability-curse` — origen iFixit
- [x] `shure-mv6-gen-2` → `shure-mv6-gen-2-usb-gaming-microphone` — origen Shure
- [x] `nuance-audio-plus-gafas` → `nuance-audio-plus-hearing-glasses` — audioXpress
- [x] `pixel-11a` → `pixel-11a-renders` — Pocket-lint (filtración, con hedging)
- [x] `fire-tv-stick-4k-vega-os` → `amazon-fire-tv-stick-4k-vega-os` — origen Amazon

## Acceptance / evidencia

- 20 × `src/content/news/<slug>/` + 20 × `src/content/news-en/<english-slug>/`, con `assets/`.
- `npm run build` verde: **736 páginas** (dos corridas).
- `npm run index` regenerado: **664 artículos publicados**.
- Promoción de mesa: `featured: true` en `technics-eah-a1000` (historia con más cobertura, 5
  medios); bajada a `false` la destacada previa `one-ui-9-disponible`. Una sola destacada.

## Notas / observaciones de los redactores

- Varias piezas EN enlazan internamente a la ruta **ES** (`/noticias/…`) cuando no existe la
  compañera EN, para no dejar `404` en `/en/news/…`.
- Detectados **enlaces EN preexistentes rotos** (varios artículos EN apuntan a
  `/en/news/qualcomm-snapdragon-sound-elite-gen-2/` y `/en/news/arctis-gamebuds-xbox-review/`,
  cuyas carpetas EN no existen). No es de este lote; conviene una pasada aparte.
- Titulares >60 caracteres señalados como observación editorial (p. ej. `beats-360`,
  `nuance-audio-plus-gafas`); el contrato SEO no toca `title`.

## Route and trigger evidence

- Route: **delegated direct** — un `general` por artículo (20), en una sola respuesta.
  Preparación inline: dedup + `npm run find` + `npm run slug` (20 libres) + extracción de URLs.
- Cierre por el orquestador: un build, un `npm run index`, y la promoción de portada.

## Next steps

- [ ] Wearables y tutoriales quedaron sin material publicable; reintentar en el próximo scan.
- [ ] Revisar el ruido de foro: Head-Fi (feed completo) aporta megahilos; valorar un subfeed.
- [ ] Pasada aparte para los enlaces EN rotos preexistentes.
