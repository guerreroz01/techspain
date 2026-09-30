# Tutoriales evergreen — 2026-09-30

## Objective

Publish the reusable tutorial candidates from the 2026-09-30 editorial scan, excluding one-off preorder/service items and temporary bug workarounds.

## Problem

The daily detector found tutorial candidates, but the site should only publish items that remain useful beyond the news cycle.

## Why

Evergreen tutorials build long-term search value and avoid filling the portal with short-lived service pieces.

## Authorized scope

- Create Spanish tutorial entries under `src/content/news/<slug>/`.
- Create mandatory English companions under `src/content/news-en/<english-slug>/`.
- Download local article images into each entry's `assets/` folder when available from the origin.
- Run one final build and regenerate the published index after all articles are written.
- Do not alter unrelated source code, existing published slugs, or promotion flags beyond leaving `featured: false` and `breaking: false` on new entries.

## Route

- Implementation route: delegated direct.
- Trigger evidence: nine non-trivial article writes, each touching separate Spanish and English content folders. One writer per article, no overlapping paths.

## Candidate filter

Included as evergreen:

1. `limpiar-pantalla-televisor-sin-danarla` — El Output — https://eloutput.com/noticias/general/como-limpiar-la-pantalla-de-tu-televisor-sin-riesgo-de-danarla/
2. `preparar-samsung-galaxy-one-ui-9` — Engadget — https://www.engadget.com/2271451/prepare-samsung-galaxy-one-ui-9-update/
3. `usar-controles-parentales-ios-27` — MacRumors — https://www.macrumors.com/2026/09/29/apple-ios-27-parental-control-guide/
4. `instalar-actualizacion-windows-11-2026` — Windows Blog — https://blogs.windows.com/windowsexperience/2026/09/29/how-to-get-windows-11-2026-update/
5. `difuminar-informacion-sensible-google-photos` — Android Police — https://www.androidpolice.com/google-photos-redact-blur-pixelate-tool-markup/
6. `reducir-espacio-fotos-videos-movil` — Xataka — https://www.xataka.com/basics/como-hacer-que-fotos-videos-tu-movil-ocupen-espacio-perder-calidad-forma-notable
7. `reasignar-tecla-copilot-windows` — Windows Central — https://www.windowscentral.com/artificial-intelligence/microsoft-copilot/the-copilot-pc-brand-is-dead-heres-how-to-reclaim-and-remap-the-copilot-key
8. `activar-multi-frame-gen-rtx-40` — PC Gamer — https://www.pcgamer.com/hardware/graphics-cards/how-to-get-unlocked-multi-frame-gen-working-on-an-rtx-40-series-graphics-card/
9. `recuperar-barra-volumen-pantalla-bloqueo-iphone` — CNET — https://www.cnet.com/tech/services-and-software/is-your-iphone-lock-screen-missing-the-volume-bar-heres-how-to-bring-it-back/

Excluded:

- iPhone Duo preorder headstart — preorder/service item, not evergreen enough.
- Google Photos edit/share bug bypass — temporary bug workaround.

## Duplicate check evidence

All included candidates returned `sin coincidencias` through `npm run find` on distinctive terms before delegation.

## Tasks

- [x] TUT-001 — ES+EN tutorial: clean a TV screen safely. ES `limpiar-pantalla-televisor-sin-danarla` / EN `clean-tv-screen-without-damaging-it`; 5 local images; SEO pass applied (description, internal link, image paths).
- [x] TUT-002 — ES+EN tutorial: prepare a Samsung Galaxy for One UI 9. ES `preparar-samsung-galaxy-one-ui-9` / EN `prepare-samsung-galaxy-one-ui-9-update`; 3 images; SEO pass applied (description 154 chars, `draft: false`, internal link to `/noticias/one-ui-9-disponible/`).
- [x] TUT-003 — ES+EN tutorial: iOS 27 parental controls. ES `usar-controles-parentales-ios-27` / EN `how-to-set-up-parental-controls-ios-27`; 1 image; SEO pass applied. Source corrected from the MacRumors relay to the ultimate origin (Apple guide, see Progress).
- [x] TUT-004 — ES+EN tutorial: install the Windows 11 2026 Update. ES `instalar-actualizacion-windows-11-2026` / EN `how-to-install-windows-11-2026-update`; 1 image; SEO pass applied. Guide limited to the steps the original actually states (enablement package via Windows Update).
- [x] TUT-005 — ES+EN tutorial: blur sensitive info in Google Photos. ES `difuminar-informacion-sensible-google-photos` / EN `blur-pixelate-sensitive-info-google-photos`; 4 images; SEO pass applied (subheading keyword, internal link).
- [x] TUT-006 — ES+EN tutorial: reduce mobile photo/video storage. ES `reducir-espacio-fotos-videos-movil` / EN `make-phone-photos-videos-take-less-space`; 1 image; SEO pass applied (`coverAlt`, internal link).
- [x] TUT-007 — ES+EN tutorial: remap the Copilot key. ES `reasignar-tecla-copilot-windows` / EN `remap-copilot-key-windows`; 2 images; SEO pass reported no mandatory fixes.
- [x] TUT-008 — ES+EN tutorial: unlocked Multi Frame Gen on RTX 40-series. ES `activar-multi-frame-gen-rtx-40` / EN `unlock-multi-frame-gen-rtx-40`; 6 images; SEO pass applied (description, internal link).
- [x] TUT-009 — ES+EN tutorial: restore the iPhone lock-screen volume bar. ES `recuperar-barra-volumen-pantalla-bloqueo-iphone` / EN `restore-volume-bar-iphone-lock-screen`; 3 images; SEO pass applied (description, keyword in opening, internal link).
- [x] TUT-010 — Run one final `npm run build`. Evidence: 691 pages built, no errors (673 + 18 = 9 ES + 9 EN).
- [x] TUT-011 — Regenerate the published index with `npm run index`. Evidence: 642 published articles (was 633).

