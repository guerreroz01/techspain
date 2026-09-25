# Publicación de artículos pendientes — 2026-09-25

## Objective

Publish the pending articles from `scripts/seleccion.md` that are not already published, excluding the `Tarjetas gráficas`, `Portátiles`, and `Componentes` sections.

## Scope

- Source list: `scripts/seleccion.md`.
- Duplicate baseline: exact `source.url` values already present in `src/content/news/*/index.mdx`, checked without listing the articles directory in chat context.
- Excluded sections: `🎮 Tarjetas gráficas`, `💻 Portátiles`, `🔧 Componentes`.
- Remaining workload: 138 unique article candidates.
- Execution shape: batches of 10 parallel `general` writer agents, one article per agent, isolated by slug folder.

## Constraints

- Article body and user-facing copy: Spanish, neutral/professional register.
- Code/metadata keys: English.
- Slugs: Spanish headline-derived, kebab-case, lowercase ASCII, no accents.
- Each writer must run `npm run find -- <distinctive terms>` before writing and stop if any match appears.
- Each writer must run `npm run slug -- <slug>` before creating the folder.
- Each writer leaves `featured: false` and `breaking: false`.
- **Cover rule:** `cover` uses the `image()` helper, which resolves relative to the entry folder AND rejects SVG. `cover: './assets/cover.jpg|png|webp'` only, raster format. Two forbidden shapes:
  - `/covers/*.svg` (absolute public path) → `[ImageNotFound]`.
  - `./assets/*.svg` (colocated SVG) → `UnsupportedImageFormat: SVG image processing is disabled`.
- The orchestrator runs one final build and regenerates `scripts/articulos-publicados.md` after all successful article writes.

## Batch checklist

- [x] Batch 01 — 10 agents launched; 6 articles created, 4 stopped as duplicates
- [~] Batch 02 — 4 articles created but never recorded (honor-magic9, pixel-weather, rediseno-widget-pixel-vips, pixel-fallos-control-volumen); 6 candidates either stopped as duplicates or never completed
- [ ] Batch 03 — candidates 021–030
- [ ] Batch 04 — candidates 031–040
- [ ] Batch 05 — candidates 041–050
- [ ] Batch 06 — candidates 051–060
- [ ] Batch 07 — candidates 061–070
- [ ] Batch 08 — candidates 071–080
- [ ] Batch 09 — candidates 081–090
- [ ] Batch 10 — candidates 091–100
- [ ] Batch 11 — candidates 101–110
- [ ] Batch 12 — candidates 111–120
- [ ] Batch 13 — candidates 121–130
- [ ] Batch 14 — candidates 131–138

## Repair tasks (R1–R13)

- [x] **R1** — Root cause fixed in `AGENTS.md` line 155: template `cover: '/covers/ia.svg'` → `./assets/cover.jpg`.
- [x] **R2** — `assassins-creed-hexe-switch-2-oferta-empleo-ubisoft` — real cover (Ubisoft, 128 KB jpg). *(duplicate of `assassins-creed-hexe-switch-2-oferta-empleo`)*
- [x] **R3** — `control-resonant-steamos-sin-soporte-steam-deck` — real cover (GamingOnLinux og:image, 76 KB jpg)
- [x] **R4** — `fallen-tear-the-ascension-llegara-nintendo-switch-2-2027` — real cover (Nintenderos, 100 KB jpg). *(duplicate of `juegos-switch-2-fechas-fallen-tear`)*
- [x] **R5** — `honor-magic9-precio-decimo-aniversario` — real cover (GSMArena, 444 KB jpg)
- [x] **R6** — `pixel-fallos-control-volumen-bluetooth-android-17-qpr1` — real cover (Android Authority, 268 KB jpg)
- [x] **R7** — `pixel-weather-boton-actualizacion-widget` — real cover (9to5Google, 72 KB jpg)
- [x] **R8** — `rediseno-widget-pixel-vips-empieza-desplegarse` — real cover (9to5Google, 40 KB jpg)
- [x] **R9** — `reestructuracion-xbox-refuerza-activision-bethesda` — real cover (Substack, PNG 4.1 MB recompressed to 432 KB jpg at 1600 px)
- [x] **R10** — `shadps4-prepara-version-0-18-1-cambios-emulacion-ps4` — real cover (GitHub og:image, 80 KB png)
- [x] **R11 — second blocker found and fixed** — `coste-obleas-1b-dram-supera-tsmc-n2` used `./assets/cover.svg`; SVG covers are rejected by `image()` even when colocated. Rasterized with `rsvg-convert` to 1600×900 `cover.png` (12 KB) and removed the `.svg`.
- [x] **R12** — Single `npm run build`: green, 548 pages.
- [x] **R13** — `npm run index`: regenerated at 524 articles, all 11 pending entries included.
- [ ] **R14** — Commit (pending explicit user authorization; repo convention commits batches to `main`).

## Open decisions

- Duplicates: `assassins-creed-hexe-switch-2-oferta-empleo-ubisoft` duplicates `assassins-creed-hexe-switch-2-oferta-empleo`, and `fallen-tear-the-ascension-llegara-nintendo-switch-2-2027` duplicates `juegos-switch-2-fechas-fallen-tear` (both committed in `01bbf65`). Delete or keep? Not authorized — nothing deleted.
- `dolphin-progress-report-2609` has an inline body SVG (`./assets/cmake-logo.svg`), committed since `2d1f732`. Verified NOT a blocker: markdown inline SVG is passed through; only the `cover` field's `image()` rejects SVG.

## Route and trigger evidence

- Route: **delegated direct** (no SDD). Write trigger fired: 9 non-trivial files → one bounded writer per file, isolated by folder.
- Orchestrator inline: R1 (single mechanical file) and R11 (image conversion on 2 files).
- Orchestrator only: R12, R13 (single build / generated index).
- Not in scope: SEO pre-publication pass on these articles, body rewrites, `featured`/`breaking` changes. Site still has exactly one `featured` (`rtx-5090-dlss5-connector-91c`).

## Progress evidence

- Created: 2026-09-25.
- Batch 01 completed: 6 articles created, 4 stopped as duplicates.
- Diagnosis: build failed on `/covers/software.svg`; root cause traced to the AGENTS.md template, which contradicted lines 138 and 286 of the same file.
- Repair: 9 delegated writers all returned real covers, no fallback used. `npm run build` green (548 pages). `npm run index` at 524.
