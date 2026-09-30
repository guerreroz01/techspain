# Sitemap architecture overhaul

## Objective

Deliver a clean, single-source-of-truth sitemap architecture for
`https://www.techspain24.com`:

```
/sitemap-index.xml  -> /sitemap-0.xml
                    -> /news-sitemap.xml
```

All endpoints HTTP 200, valid XML, absolute `https://www.techspain24.com`
URLs, no duplicates, no non-indexable URLs, Google-News-compliant news
sitemap limited to the last 48 h.

## Problem / Why

- The Google News sitemap lives at the non-standard path `/sitemap-news.xml`
  and is NOT referenced by `sitemap-index.xml` (only by `robots.txt`), so the
  index does not describe the full sitemap architecture.
- `/sitemap-0.xml` contains 21 pagination URLs (`/noticias/2/` ...), which
  are listings we do not want to promote.
- `src/pages/sitemap-news.xml.ts` has a documented "demo fallback" that
  publishes the 10 most recent articles when nothing falls inside the 48 h
  window — a direct violation of the Google News 48 h rule.
- The news sitemap ignores the English corpus (`/en/news/...`), which the
  spec requires with `<news:language>en</news:language>`.

Verified-good state that must NOT be regressed: canonical (trailing slash,
www host), mutual ES/EN hreflang with `x-default` -> ES, legal pages
`noindex` + excluded from sitemap (`seo/legal-noindex`), real per-article
`lastmod` from frontmatter, 0 duplicate URLs, 0 host/protocol mix.

## Constraints

- Astro 7 static output + `@astrojs/sitemap` 3.7.4 (already installed).
  Use its existing `filter` / `serialize` / `customSitemaps` options —
  no parallel sitemap system, no new dependencies.
- No slugged/URL/title changes, no content edits, no hardcoded article
  lists, no fake dates, no `changefreq`/`priority`.
- `robots.txt` must keep `Sitemap: .../sitemap-index.xml`; must not gain
  `Disallow` rules (noindex and Disallow are incompatible — see
  `seo/legal-noindex`).
- Documentation (`AGENTS.md` sections 9/10) must move with behavior.

## Route declaration

| ID | Task | Route | Status |
| --- | --- | --- | --- |
| T1 | Point `sitemap-index.xml` at the news sitemap via `customSitemaps` | delegated (`general`) | done |
| T2 | Exclude pagination `/noticias/N/` from the general sitemap | delegated (`general`) | done |
| T3 | Rename endpoint to `/news-sitemap.xml`; drop 48 h fallback; add EN articles with `news:language=en` | delegated (`general`) + inline follow-up | done |
| T4 | Update `public/robots.txt` (index line + new news URL) | delegated (`general`) | done |
| T5 | Dependency-free validator `scripts/validate-sitemaps.mjs` + npm script | delegated (`general`) | done |
| T6 | Update `AGENTS.md` §3/§5/§9/§10/§14 to match new behavior | delegated (`general`) + inline follow-up | done |
| T7 | `npm run build` + validate locally (XML, dups, 48 h window, escaping, content-type) | inline | done |
| T8 | Work-unit commit + RDD `review assess` on the commit | inline | pending |

Delegation note: the mandated `explore` mapper failed first with a provider
error ("OpenCode's free tier can only be used from within OpenCode"), so the
mapping pass ran inline (4 files read: `astro.config.mjs`, `robots.txt`,
`sitemap-news.xml.ts`, `package.json` + targeted greps). The writer for T1–T6
did run as one `general` task.

Follow-up fixes applied inline after reviewing the writer's diff:

- `news-sitemap.xml.ts` now mirrors the production visibility rule of
  `en/news/[slug].astro`: an English companion is skipped while its
  `translationOf` target is a draft, so the feed can never advertise a URL
  that the build does not generate.
- 301 redirect `/sitemap-news.xml` -> `/news-sitemap.xml` added via
  `redirects` in `astro.config.mjs` (verified present in
  `.vercel/output/config.json` before `handle: filesystem`).
- Stale `sitemap-news` comment in `src/content.config.ts` corrected; AGENTS.md
  gained the validator row and the 301 note.

## Scope

- In: `astro.config.mjs`, `src/pages/news-sitemap.xml.ts` (renamed),
  `public/robots.txt`, `scripts/validate-sitemaps.mjs`, `package.json`
  (script entry), `AGENTS.md`.
- Out: hreflang/canonical system (verified correct), legal-page policy,
  article content, `dist/`, sitemap chunking (auto-handled at 50k by the
  integration).

## Acceptance criteria

- [x] `dist/sitemap-index.xml` lists `sitemap-0.xml` AND `news-sitemap.xml`.
- [x] `dist/sitemap-0.xml`: absolute www URLs only, 0 dups, no
      `/noticias/N/` pagination, no legal pages, real `lastmod`.
- [x] `dist/news-sitemap.xml`: only articles with `pubDate` inside 48 h,
      correct `news:` namespaces, `news:name` = TechSpain24, language
      `es`/`en` per entry, escaped XML (proved end-to-end with a temporary
      fixture title containing `& < > " ' á é ñ`, then removed).
- [x] `public/robots.txt` references `/sitemap-index.xml` and the new
      `/news-sitemap.xml`; no obsolete `/sitemap.xml` reference; no
      `Disallow`.
- [x] `node scripts/validate-sitemaps.mjs` passes against `dist/` (7/7).
- [x] No public route broken; `npm run build` passes (673 pages).
- [x] Static serve of `dist/`: all three sitemap endpoints 200 +
      `application/xml`, `robots.txt` 200 + `text/plain`;
      `/sitemap.xml` never existed (404 before and after).

## Progress

- [x] Exploration + memory audit (framework, endpoints, canonical,
      hreflang, test infra: none, `/sitemap.xml`: does not exist).
- [x] T1..T7
- [ ] T8 (work-unit commit + RDD assess)
