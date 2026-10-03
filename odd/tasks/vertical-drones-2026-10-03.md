# Vertical Drones 2026-10-03 — vertical editorial, redactor y artículo Antigravity A1

## Objective

Agregar la 11.ª vertical editorial `Drones` al portal (registro de verticales, clasificador,
redactor ficticio, plantilla de frontmatter, playbook de delegación, capa de fuentes y
`AGENTS.md §16`) y publicar la pieza sobre el **Antigravity A1** (primer dron con cámara 360°
integrada) en español + su compañero en inglés.

## Origen de la decisión

El usuario pidió «un artículo sobre las gafas Antigravity A1». La verificación de fuentes
primarias mostró que el **A1 es un dron**, no unas gafas: las «gafas» del bundle son las
**Antigravity Vision Goggles**, un accesorio FPV de vuelo. El portal no tiene vertical para
drones, y la mesa eligió **crear la vertical `Drones`** y publicar la pieza (no forzarla dentro
de `wearables`).

## Scope

- Vertical + redactor + clasificador + documentación + capa de fuentes alineada (patrón
  `emulacion`/`wearables`/`audio`) + UNA pieza (ES + EN) sobre el A1.
- Sin formatos de pieza nuevos: la pieza es `noticia`, como el resto del portal.
- La vertical es go-forward: no se re-etiquetan artículos publicados que mencionen «dron».

## Constraints

- **Dos registros independientes**: `src/lib/verticals.ts` y el objeto `VERTICALS` de
  `scripts/daily-news.mjs` no están conectados. `AUTHORS` y `VERTICAL_LABELS` **no** se validan
  contra el registro: si falta una clave, degrada en silencio (firma genérica / candidatos
  ocultos). Hay que actualizar los cuatro a mano.
- `VERTICAL_PRIORITY` debe incluir toda clave de `VERTICALS` (fail-fast) y define la precedencia
  del clasificador: `drones` va **después de `tutoriales`** para que una guía how-to sobre un
  dron caiga en `tutoriales` (regla documentada).
- Keyword de drones: términos de familia de producto (`drone`, `dron`, `dji mini/air/mavic/avata/neo`,
  `antigravity a1`, `autel evo`, …). **Nunca `dji` pelado** (DJI también vende audio y cámaras).
- `slug-check.mjs` lee los tokens por regex desde `src/lib/verticals.ts`: agregar la entrada
  reserva `drones` automáticamente (no tocar).
- Cuenta canónica pasa de **10 → 11** verticales. `AGENTS.md` menciona el conteo/lista en las
  líneas 9, 198, 338, 358, 359, 360, 363 (y 356 para capas/fuentes).
- Feeds de la capa `drones` verificados con el UA del detector
  (`techspain24-newsbot/1.0 (+editorial)`); los que respondan 403/muerto van `rss: null`.

## Checklist

### (a) Vertical `drones` end to end

- [x] `src/lib/verticals.ts`: `{ token: 'drones', es: 'Drones', en: 'Drones' }` en `VERTICALS`
      (+ alias `drones`/`drone` en `ES_ALIASES` y `EN_ALIASES`).
- [x] `src/lib/authors.ts`: entrada `drones` en `AUTHORS` (Álvaro Nieto, Redactor de Drones).
- [x] `skills/redaccion-prensa/redactores/drones.md`: ficha de redactor nueva (formato de `audio.md`).
- [x] `scripts/daily-news.mjs`: bloque de keywords `drones` en `VERTICALS`.
- [x] `scripts/daily-news.mjs`: `'drones'` en `VERTICAL_PRIORITY` justo después de `'tutoriales'`.
- [x] `scripts/daily-news.mjs`: `drones: '🛸 Drones'` en `VERTICAL_LABELS` (mismo orden).
- [x] `skills/redaccion-prensa/SKILL.md`: 10 → 11 y orden de prioridad.
- [x] `skills/redaccion-prensa/DELEGATION.md`: fila de la tabla, lista de tokens y mapeo de tags.
- [x] `skills/redaccion-prensa/assets/frontmatter-template.md`: conteo, tabla y orden.
- [x] `AGENTS.md §16` (y §1, §7, §14): 10 → 11 verticales y orden con `drones`.

### (b) Capa `drones` en `src/data/sources.json`

- [x] `meta.layers` con `drones`; `meta.version` 4 → 5; `meta.description` 8 → 9 capas.
- [x] 16 entradas de drones/FPV con `rss` verificado (0 con `rss: null`), `focus` con `drones`.
- [x] `AGENTS.md` línea 356 actualizada: **169 fuentes / 8 capas → 185 fuentes / 9 capas**.

### (c) Pieza Antigravity A1 (ES + EN)

- [x] `src/content/news/drones/antigravity-a1-dron-360/index.mdx` (+ 4 imágenes en `assets/`).
- [x] `src/content/news-en/drones/antigravity-a1-360-drone/index.mdx` (+ `assets/`),
      `translationOf: drones/antigravity-a1-dron-360`.
