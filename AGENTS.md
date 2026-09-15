# AGENTS.md

Operating guide for AI agents working in this repository.

## 1. What this project is

A **Spanish-language technology news portal** built with **Astro** and deployed to **Vercel**.

- Single editorial line: technology news. **No sections, no categories, no tag pages.**
- Static output by default (fastest). SSR is available per-route if ever needed.
- Near-zero client JavaScript: two tiny inline scripts (theme init + theme toggle) plus the Vercel Web Analytics component (see section 11).
- Ad-ready (Google AdSense) but **ads are disabled by default**.
- Styling is a **token-based design system** — see section 8.

## 2. Language rules

- **Code**: identifiers, folder names, collection names, variable names, and comments are **English**.
- **User-facing copy and content**: **Spanish** (neutral/professional register, no slang).
- This split is intentional. Do not translate identifiers to Spanish, and do not write article copy in English.

## 3. Commands

| Task | Command |
| --- | --- |
| Dev server (background) | `astro dev --background` |
| Stop / status / logs | `astro dev stop` / `astro dev status` / `astro dev logs` |
| Build | `npm run build` |
| Preview a build | `npm run preview` |

- The dev server runs at **http://localhost:4321/**.
- **Always start the dev server in background mode.** Do not run it in the foreground.
- Node `>=22.12.0` is required (see `package.json` engines).

## 4. Stack

| Piece | Version / package | Notes |
| --- | --- | --- |
| Framework | `astro` ^7.3.2 | Static output |
| Language | TypeScript (strict) | `tsconfig.json` extends `astro/tsconfigs/strict` |
| Deploy adapter | `@astrojs/vercel` | Installed; output stays `static` |
| Analytics | `@vercel/analytics` | Web Analytics component in `BaseLayout`; enabled in the Vercel dashboard |
| Sitemap | `@astrojs/sitemap` | Emits `sitemap-index.xml` + `sitemap-0.xml` |
| MDX | `@astrojs/mdx` | Articles can be `.mdx` |
| RSS | `@astrojs/rss` | `src/pages/rss.xml.js` |
| CSS | None (no framework) | Pure CSS + design tokens |
| UI framework | None | No React/Vue/Svelte |

## 5. Project index (file map)

```
blog/
├── AGENTS.md                     # this file
├── CLAUDE.md                     # scaffolder-generated (Claude Code)
├── README.md
├── astro.config.mjs              # site URL, Vercel adapter, sitemap + mdx
├── package.json                  # scripts + deps
├── tsconfig.json
├── public/                       # served as-is at the site root
│   ├── covers/                   # local SVG article covers
│   │   ├── chips.svg
│   │   ├── ia.svg
│   │   └── software.svg
│   ├── favicon.ico
│   ├── favicon.svg
│   └── robots.txt                # references both sitemaps (placeholder domain)
└── src/
    ├── components/
    │   ├── AdSlot.astro          # ad unit; inert unless ADS.enabled
    │   ├── Footer.astro
    │   ├── Header.astro          # site title + nav + theme toggle
    │   ├── LeadStory.astro       # home lead story + secondary stories
    │   ├── NewsCard.astro        # list item in "Últimas noticias"
    │   ├── StoryCard.astro       # compact secondary story card
    │   └── ThemeToggle.astro     # light/dark toggle (inline script)
    ├── content/
    │   └── news/                 # ← ALL ARTICLES LIVE HERE
    │       ├── chips-3nm.mdx
    │       ├── modelo-razonamiento.mdx
    │       ├── regulacion-ia.mdx
    │       └── software-actualizacion.mdx
    ├── content.config.ts         # `news` collection: loader + schema
    ├── consts.ts                 # SITE, NAV, SOCIAL, ADS
    ├── env.d.ts                  # astro/client types
    ├── layouts/
    │   └── BaseLayout.astro      # html shell, SEO, head slot, theme init
    ├── pages/
    │   ├── acerca.astro          # /acerca
    │   ├── index.astro           # / (home)
    │   ├── noticias/
    │   │   ├── index.astro       # /noticias/ (full archive)
    │   │   └── [slug].astro      # /noticias/<slug>/ (article)
    │   ├── rss.xml.js            # /rss.xml
    │   └── sitemap-news.xml.ts   # /sitemap-news.xml (Google News)
    └── styles/
        ├── global.css            # reset, base, .container, .prose
        └── tokens.css            # ← DESIGN SYSTEM SOURCE OF TRUTH
```

