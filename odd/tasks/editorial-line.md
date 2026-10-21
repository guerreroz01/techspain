# Editorial line: reader intent over volume

## Objective

Decide what this portal covers from the evidence already in Search Console, and
make source selection follow that decision instead of volume.

## Evidence

Search Console, 28 days (2026-09-20 → 2026-10-18): 553 clicks, ~28.900 impressions,
CTR 1,9%, average position 10,5.

**Source of the 22 highest-clicking pieces**

| Source | Pieces in top 22 | Type |
| --- | --- | --- |
| GBAtemp | 4 | emulation community |
| SamMobile | 2 | consumer mobile |
| Tech Advisor, CNET, Tom's Hardware, TechRadar, MacRumors, T3, Engadget | 1 each | consumer reviews and media |
| OPPO, Honor, Polar, KytyPS5 | 1 each | primary (the maker itself) |
| the5krunner, Gadgets & Wearables | 1 each | consumer wearables |

Zero of the 22 came from **MyDrivers (70 published), ITHome (43), GizmoChina (24) or
Wccftech (26)** — roughly 160 pieces of China-market hardware and industry news.

**What the winning pieces have in common.** Every one answers cost, availability,
which-to-buy or how-to:

| Piece | CTR | Position |
| --- | --- | --- |
| fitbit-charge-7-launch | 9,4% | 5,1 |
| apple-watch-ultra-2-vs-ultra-4 | 9,0% | 5,4 |
| oppo-find-x10-hasselblad | 11,4% | 4,8 |
| suunto-race-3s | 15,1% | 6,4 |
| disable-apple-intelligence-ios-27 | 5,6% | 8,1 |

## Decision

Three shapes are in scope. Everything else is deprioritised, not banned.

1. **Consumer product launch or leak** with an actionable price or availability.
2. **Comparison or buying guide** — "X vs Y", "cuál elegir".
3. **Verifiable how-to** — disable, configure, fix.

## Changes

- `skills/redaccion-prensa/SKILL.md` — new "Editorial line (evidence-based)" section, a
  `Reader interest` decision gate, and a **Shape playbook** mapping each winning format
  to its structure and its `tags[0]`. Comparisons lead with `Tutoriales` (they are
  buying guides), which is how `apple-watch-ultra-2-vs-ultra-4-guide` — the 9,0% CTR
  piece — is already tagged.
- `scripts/daily-news.mjs` — `readerIntent()` scores each candidate (−6 industry …
  +4 clear intent) and both `scripts/seleccion.md` and the console report sort by it,
  marking `· _baja prioridad_` at ≤ −2. Industry weighs more than a passing price
  mention, so "el precio del DRAM sube" cannot outrank a product deal. `which` was
  narrowed to `which one|which to buy` after it matched forum questions.
- `src/data/sources.json` — four high-volume, zero-yield feeds moved to manual
  (`rss: null`), with the measured reason in `notes`:
  - **MyDrivers** (100 candidates/2 days, 70 pieces published, 0 in top 22)
  - **ITHome** (60 candidates/2 days, 43 pieces published, 0 in top 22)
  - **Head-Fi** (50 forum threads/run, audio recorded no clicks)
  - **DroneXL** (27 candidates/2 days, drones ≈ 50 pieces, no clicks)

  Reversible: restoring the `rss` URL puts a source back in detection.
- `src/data/sources.json` — three feeds verified with the detector's own User-Agent and
  added for the two clusters that convert:
  - **Tom's Guide** (tech-media, 50 items) — buying guides, the best-CTR shape.
  - **ADSLZone** (es-competition, 15 items) — Spanish tutorials.
  - **Wololo.net** (emulacion, 20 items) — homebrew releases, the GBAtemp profile.

  Rejected after testing: Wirecutter (403), Noticias3D and Geeknetic (404), El Androide
  Libre (404), Andro4all and Hipertextual (empty/redirect), Chollometro (1 item).
- `scripts/check-quality.mjs` + `scripts/quality-baseline.json` — mechanical quality
  gate: ≥400 words, description 70–160, `source` name and url, no leading H1. Same
  baseline mechanic as covers, so 331 existing entries do not block work.

## Verified

End-to-end run with the original `.seen.json` preserved and restored afterwards:

| Metric | Before | After |
| --- | --- | --- |
| Candidates (2 days) | 1.602 | 1.365 → 1.430 with the three new feeds |
| Audio candidates | 88 | 62 |
| Drones candidates | ~27 from DroneXL alone | 13 total |
| New feeds producing items | — | Tom's Guide 50, ADSLZone 15, Wololo 2 |

`seleccion.md` now opens each section with deals, comparisons and hands-on pieces —
for example Wearables starts with a MediaMarkt bundle price, "Fitbit Edge vs
Inspire 3" and "Garmin Edge 1060 vs 850 vs 550 – which Edge to buy now".

Quality gate verified: `quality:strict` exits 0 with the baseline, **exits 1** for a
temporary 8-word entry without `source`, and returns to 0 after removing it.

Build: 1296 pages, unchanged.

## Not changed

- Verticals, slugs and the 929 published articles. No page was removed or renamed.
- The classifier (`classify`) still assigns the same verticals; only ordering changed.
- DroneXL is demoted, not deleted: the drones vertical still receives 13 candidates
  from other feeds.
