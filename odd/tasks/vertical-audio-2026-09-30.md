# Vertical Audio 2026-09-30 — vertical editorial, capa de fuentes y orden de prioridad

## Objective

Agregar la vertical editorial `Audio` al portal (keywords, skill de redacción, plantilla de
frontmatter, playbook de delegación y `AGENTS.md §16`), crear la capa `audio` en
`src/data/sources.json` con medios especializados verificados, y fijar el orden de prioridad
de las verticales: `audio` → `wearables` → `móviles` → `tutoriales` → hardware.

## Scope

- Vertical + capa de fuentes + prioridad. Decisión de producto del usuario: sin tipos de pieza
  nuevos. «Análisis/review», «comparativa» y «opinión» NO se agregan como formatos; las piezas
  de audio se escriben con `noticia` o `tutorial`, como el resto del portal.
- La capa `audio` se alinea con la vertical homónima (mismo patrón que `emulacion`/`wearables`).

## Constraints

- Precedencia = orden de la lista `VERTICAL_PRIORITY` (NO el orden del objeto `VERTICALS`);
  `classify` la recorre y el informe agrupa por `verticals[0]`. Cuenta canónica: 10 verticales.
- `VERTICAL_LABELS` fija el orden de las secciones del informe (alineado con la prioridad).
- Los feeds se verifican con el User-Agent del detector (`techspain24-newsbot/1.0 (+editorial)`);
  los medios que lo bloquean (403) no se listan o van con `rss: null`.

## Checklist

- [x] `scripts/daily-news.mjs`: bloque `audio` en `VERTICALS` con keywords ES/EN/zh y marcas.
- [x] `scripts/daily-news.mjs`: `audio: '🎧 Audio'` en `VERTICAL_LABELS`.
- [x] `scripts/daily-news.mjs`: `VERTICAL_PRIORITY` (audio → wearables → moviles → tutoriales →
      hardware) con validación fail-fast; `classify` recorre por prioridad, no por orden del objeto.
- [x] `scripts/daily-news.mjs`: `VERTICAL_LABELS` reordenado al mismo orden de prioridad.
- [x] `scripts/daily-news.mjs`: se quitan `headset`/`headsets` pelados de `audio` (con Audio nº 1
      capturaban los visores VR); queda `gaming headset`.
- [x] `skills/redaccion-prensa/SKILL.md`: scope 9 → 10 verticales, reglas de precedencia y orden.
- [x] `skills/redaccion-prensa/assets/frontmatter-template.md`: lista 9 → 10 + notas de prioridad.
- [x] `skills/redaccion-prensa/DELEGATION.md`: token interno `audio` y mapeo → `Audio`.
- [x] `AGENTS.md §16`: 10 verticales, capa `audio` (8 capas, 169 fuentes) y `VERTICAL_PRIORITY`.
- [x] `src/data/sources.json`: capa `audio` (25 entradas, todas con RSS verificado), `meta.layers`
      a 8 capas y `version` 3 → 4.

## Acceptance / evidencia

- `node --check scripts/daily-news.mjs` → SYNTAX OK.
- `classify` sobre 24 titulares (harness temporal, sin red). Casos clave:
  - `Xiaomi Buds` / `Galaxy Buds` → `audio` (antes `moviles`).
  - `Sony Pulse Elite headset for PS5` → `consolas` (al quitar `headset` de audio).
  - `Meta Quest 4 VR headset` → `wearables` (tras quitar `headset`; antes caía en `audio`).
  - `RTX 5090` → `tarjetas-graficas`; `Samsung Galaxy S25` → `moviles`;
    `Nvidia beats earnings` → sin vertical (sin falso positivo).
- `sources.json` parsea: 8 capas, 169 fuentes, 25 `audio`, 25/25 con `rss`, ids sin duplicados.
- Spot-check propio de feeds delicados con el UA del detector: `what-hifi` (redirect a
  `/feeds.xml`), `hispasonic` (XML servido como `text/html`), `kef` (Atom), `soundguys`,
  `sennheiser`, ASR → todos HTTP 200 y cuerpo XML válido.

## Decisiones y contrapartidas

- Prioridad elegida por la mesa: `audio` › `wearables` › `moviles` › `tutoriales` › hardware.
- **Efectos colaterales conocidos del orden** (documentados para que la mesa decida si ajusta):
  - `Tutoriales` ya no va primero: una guía how-to sobre audio/ponible/móvil cae en esa vertical.
  - `Móviles` (nº 3) gana a hardware: "Snapdragon X Elite laptops" → `Móviles`;
    "Winlator… Android" → `Móviles` (y no `Emuladores`).
  - `Audio` (nº 1) gana a `Portátiles`: una review de portátil que mencione altavoces → `Audio`;
    unas "gafas Ray-Ban con audio" → `Audio` (y no `Wearables`).
  - Se quitó `headset` pelado de audio para no robar visores VR; coste: unos auriculares de
    consola titulados solo "headset" (sin marca) caen en `Consolas`.
- La capa `audio` incluye dos feeds de foro (ASR, Head-Fi) marcados como ruidosos. Se excluyeron
  medios con 403 al UA (Darko.Audio, Sonos, Sony prensa) y feeds muertos.

## Route and trigger evidence

- Route: delegated direct. Investigación de medios delegada a un worker `general` (read-only,
  verificación curl del UA); ediciones de código y JSON inline. Write trigger: `daily-news.mjs`
  + `sources.json` + documentación.
- Verificación: `node --check` + harness de `classify` + `JSON.parse` de `sources.json` +
  spot-check propio de feeds. Sin cambios bajo `src/` de la app, el build de Astro no está afectado.

## Next steps

- [ ] Opcional: ajustar el orden/producto si algún efecto colateral no convence (es un array:
      `VERTICAL_PRIORITY`).
- [ ] Opcional: correr `npm run news` para ver las secciones en el nuevo orden y las fuentes
      nuevas (marca `.seen.json`; correr cuando se quiera usar la ventana).