## 6. Content model

Collection name: **`news`** · Folder: **`src/content/news/`** · Loader: `glob({ base: './src/content/news', pattern: '**/*.{md,mdx}' })`.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `title` | string | yes | — | Article headline |
| `description` | string | yes | — | Used for SEO description, OG, cards |
| `pubDate` | date | yes | — | `YYYY-MM-DD` |
| `updatedDate` | date | no | — | Shows "Actualizado" when present |
| `author` | string | no | `SITE.author` | Byline |
| `tags` | string[] | no | `[]` | Metadata only — **no tag pages** |
| `featured` | boolean | no | `false` | Candidate for the home lead story |
| `breaking` | boolean | no | `false` | Shows in the "Última hora" banner |
| `cover` | image() | no | — | Colocated image in the entry's `assets/` folder (e.g. `./assets/cover.jpg`) |
| `coverAlt` | string | no | — | Alt text for the cover |
| `source` | `{ name, url }` | no | — | Attribution to the English-language outlet |
| `draft` | boolean | no | `false` | Excluded from production builds |

### Article frontmatter template

```yaml
---
title: 'Titular de la noticia'
description: 'Bajada de una o dos frases.'
pubDate: 2026-09-10
# updatedDate: 2026-09-11
author: 'Redacción Tecnología Hoy'
tags: ['Inteligencia Artificial']
featured: false
breaking: false
cover: '/covers/ia.svg'
coverAlt: 'Descripción de la imagen'
source:
  name: 'The Verge'
  url: 'https://www.theverge.com/...'
---
```

## 7. Adding a news article

1. Create a folder `src/content/news/<slug>/` with `index.mdx` inside (the folder name **is** the URL slug: `entry.id`).
2. Fill the frontmatter per the table in section 6.
3. Write the body in **Spanish**. Markdown/MDX is fully supported (headings, lists, tables, blockquotes, code).
4. Put the article's images in `src/content/news/<slug>/assets/`. Reference the cover as `./assets/<file>` and embed extra images inline as `![alt](./assets/<file>)`.
5. Set `featured: true` for the lead candidate and/or `breaking: true` for the banner.
6. Always attribute the original English source via `source`.
7. Run `npm run build` and confirm it passes.

Drafts (`draft: true`) render in dev but are excluded from production builds, RSS, and sitemaps.

## 8. Design system

**`src/styles/tokens.css` is the single source of truth.** Every color, space, font size, radius, shadow, and motion value lives there.

- **Never hardcode design values in components.** Always use `var(--token)`.
- To restyle the whole site, edit `tokens.css` only.
- Dark mode: `[data-theme="dark"]` overrides, plus a `@media (prefers-color-scheme: dark)` fallback for `html:not([data-theme])`.
- `global.css` holds the reset, base element styles, `.container` / `.container--wide`, `.skip-link`, `.sr-only`, focus states, and `.prose` (article typography).

Token groups: `--color-*`, `--font-*`, `--text-*`, `--leading-*`, `--measure`, `--space-*`, `--radius-*`, `--container*`, `--transition-*`, `--shadow-*`, plus `--aspect-cover`, `--aspect-thumb`, `--thumb-width`, `--thumb-width-sm`, `--border-width`, `--focus-*`, `--tracking-*`, `--underline-offset`, `--text-code`, `--icon-stroke`, `--z-skip-link`.