## Acceptance criteria

- Every included tutorial has one Spanish `index.mdx` and one English companion `index.mdx`.
- Spanish entries use `tags: ['Tutoriales', ...]`, `featured: false`, and `breaking: false`.
- English entries set `translationOf` to the Spanish slug and do not include Spanish-only promotion fields.
- Final build passes.
- `scripts/articulos-publicados.md` is regenerated after the batch.

## Verification evidence

- 9/9 ES folders and 9/9 EN folders exist, each with `index.mdx` and its own `assets/` (30 images total).
- Every ES entry starts `tags` with `Tutoriales` and carries `featured: false` + `breaking: false`; every EN entry carries `translationOf` pointing at its resolved Spanish slug and no `featured`/`breaking`.
- `npm run build` → 691 pages, no errors. Spot-checked rendered output for `/noticias/limpiar-pantalla-televisor-sin-danarla/`, `/noticias/activar-multi-frame-gen-rtx-40/`, `/en/news/unlock-multi-frame-gen-rtx-40/`, `/en/news/clean-tv-screen-without-damaging-it/`.
- `npm run test:sitemaps` → 7/7 checks pass; `sitemap-0.xml` 667 URLs, `news-sitemap.xml` 42 URLs inside the 48 h window (the new entries carry today's `pubDate`).
- `npm run index` → 642 published articles.
- Promotion unchanged: exactly one entry has `featured: true` (`one-ui-9-disponible`); no `breaking: true` anywhere. Authorized scope forbids touching promotion flags this batch.

## Progress

- 2026-09-30: Plan created; batch authorized as a delegated-direct route with one writer per tutorial.
- 2026-09-30: Batch resumed from `main@4c924f6` on branch `feat/tutoriales-evergreen-2026-09-30`; all 9 Spanish slugs verified free with `npm run slug`.
- 2026-09-30: Nine writers ran in parallel; each produced the ES master plus the EN companion, downloaded images, ran the ES-only SEO pass, and did not run the build.
- 2026-09-30: TUT-003 attribution corrected by the orchestrator. The brief named MacRumors as the source, but MacRumors is a relay: its own text states Apple "shared a guide" developed with the AAP. Per AGENTS.md §7 and SKILL.md ("attribute the ultimate origin, not the relay"), `source` now points to Apple (`https://support.apple.com/guide/aap-apple/welcome/web`, verified HTTP 200) in both the ES and EN entries. This was an orchestrator brief error, not a writer error.
- 2026-09-30: Final build + index + sitemap validation ran once by the orchestrator, after all writers returned.

## RDD outcome

- Work-unit commit: `635234f` on `feat/tutoriales-evergreen-2026-09-30` (from `main@4c924f6`).
- `review assess` → risk **high** (`hot_path`: the substring "update" in the image path `how-to-install-windows-11-2026-update/assets/cover.jpg`), `review_due=true`, 72 files / 1379 changed lines.
- `review start` (relay) returned consent v3; the user chose **declined** (`declined_this_candidate`, target `sha256:60742d89…`). No review record was created, no lenses ran, and delivery continues under ordinary repository policy.
- This outcome note is a docs-only follow-up, not a new work unit: `assess` is deliberately not re-run for it, because the declined candidate was still the tip of the branch and re-assessing would re-prompt consent for the same range that was already decided.

## Next step

Merge `feat/tutoriales-evergreen-2026-09-30` into `main` and push `main` (which then also carries the two pending sitemap commits).