- [x] Pasada SEO pre-publicación sobre el `index.mdx` ES (sin tocar title/tags/featured/breaking/pubDate):
      keyword en el primer párrafo, enlace interno al hub `/noticias/drones/`, alt descriptivos.
- [x] **Corrección de exactitud (orquestador):** la afirmación «evitación de obstáculos solo frontal e
      inferior» era correcta al lanzamiento pero quedó obsoleta tras la actualización de primavera de
      2026 (evitación omnidireccional + modo de esquiva + control por voz + timelapse). Corregido en
      ES y EN; además se suavizó la promesa del mando de dos palancas (sin fecha caducada).

### (d) Cierre

- [x] `npm run build` → 898 páginas, sin errores de `translationOf` ni del dispatcher.
- [x] `npm run index` → «733 artículos publicados» en `scripts/articulos-publicados.md`.
- [x] `npm run test:sitemaps` → 7/7 checks OK (871 URLs en `sitemap-0`, 104 en `news-sitemap`).
- [x] Hubs `/noticias/drones/` y `/en/news/drones/` generados (hay 1 pieza en la vertical).
- [ ] Commit: NO ejecutado (la regla del repo exige pedido explícito del usuario).

## Hechos verificados del Antigravity A1 (para la redacción)

- Primer dron con **cámara 360° integrada**, **co-diseñado con Insta360** (tecnología de cosido).
- Plegable, **<250 g** (249 g con batería estándar; 291 g con la de alta capacidad). Clase EU C0/C1.
- Cuatro cámaras: dos ojo de pez (arriba/abajo) para el 360° + dos frontales de evasión de obstáculos.
- Sensor 1/1.28", f/2.2. Video 360: 8K 7680×3840@30, 5.2K@60, 4K slow-motion @100 fps.
  **Aclaración**: el «8K» es la suma de las dos lentes; en una dirección única rinde menos.
- Autonomía (fabricante): 24 min (estándar) / 39 min (alta capacidad). Medida real ~15-17 / ~25-28 min.
- Transmisión OmniLink 360, hasta 10 km (FCC) / 6 km (CE); latencia ~150 ms.
- **Vision Goggles**: micro-OLED 2560×2560 @72 Hz, head-tracking 360 en tiempo real, ~340 g, ~2,5 h;
  IPD 59-72 mm, dioptrías -5 a +2; pantalla frontal para espectadores.
- **Grip Motion Controller**: apuntar-para-volar; **sin** modo acro ni mando de sticks.
- Paquetes: Standard, Explorer e Infinity.
- **Disponible en España** (MediaMarkt, Amazon.es, camaralia, murciadrones). Standard desde ~849 €
  (idealo.es); en EE. UU. partía de 1.599 USD según WIRED.
- Crítica: caro, controles de vuelo poco intuitivos, obligación de gafas + mando, sin LOG ni ND,
  registro obligatorio en app. WIRED 7/10; Oscar Liang destaca la experiencia inmersiva.

## Fuentes

- Oficial (specs): `https://www.antigravity.tech/us/drone/antigravity-a1/specs`
- Oficial (compra ES): `https://www.antigravity.tech/es/drone/antigravity-a1/buy`
- Review WIRED ES (26-dic-2025): `https://es.wired.com/review/probamos-el-a1-de-antigravity-el-primer-dron-que-graba-en-360-pero-no-es-suficiente`
- Review Oscar Liang (11-dic-2025): `https://oscarliang.com/antigravity-a1/`

## Acceptance / evidencia

- `node --check scripts/daily-news.mjs` → SYNTAX OK; harness de `classify` con «Antigravity A1» y
  «DJI Mini 5 Pro» (el segundo no debe caer en `drones`).
- `JSON.parse` de `sources.json` válido, sin ids duplicados, feeds con código HTTP registrado.
- `npm run build` pasa (valida `translationOf` y el guardián del dispatcher).
- `npm run test:sitemaps` pasa; hubs de `drones` renderizados.

## Decisiones y contrapartidas

- Se eligió crear la vertical en vez de forzar el dron dentro de `wearables`; coste: conteo de
  verticales y capas documentado en varios sitios, y un hub nuevo que nace con una sola pieza.
- `drones` después de `tutoriales` en la prioridad: preserva la regla how-to → `tutoriales`.
- Riesgo de `dji` pelado advertido y evitado con términos de familia.

## Route and trigger evidence

- Route: delegated direct. Mapping delegado a `explore` (read-only). Escritura: un writer para el
  sistema de verticales (≥2 archivos no triviales) y un writer para la pieza ES+EN. Sin SDD (no
  solicitado; la arquitectura está documentada y es de bajo riesgo).

## Next steps

- [ ] Revisar el orden de `VERTICAL_PRIORITY` si en el futuro aparecen colisiones.
- [ ] Evaluar un hub de drones con más piezas antes de promocionarlo en la navegación.