## 9. Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Home: breaking banner → lead + secondary → ads → "Últimas noticias" → ads |
| `/noticias/` | `src/pages/noticias/index.astro` | Full archive of published articles |
| `/noticias/<slug>/` | `src/pages/noticias/[slug].astro` | Article page (JSON-LD `NewsArticle`, source block) |
| `/acerca` | `src/pages/acerca.astro` | About |
| `/rss.xml` | `src/pages/rss.xml.js` | RSS feed |
| `/sitemap-index.xml` | generated | XML sitemap (via `@astrojs/sitemap`) |
| `/sitemap-news.xml` | `src/pages/sitemap-news.xml.ts` | Google News sitemap |
| `/robots.txt` | `public/robots.txt` | Crawler rules + sitemap references |

## 10. Content indexing (SEO)

How content becomes discoverable by search engines:

- **XML sitemap** — `@astrojs/sitemap` generates `sitemap-index.xml` → `sitemap-0.xml` with every route. Needs `site` in `astro.config.mjs` to build absolute URLs.
- **Google News sitemap** — `src/pages/sitemap-news.xml.ts` emits `news:news` entries. **Google only accepts articles published in the last 48 hours**; the endpoint filters to that window and falls back to the 10 most recent when nothing qualifies (so the demo is never empty).
- **robots.txt** — `public/robots.txt` allows crawling and points to both sitemaps. **Its URLs are hardcoded to the placeholder domain** and must be updated together with `site`.
- **Structured data** — article pages inject JSON-LD `NewsArticle` (headline, description, dates, author, image, publisher, `inLanguage: "es"`) through the `head` slot in `BaseLayout`.
- **RSS** — `/rss.xml`, linked from `<head>` via `rel="alternate"`.
- **Per-page metadata** — `BaseLayout` sets canonical URL, description, Open Graph, and Twitter card tags.
- **Language** — `<html lang="es">` plus `og:locale` `es_ES`.

### Indexing gotchas

- The `site` value in `astro.config.mjs` is set to the real domain `https://techspain24.com`. **Canonical URLs, sitemaps, and RSS links depend on it.**
- `public/robots.txt` references the same domain — keep both files in sync if it ever changes.
- The 48-hour news window means a quiet site will produce a near-empty news sitemap. That is expected behavior, not a bug.

## 11. Ads & Analytics

### Ads

- `src/components/AdSlot.astro` renders nothing in production while `ADS.enabled === false` (it shows a labeled placeholder only in dev).
- To enable AdSense: set `ADS.enabled = true` and `ADS.client = 'ca-pub-…'` in `src/consts.ts`, then uncomment the AdSense loader in `src/layouts/BaseLayout.astro`.
- Ad slots are placed on the home (two) and on article pages (one).

### Web Analytics

- Vercel Web Analytics is enabled **per project in the Vercel dashboard**. The tracking routes (`/_vercel/insights/*`) are added on the next deployment.
- `src/layouts/BaseLayout.astro` renders `<Analytics />` from `@vercel/analytics/astro` inside `<head>`, so every page is tracked. It is a bundled client script — the only one besides the two inline theme scripts.
- `@vercel/analytics` is a direct dependency. Do **not** set `webAnalytics: { enabled: true }` on the Vercel adapter: that option only applies to `@vercel/analytics@1.3.x` and earlier.

## 12. Configuration

`src/consts.ts` is where site-wide values live:

- `SITE` — `title` (**currently the placeholder `'Tecnología Hoy'`**), `description`, `author`, `url`, `lang`.
- `NAV` — header navigation.
- `SOCIAL` — footer links (placeholder URLs).
- `ADS` — ad toggle and publisher id.

## 13. Deployment (Vercel)

