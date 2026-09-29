# Feature: English article versions

## Objective

Every article published from now on also gets an English version at its own fully
English URL, shown to English-speaking readers. Already-published articles stay
Spanish-only, untouched.

## Why

The editorial line today is Spanish-only. English versions at native URLs open the
site to English-speaking readers and to international search traffic (hreflang),
without converting the whole portal into a bilingual site.

## Settled product decisions

- **Scope: articles only.** No English home, archive, RSS, Google News sitemap,
  search index, or legal pages.
- **Future articles only.** No backfill. The design makes old articles unaffected
  by construction (they simply have no English counterpart).
- **Translation: same writer, one pass.** The redaction subagent that writes the
  Spanish piece writes the English piece in the same run (chosen over a separate
  LLM script and over manual translation).
- **Fully English URL.** `/en/news/<english-slug>/` with a translated slug —
  like a brand-new URL, not a Spanish slug under an `/en/` prefix.

## Design

- **New collection `news-en`** (`src/content/news-en/<slug-en>/index.mdx`) with a
  required `translationOf: <slug-es>` frontmatter field. Separate collection, not a
  locale field: every existing consumer of `news` (home, archive, RSS,
  `buscar.json`, `sitemap-news`, `articulos-publicados`, the sitemap date reader)
  keeps working with zero changes and can never leak an English article.
- **New route** `/en/news/<slug-en>/` — article page with `lang="en"`, `en-US`
  dates, JSON-LD `inLanguage: "en"`, English UI strings, English JSON-LD type
  check (`tags[0] === 'Tutorials'`).
- **Mutual hreflang**: ES article emits `hreflang="es"` + `hreflang="en"` (+`x-default`)
  only when an English counterpart exists; EN article always emits the pair.
  Canonical stays self-referencing on both. A visible "Read in English" link on
  the ES article when a counterpart exists.
- **Recommendations** on the EN page draw from the English pool only; blocks render
  only when non-empty (the English corpus starts tiny).
- **Sitemap**: `/en/news/<slug>/` URLs are included automatically; the date-reader
  in `astro.config.mjs` learns the EN folder so `lastmod` works.
- **Workflow**: the writer creates both folders in one pass, picks the English
  slug, copies the cover into the EN folder's `assets/`, and the orchestrator
  validates slug availability for both collections via `npm run slug`.
- **Build-time validation**: the EN route fails the build if `translationOf`
  points to a missing or draft Spanish entry.

## Scope

**In:**
1. `src/content.config.ts` — `news-en` collection.
2. `src/layouts/BaseLayout.astro` — `lang` / `og:locale` props (defaults unchanged).
3. `src/pages/en/news/[slug].astro` — new English article route.
4. `src/pages/noticias/[slug].astro` — hreflang + visible link when EN exists;
   extract shared related/random scoring to `src/lib/related.ts` so both routes
   share one algorithm.
5. `astro.config.mjs` — sitemap `lastmod` for EN articles.
6. `scripts/slug-check.mjs` — availability check for EN slugs.
7. `skills/redaccion-prensa/SKILL.md` + `DELEGATION.md` — two-version workflow.
8. `AGENTS.md` — document the EN flow.

**Out:** backfill; English home/archive/RSS/sitemap-news/search; language switcher
beyond the single article link; translation QA tooling; SEO pass on EN articles.

## Constraints

- Static output, near-zero client JS: no new client scripts (hreflang/links are
  server-rendered).
- No new dependencies, no CSS framework; design tokens only.
- The Spanish site's observable behavior must not change for articles without an
  English counterpart.
- Published Spanish slugs are never renamed.

## Tasks

- [x] T1 — Add `news-en` collection + schema (`translationOf` required) to `src/content.config.ts`.
- [x] T2 — `BaseLayout`: optional `lang` and `og:locale` props, defaults = current values.
- [x] T3 — Extract related/random scoring from `src/pages/noticias/[slug].astro` into `src/lib/related.ts`; ES route behavior unchanged.
- [x] T4 — New route `src/pages/en/news/[slug].astro` (English UI, `hreflang`, EN pool, build-time `translationOf` validation).
- [x] T5 — ES route: hreflang pair + "Read in English" link when EN exists.
- [x] T6 — `astro.config.mjs`: read EN dates for sitemap `lastmod`.
- [x] T7 — `scripts/slug-check.mjs`: check both collections.
- [x] T8 — Editorial workflow docs (`SKILL.md`, `DELEGATION.md`): writer produces ES + EN, EN slug rules, cover copy, no build.
- [x] T9 — Update `AGENTS.md` (file map, content model, routes, workflow).
- [x] T10 — Verify: `npm run build`; check dist for `/en/news/<slug>/`, mutual hreflang, sitemap entries, and that a pre-existing article renders unchanged.

