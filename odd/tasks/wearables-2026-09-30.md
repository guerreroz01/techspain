# Wearables batch — 2026-09-30

## Objective

Publish the two viable new wearables stories found in the 2026-09-30 scan: the Polar OS 6 firmware rollout and the Facer × Timex watch-face partnership for Wear OS. Each ships as a Spanish master plus its English companion.

## Problem

The daily detector produced 384 candidates, 8 of them in `wearables`. Most were already covered, polls, or opinion pieces, so only the genuinely new stories should be published.

## Why

Wearables is a core vertical and both stories are traceable to a primary announcement, so they are publishable without relay attribution.

## Authorized scope

- Create two Spanish entries under `src/content/news/<slug>/` and their English companions under `src/content/news-en/<english-slug>/`.
- Download the origin's own images into each entry's `assets/`.
- One final build and one index regeneration after both articles exist.
- Do not touch promotion flags: both entries keep `featured: false` and `breaking: false`.

## Candidate filter (2026-09-30 wearables scan)

Included:

1. `polar-os6-actualizacion` — Polar OS 6 rollout — detected via T3, origin **Polar**.
2. `esferas-timex-wear-os` — Facer × Timex faces on Wear OS — detected via Andro4all/La Razón, origin **Facer**.

Excluded:

- Apple Watch Series 12 vs Ultra 4 (Stuff) — duplicate of `ultra-4-series-12-comparativa` (2026-09-27).
- Pixel Watch 5 / Health Guardian / Fitbit Air (Android Police) — duplicate of `pixel-watch-health-guardian-gratis` (2026-09-25).
- "How often do you upgrade your smartwatch?" (Android Authority) — reader poll, not a story.
- Fitbit Air India launch + pricing (9to5Google / Android Central) — same product already covered on 2026-09-25; market-launch angle left for an editorial call.
- Pixel Watch battery tip (Android Police) — opinion/tip piece; belongs in `tutoriales`, not `wearables`.

## Route

- Implementation route: delegated direct.
- Trigger evidence: two non-trivial article writes, each touching its own Spanish and English content folders. One writer per article, no overlapping paths.

## Duplicate check evidence

`npm run find -- OS6` and `npm run find -- Timex` → `sin coincidencias`. The `Polar` and `Fitbit Air` matches reported earlier were incidental (Polar metrics inside the Moto Watch Ultra story), not the same events.

## Tasks

- [x] WR-001 — ES+EN news: Polar OS 6 firmware rollout. ES `polar-os6-actualizacion` / EN `polar-os6-update-custom-button`; 6 origin images; SEO pass applied. Source traced past the T3 relay to Polar's own release notes.
- [x] WR-002 — ES+EN news: Facer × Timex watch faces on Wear OS. ES `esferas-timex-wear-os` / EN `timex-watch-faces-wear-os`; 2 origin images; SEO pass applied. Source traced past the Andro4all/La Razón relay to Facer's own press release; attribution to Facer, not Timex (Facer issues the announcement and develops the app).
- [x] WR-003 — One final `npm run build`. Evidence: 695 pages, no errors.
- [x] WR-004 — Regenerate the published index with `npm run index`. Evidence: 644 published articles.

## Acceptance criteria

- Each story has one Spanish `index.mdx` and one English companion `index.mdx`.
- Spanish entries start `tags` with `Wearables` and keep `featured: false` / `breaking: false`.
- English entries set `translationOf` to the Spanish slug and omit promotion fields.
- Both `source` blocks point at the ultimate origin, not the detected relay.
- Final build passes and the published index is regenerated.

## Verification evidence

- 2/2 ES and 2/2 EN folders exist with `index.mdx` and their own `assets/` (8 images total).
- `npm run build` → 695 pages (691 + 4). `npm run index` → 644 articles. `npm run test:sitemaps` → 7/7 (`sitemap-0.xml` 671 URLs, `news-sitemap.xml` 46 URLs in the 48 h window).
- Attribution verified by the writers from the primary source: Polar release notes (`support.polar.com`, firmware 6.0.18, six compatible models) and the Facer press release (`news.facer.io`).
- Promotion unchanged: `one-ui-9-disponible` remains the only `featured: true`; no `breaking: true`.

## Progress

- 2026-09-30: Ran `npm run news` → 384 candidates, 8 in `wearables`; all 48 wearables sources have RSS, so there is no manual-follow-up gap.
- 2026-09-30: Duplicate verdicts recorded; two stories approved for writing.
- 2026-09-30: Both articles written by parallel writers on branch `feat/wearables-2026-09-30`; neither ran the build.
- 2026-09-30: This document was created at close, after the two writers returned. The batch was small and its scope was already fixed by the approved two-story selection, so it was handled as a direct delegated route; the record is written here for traceability rather than pretence of having preceded the writes.

## Next step

Merge `feat/wearables-2026-09-30` and push, then start the smart-glasses source research the user requested.