1. The domain is set to `https://techspain24.com` in **both** `astro.config.mjs` (`site`) and `public/robots.txt`.
2. Update `SITE` in `src/consts.ts` (name, description, author).
3. Push the repository to a Git remote and import it in Vercel (Astro is auto-detected; `npm run build`, output `dist/`).
4. The `@astrojs/vercel` adapter also writes `.vercel/output/`. Output remains static.

## 14. Gotchas and conventions

- **Astro 7 content config path**: the file must be `src/content.config.ts`. The legacy `src/content/config.ts` throws `LegacyContentConfigError`.
- **Content Layer API**: use `glob` from `astro/loaders` and `z` from `astro/zod` (Zod v4). Each entry is a folder `<slug>/index.mdx`; `generateId` maps the folder to `id` (the slug). There is **no `slug` field**.
- **Colocated images**: the `cover` field uses the `image()` helper from `astro:assets` and resolves relative to the entry folder (`./assets/...`). Inline body images use relative markdown paths. Article images are NOT placed in `public/`.
- **Rendering**: use `getCollection('news')`, `getEntry('news', id)`, and `render(entry)` from `astro:content`.
- **Endpoints**: `src/pages/rss.xml.js` and `sitemap-news.xml.ts` use `export async function GET(context)`.
- **Client JS**: any script that must not be bundled uses `is:inline`. Keep client JS to the absolute minimum (currently the two theme scripts and the Vercel Analytics component).
- **Do not commit** `node_modules/`, `dist/`, or `.vercel/` (see `.gitignore`).
- **No CSS framework.** Do not add Tailwind or a component library.
- **No sections/taxonomy.** This is a single-topic portal by design; do not reintroduce a `section` field or category pages without an explicit request.

## 15. Astro documentation

Full documentation: https://docs.astro.build

Relevant guides:

- [Routing, dynamic routes, middleware](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling](https://docs.astro.build/en/guides/styling/)
- [Deploy to Vercel](https://docs.astro.build/en/guides/deploy/vercel/)
- [Sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [RSS recipe](https://docs.astro.build/en/recipes/rss/)

## 16. Editorial sources & the press-writing skill

- **Source list** — `src/data/sources.json` is the curated, machine-readable list of outlets used to detect, contrast, and confirm stories before rewriting them in Spanish. It groups ~66 sources into 5 layers: `tech-media`, `reviews`, `asia`, `es-competition`, and `primary`. Each entry has `homepage`, `rss` (or `null` when there is no confirmed feed), `lang`, `focus`, and optional `notes`.
- **Press-writing skill** — `skills/redaccion-prensa/SKILL.md` encodes the daily editorial workflow: pull the latest from the detection layers, contrast with `tech-media`/`reviews`, confirm with `primary`, check `es-competition` for saturation, then write `src/content/news/<slug>.mdx` in neutral/professional Spanish with explicit `source` attribution. Use it whenever an article is written or the sources are reviewed.
- **Editorial verticals** — the portal covers 7 verticals: componentes de PC, portátiles, consolas (portátiles y de escritorio), tarjetas gráficas, memorias, móviles y tutoriales (guías how-to/paso a paso). Stories must fit one of them; the primary vertical goes first in `tags`. These are editorial focus, not URL sections (there are still no category/tag pages).
- **Daily news script** — `scripts/daily-news.mjs` (`npm run news`) fetches the RSS feeds from `sources.json`, marks already-seen items in `scripts/.seen.json` (gitignored), classifies titles into the 7 verticals, and writes `scripts/candidates.json` plus a markdown report for manual selection. No dependencies (uses Node's global `fetch` + a built-in RSS/Atom parser). `tutoriales` is checked first in the classifier, so a how-to title wins over the hardware topic it covers.
- **Redaction delegation** — when the user selects articles and asks to redact them, delegate one subagent (`general`) per article, all in parallel, using the prompt template in `skills/redaccion-prensa/DELEGATION.md`. Each subagent writes one `src/content/news/<slug>/` folder, so there is no file overlap.
