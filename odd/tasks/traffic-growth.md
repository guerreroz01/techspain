# Traffic growth: US + Spain

Refocus: AdSense is not verified yet, so ads are parked. The goal is qualified
traffic in both markets. The slot registry shipped earlier stays as-is (inert until
ids exist) and is not the priority now.

## Objective

Lift qualified organic traffic in Spain and the United States using the two channels
a young news domain can realistically win — Google Discover and the long tail it
already ranks for — without renaming indexed URLs or inflating volume.

## Baseline (GSC, 28 days: 2026-09-20 → 2026-10-18)

- 553 clicks / ~28.900 impressions / CTR 1,9% / avg position ~10,5.
- Countries: Spain 274 clicks (3,9% CTR, pos 12,5), Mexico 57, US 24 (0,8% CTR,
  pos 10,5), Chile 19, Colombia 11.
- Corpus: 929 ES / 308 EN articles, median 657 words, zero duplicate titles or
  descriptions, zero drafts. Content is thinner than ideal but not spam-thin.
- 94 EN slugs (31%) exceed 60 characters; worst is 107.

## Diagnosis

1. **Discover was structurally blocked.** No page emitted `max-image-preview:large`,
   which Google requires for the large card. With no domain authority, Discover is
   the fastest surface a news site can win.
2. **English URLs were unsearchable.** The translation prompt asked for a slug
   "derived from the English title", producing whole-sentence slugs. A slug that is
   a translated sentence cannot match a query.
3. **US demand leaks into Spanish pages.** English queries rank Spanish articles
   (e.g. `force quit windows pc`, 298 impressions, 0 clicks) because the EN library
   covers only a third of the Spanish one.
4. Volume is not the lever: 30 articles/day on a one-month domain correlates with
   positions 8–15, not with clicks.

## Tasks

- [x] T1 — `<meta name="robots" content="index, follow, max-image-preview:large">` on every indexable page; `noindex, follow` kept on legal. Verified: 1293 pages with the directive, 3 legal excluded.
- [x] T2 — `translate-en.mjs`: prompt requests a 3–6 word, ≤55-char searchable slug and forbids a leading H1 in the body; `shortSlug()` enforces the cap. Verified: 107 → 52 chars, short slugs untouched.
- [x] T3 — IndexNow key `b5d6e37d793d4ae8bee2b35c5925c68a` written to `public/`. Submission pending deploy.
- [x] T4 — 56 EN bodies started with a duplicate `# H1`; stripped. Verified: 1 `<h1>` per page.
- [x] T5 — Concise `<title>` derived from the headline (`serpTitle`), `<h1>` and OG untouched. Verified: 1155 → 126 pages over 60 chars (most of the rest are HTML-entity artefacts), max 138 → 73.
- [x] T6 — 10 internal links pointed at five non-existent vertical-nested URLs. Rewritten at source **and** kept as 301s in `astro.config.mjs` for external inbound. Verified: 0 broken internal links.
- [x] T7 — After deploy: IndexNow submitted for 55 URLs (26 recent news, home, 22 hubs, 5 redirected). Key file live (HTTP 200).
- [x] T8 — Meta descriptions: 291 of 1237 exceeded 160 chars (max 316). `serpDescription()` trims the `<meta name="description">` only; frontmatter and Open Graph keep the full text. Verified: 9 pages over 160 (max 168).
- [x] T9 — Section navigation: no page linked to a vertical hub except an article's own breadcrumb and the sitemap. The footer now lists all eleven sections site-wide, with ES/EN labels and the matching path prefix.
- [x] T10 — Verified hreflang is correct and mutual (es/en/x-default → ES) and absent when there is no companion. 308 of 929 ES articles have a pair.
- [x] T11 — Cover discovery added: `scripts/check-covers.mjs` reads image headers (JPEG/PNG/WebP/GIF/AVIF, no library), reports every entry under 1200px, and fails only on entries absent from `scripts/cover-baseline.json`. Wired as `npm run covers` / `npm run covers:strict`, documented in `AGENTS.md`, `SKILL.md` and `DELEGATION.md`. Current debt: 354 of 1237 baselined, 19 without cover. Re-sourcing those covers is still manual.
- [ ] T12 — 621 ES articles have no EN companion. Do not blanket-translate; publish EN for US-intent stories only.
- [ ] T13 — 126 `<title>` still exceed 60 raw characters; most are HTML-entity inflation (`&quot;` counts 6, renders 1). Recheck after the next deploy with decoded entities.

## Findings that changed the diagnosis

- Headlines are written as summaries: ES median 84 chars, 889/929 over 60, 291 over 90, max 138. This is the dominant CTR constraint, more than position.
- Corpus quality is better than assumed: median 657 words, zero duplicate titles/descriptions, zero drafts. The problem is not thin content.
- Covers: 864/1218 (71%) already qualify for Discover; the earlier "1,856 images under 1200px" figure counted inline body images and was wrong.

## Acceptance criteria

- Every indexable page carries the large-preview directive.
- No new EN slug exceeds 55 characters unless `--en` forced it.
- IndexNow submissions return success for `www.techspain24.com` after deploy.
- Covers of the 20 priority articles are ≥1200px wide.

## Constraints

- Never rename or move an indexed slug.
- No bulk deletion of verticals or articles.
- No new runtime dependency for the slug guard.