## Acceptance criteria

1. A new Spanish article paired with an English one builds both pages; the ES page
   links to the EN page and both declare each other via `hreflang`.
2. An article with no EN counterpart builds exactly as today (byte-comparable HTML
   apart from unrelated churn).
3. `dist/sitemap-0.xml` includes `/en/news/<slug>/` entries with `lastmod`.
4. `sitemap-news.xml`, `/rss.xml`, `/buscar.json`, home and archive contain zero
   `/en/` URLs.
5. `translationOf` pointing to a non-existent ES entry fails `npm run build`.
6. `npm run slug -- <slug>` answers availability for both collections.

## Route declaration

Inline (direct). Delegation attempted first (4-file rule); subagent launches are
blocked this session by the provider ("OpenCode's free tier can only be used from
within OpenCode"), disclosed to the user. Fallback: bounded inline execution.

## Delivery

- `delivery_strategy`: `ask-on-risk` (default; session preflight not established).
- Authored-line forecast at creation: **~500** (EN route ~280, shared-lib extraction
  ~100, schema/layout/config ~60, workflow docs + AGENTS.md ~120) → **over the
  400-line PR budget**, so the ask-on-risk decision was raised before the first
  commit.
- Decision: **one PR with maintainer-approved `size:exception`** (user chose a single
  PR over chaining).

## Progress

**Complete (T1–T10).** Implemented inline (delegation blocked by provider, disclosed).

- T1 `src/content.config.ts`: `newsEn` collection (`./src/content/news-en`,
  `translationOf` required, no `featured`/`breaking`, English byline default
  `'TechSpain24 Staff'`) + `src/content/news-en/.gitkeep`.
- T2 `src/layouts/BaseLayout.astro`: `lang` (default `SITE.lang`) and `ogLocale`
  (default `es_ES`) props wired to `<html lang>` / `og:locale`.
- T3 `src/lib/related.ts`: shared `computeStats` / `relatedFor` / `randomFor`
  over a structural `ArticleLike`; ES route refactored onto it, behavior identical.
- T4 `src/pages/en/news/[slug].astro`: build-time `translationOf` resolution
  (throws on missing), prod hide when EN or its ES counterpart is `draft`,
  English UI/JSON-LD (`inLanguage: "en"`), mutual hreflang (`es`, `en`,
  `x-default` → ES), StoryList `basePath="/en/news/" locale="en-US"`,
  recommendations from the `newsEn` pool only, "← Back to TechSpain24" link.
- T5 `src/pages/noticias/[slug].astro`: `enId` lookup via `translationOf`,
  conditional hreflang + visible "Este artículo también está disponible en
  inglés → Leer en inglés" link + `.article__lang` styles.
- T6 `astro.config.mjs`: `entryDatesEn` → `lastmod` for `/en/news/<slug>/`;
  `newestEntryDate` remains ES-only.
- T7 `scripts/slug-check.mjs`: `--en` flag checks `NEWS_EN_DIR`.
- T8 `skills/redaccion-prensa/SKILL.md` + `DELEGATION.md`: mandatory EN companion
  in the same writer pass, EN slug rules, cover copy, EN slug in the delegation
  report.
- T9 `AGENTS.md`: §1 companion bullet, §2 language-rules exception, §5 file map
  (`news-en/`, `src/lib/related.ts`, `en/news/` route, `odd/tasks/`), §6 `newsEn`
  subsection + frontmatter note, §7 new step 5 (companion), §9 route row,
  §10 language/hreflang bullet, §14 stale data-store gotcha + shared
  recommendations bullet, §16 skill/index/delegation/slug-`--en` updates.
- T10 Verification (build 648 pages, exit 0): `lang="en"` + canonical EN +
  `og:locale=en_US` + `inLanguage:"en"` on EN page; mutual hreflang on both
  pages; unpaired ES emits no hreflang; `translationOf` to a missing entry fails
  the build (negative test); sitemap EN entry with `lastmod`; zero `/en/` URLs
  in RSS/`sitemap-news`/`buscar.json`/home/archive; `npm run slug -- --en` and
  `--count` work; a stale `node_modules/.astro/data-store.json` gotcha hit and
  fixed (`rm -rf .astro node_modules/.astro/data-store.json`).

Acceptance criteria 1–6: verified in T10 (criterion 2 holds by construction — no
`news` consumer changed in behavior).
