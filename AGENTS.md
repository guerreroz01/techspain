# AGENTS.md

Operating guide for AI agents working in this repository.

## 1. What this project is

A **Spanish-language technology news portal** built with **Astro** and deployed to **Vercel**.

- Single editorial line: technology news. **No sections, no categories, no tag pages.**
- Static output by default (fastest). SSR is available per-route if ever needed.
- Near-zero client JavaScript: the two theme scripts plus the cookie-consent init/preferences scripts, the conditional GA4 and AdSense loaders (see section 11), the Vercel Web Analytics component, the title search bar and the mobile navigation toggle (see section 14). Google Analytics 4 stays off until the visitor accepts the analytics category.
- Ad-ready (Google AdSense) but **ads are disabled by default**. Enabling them is a single switch in `src/consts.ts` (see section 11).
- Cookie consent is **granular** (necessary / analytics / advertising) and the legal pages (`/aviso-legal`, `/privacidad`, `/cookies`) are excluded from the sitemap on purpose (see sections 9 and 11).
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
| News candidates | `npm run news` (see section 16) |
| Regenerate the published index | `npm run index` (see section 7) |

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
├── README.md
├── astro.config.mjs              # site URL, Vercel adapter, sitemap + mdx
├── package.json                  # scripts + deps
├── tsconfig.json
├── public/                       # served as-is at the site root
│   ├── apple-touch-icon.png      # 180x180, flattened on white (iOS renders alpha as black)
│   ├── covers/                   # local SVG article covers
│   │   ├── chips.svg
│   │   ├── ia.svg
│   │   └── software.svg
│   ├── favicon-96x96.png
│   ├── favicon.ico               # multi-size 16/32/48
│   ├── logo-512.png              # square mark, used by the publisher structured data
│   ├── logo-mark-96.png          # transparent mark for the header (dark-theme safe)
│   ├── og/                       # 1200x630 social cards (see section 10)
│   │   ├── techspain-banner.jpg  # branded wordmark, default for site-level pages
│   │   └── portada-1..5.jpg      # generic unbranded covers, article fallbacks
│   └── robots.txt                # allows crawling; references both sitemaps
├── scripts/
│   ├── daily-news.mjs            # RSS candidate fetcher + classifier (see section 16)
│   ├── index-published.mjs       # regenerates articulos-publicados.md (see section 7)
│   └── articulos-publicados.md   # contrast index: every published article (generated)
├── skills/
│   └── redaccion-prensa/         # press-writing skill + delegation playbook
└── src/
    ├── components/
    │   ├── AdSlot.astro          # ad unit; inert unless ADS.enabled
    │   ├── ConsentBanner.astro   # granular cookie notice + preferences dialog
    │   ├── Footer.astro
    │   ├── GoogleAds.astro       # AdSense loader; injects only after ads consent
    │   ├── GoogleAnalytics.astro # GA4 loader; injects the tag only after consent
    │   ├── Header.astro          # brand mark + site title + nav + mobile menu toggle + theme toggle
    │   ├── LeadStory.astro       # home lead story + secondary stories
    │   ├── NewsCard.astro        # list item in "Últimas noticias"
    │   ├── StoryList.astro       # related + random recommendation blocks
    │   ├── SearchBar.astro       # title search bar; lazy-loads /buscar.json
    │   ├── StoryCard.astro       # compact secondary story card
    │   └── ThemeToggle.astro     # light/dark toggle (inline script)
    ├── content/
    │   └── news/                 # ← ALL ARTICLES LIVE HERE
    │       └── <slug>/index.mdx  # one folder per article; the folder name IS the slug
    ├── content.config.ts         # `news` collection: loader + schema
    ├── consts.ts                 # SITE, NAV, SOCIAL, ADS, GA, CONSENT, LEGAL
    ├── data/
    │   └── sources.json          # curated editorial source list (see section 16)
    ├── env.d.ts                  # astro/client types
    ├── layouts/
    │   └── BaseLayout.astro      # html shell, SEO, head slot, theme + consent init
    ├── pages/
    │   ├── acerca.astro          # /acerca
    │   ├── aviso-legal.astro     # /aviso-legal (LSSI-CE identification)
    │   ├── buscar.json.ts        # /buscar.json (search index of published articles)
    │   ├── contacto.astro        # /contacto (mailto channel + social profiles)
    │   ├── cookies.astro         # /cookies (cookie inventory + revocation)
    │   ├── index.astro           # / (home)
    │   ├── noticias/
    │   │   ├── [...page].astro   # /noticias/ and /noticias/<page>/ (paginated archive)
    │   │   └── [slug].astro      # /noticias/<slug>/ (article)
    │   ├── privacidad.astro      # /privacidad (RGPD data-protection policy)
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
| `source` | `{ name, url }` | no | — | Attribution to the story's original outlet, not the outlet that relayed it |
| `draft` | boolean | no | `false` | Excluded from production builds |

### Article frontmatter template

```yaml
---
title: 'Titular de la noticia'
description: 'Bajada de una o dos frases.'
pubDate: 2026-09-10
# updatedDate: 2026-09-11
author: 'Redacción TechSpain24'
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
5. Leave `featured` and `breaking` at `false`. Promotion is a newsroom call made on the whole batch by whoever runs it, never by one writer: parallel writers cannot see each other, so each would mark its own piece as the lead. The orchestrator promotes exactly one entry afterwards (see `skills/redaccion-prensa/DELEGATION.md`).
6. Always attribute the story's original outlet via `source`. If the outlet you read cites another, trace it and attribute that one.
7. Run `npm run build` and confirm it passes.
8. **At the end of the publication batch, regenerate the contrast index with `npm run index`.** `scripts/articulos-publicados.md` is the list every writer must consult to avoid re-covering a story, so it is only trustworthy if it is refreshed after the batch lands. This is the closing step of a publication, not an optional chore: a stale index makes the next batch duplicate stories blind. The index is generated — never hand-edit it.

Drafts (`draft: true`) render in dev but are excluded from production builds, RSS, and sitemaps. They are also excluded from the contrast index.

## 8. Design system

**`src/styles/tokens.css` is the single source of truth.** Every color, space, font size, radius, shadow, and motion value lives there.

- **Never hardcode design values in components.** Always use `var(--token)`.
- To restyle the whole site, edit `tokens.css` only.
- Dark mode: `[data-theme="dark"]` overrides, plus a `@media (prefers-color-scheme: dark)` fallback for `html:not([data-theme])`.
- `global.css` holds the reset, base element styles, `.container` / `.container--wide`, `.skip-link`, `.sr-only`, focus states, and `.prose` (article typography).

Token groups: `--color-*`, `--font-*`, `--text-*`, `--leading-*`, `--measure`, `--space-*`, `--radius-*`, `--container*`, `--transition-*`, `--shadow-*`, plus `--aspect-cover`, `--aspect-thumb`, `--thumb-width`, `--thumb-width-sm`, `--brand-mark-size`, `--border-width`, `--focus-*`, `--tracking-*`, `--underline-offset`, `--text-code`, `--icon-stroke`, `--color-overlay`, `--z-nav-panel`, `--z-skip-link`, `--z-consent-banner`, `--z-consent-panel`.

## 9. Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Home: breaking banner → lead + secondary → ads → "Últimas noticias" → ads |
| `/noticias/` · `/noticias/<page>/` | `src/pages/noticias/[...page].astro` | Paginated archive of published articles |
| `/noticias/<slug>/` | `src/pages/noticias/[slug].astro` | Article page (JSON-LD `NewsArticle`, source block) |
| `/acerca` | `src/pages/acerca.astro` | About |
| `/contacto` | `src/pages/contacto.astro` | Contact: `mailto:` channel (`LEGAL.email`) + social profiles |
| `/aviso-legal` | `src/pages/aviso-legal.astro` | Legal notice + owner identification (LSSI-CE) |
| `/privacidad` | `src/pages/privacidad.astro` | Privacy policy (RGPD/LOPDGDD) |
| `/cookies` | `src/pages/cookies.astro` | Cookie policy + inventory + revocation |
| `/buscar.json` | `src/pages/buscar.json.ts` | Search index of published articles (`{ title, url }`) |
| `/rss.xml` | `src/pages/rss.xml.js` | RSS feed |
| `/sitemap-index.xml` | generated | XML sitemap (via `@astrojs/sitemap`) |
| `/sitemap-news.xml` | `src/pages/sitemap-news.xml.ts` | Google News sitemap |
| `/robots.txt` | `public/robots.txt` | Crawler rules + sitemap references |

## 10. Content indexing (SEO)

How content becomes discoverable by search engines:

- **XML sitemap** — `@astrojs/sitemap` generates `sitemap-index.xml` → `sitemap-0.xml` with every route. Needs `site` in `astro.config.mjs` to build absolute URLs. The legal pages (`/aviso-legal/`, `/privacidad/`, `/cookies/`) are excluded through the `filter` option and additionally emit `<meta name="robots" content="noindex, follow">` via the `noindex` prop of `BaseLayout`. Both are deliberate. They are **not** disallowed in `public/robots.txt`: a crawler blocked from fetching a page never reads its `noindex` tag, which would leave the URL eligible to be indexed as a bare link. They are linked from the footer.
- **Google News sitemap** — `src/pages/sitemap-news.xml.ts` emits `news:news` entries. **Google only accepts articles published in the last 48 hours**; the endpoint filters to that window and falls back to the 10 most recent when nothing qualifies (so the demo is never empty).
- **robots.txt** — `public/robots.txt` allows crawling and points to both sitemaps. **Its URLs are hardcoded to `https://www.techspain24.com`** and must be updated together with `site`.
- **Structured data** — article pages inject JSON-LD `NewsArticle` (headline, description, dates, author, image, publisher, `inLanguage: "es"`) through the `head` slot in `BaseLayout`. The `publisher` node carries a `logo` (`public/logo-512.png`); without it the organisation is not eligible for the knowledge panel.
- **Social card** — `BaseLayout` emits `og:image` and `twitter:image` on **every** page and `twitter:card` is always `summary_large_image`. The `image` prop defaults to `BRAND.socialBanner` (the branded 1200×630 card). Article pages pass a 1200px JPEG transform of their own cover, built with `getImage()`; an article with no cover falls back to `socialPoolImageFor(entry.id)`, a deterministic pick from `BRAND.socialPool`. Determinism matters: crawlers cache by URL, so a rotating pick would make every re-share look like a new asset.
- **Favicons** — `favicon.ico` (16/32/48), `favicon-96x96.png` and `apple-touch-icon.png` are generated from the brand kit. There is **no `favicon.svg`**: the file that used to be linked here was a leftover from another project (a "C" for "Cuaderno"), not this site's mark. If a real vector is ever produced, add it back ahead of the raster fallbacks.
- **RSS** — `/rss.xml`, linked from `<head>` via `rel="alternate"`.
- **Per-page metadata** — `BaseLayout` sets canonical URL, description, Open Graph, and Twitter card tags.
- **Language** — `<html lang="es">` plus `og:locale` `es_ES`.

### Indexing gotchas

- The `site` value in `astro.config.mjs` is set to the real domain `https://www.techspain24.com`. **Canonical URLs, sitemaps, and RSS links depend on it.**
- **The declared `site` must be the host that actually serves 200.** In Vercel, `www.techspain24.com` is the primary domain and the bare apex `techspain24.com` 308-redirects to it. Pointing `site` at the apex made every canonical, every sitemap entry (277 of them) and both `robots.txt` sitemap references advertise a redirecting URL, and Google Search Console reported the whole site as "page with redirect". If the primary domain ever changes in Vercel, `astro.config.mjs`, `public/robots.txt` and the `SITE.url` fallback in `src/consts.ts` must change with it — that is the one place where the three can silently drift.
- `public/robots.txt` references the same domain — keep both files in sync if it ever changes.
- `/noticias/<slug>` and `/noticias/<slug>/` both return 200 (Astro's default `trailingSlash: 'ignore'`). The trailing-slash form is the canonical one, so the duplicate is resolved by the `canonical` tag rather than by a redirect.
- The 48-hour news window means a quiet site will produce a near-empty news sitemap. That is expected behavior, not a bug.

## 11. Ads & Analytics

### Cookie consent (granular)

Three categories: **necessary** (always on, no consent), **analytics** (GA4) and **advertising** (AdSense). A category is only *offered* when its service is enabled in the build, so the notice adapts automatically: `analytics.available = GA_ACTIVE`, `advertising.available = ADS_ACTIVE`, and `CONSENT_ACTIVE = analytics.available || advertising.available`. When both are off, the whole consent UI (notice, dialog, footer button, init script) is inert.

- **Storage key**: `localStorage['consent-preferences']` holds JSON — `{ necessary: true, analytics: boolean, advertising: boolean, updatedAt: ISO }`.
- **Legacy migration**: the old binary key `localStorage['consent-analytics']` (`'granted'`/`'denied'`) is migrated on first load and then removed. `granted` maps to `analytics: true`, `denied` to `analytics: false`; visitors who already decided are never asked again. This is the **only** place the stored state is parsed (`readState()` in the `BaseLayout` init script); the resolved value is shared through `window.__consent.state` so the GA4, AdSense and dialog scripts never re-implement it.
- **State machine**: `html[data-consent]` is `pending` while there is no decision (notice visible) and `set` afterwards. It is set before paint by the init script and updated by the dialog. Visibility is CSS-driven off `html[data-consent='pending']`, never toggled from JavaScript.
- **UI**: the notice offers "Aceptar todas" / "Rechazar todas" with **identical styling** (EDPB guidance, no dark patterns — do not give "Aceptar" a filled or accent variant) plus "Configurar", which opens a modal `role="dialog"` with one real checkbox switch per available category, a link to `/cookies` and "Guardar preferencias". The dialog traps focus, closes on `Escape` or backdrop click, and restores focus to the control that opened it. The footer "Configurar cookies" button opens the same dialog and is shown while `CONSENT_ACTIVE`.
- **Custom events**: `consent:granted` (analytics accepted) loads GA4 without a reload; `consent:ads-granted` (advertising accepted) loads AdSense; `consent:reopen` opens the preferences dialog.
- **Gating**: GA4 only loads when `analytics === true`; AdSense only loads when `advertising === true`. Nothing is requested from Google before the matching consent.
- **Cookie purge — do not "simplify" this.** Withdrawing a category deletes its cookies and reloads, but the delete is **not** a plain one-liner. Two traps: (1) the live Google tag (`gtag.js` / `adsbygoogle.js`) keeps rewriting its cookies, so purging before the reload loses the race — the authoritative purge runs on the reloaded page, where the tag is absent; (2) GA4 uses `cookie_domain: auto`, so in production the cookie is scoped to `.techspain24.com` (a *domain* cookie) while on an IP literal it is host-only. `purgeCookies()` therefore sweeps every plausible scope by walking the hostname's parent domains. What gets purged: analytics removes `_ga` and `_ga_*`; advertising removes `_ga`, `_ga_*`, `_gcl_*`, `_gac_*`, `_gads`, `__gads*`, `__gpi*`, `IDE` and `DSID`. The on-load purge runs on every load for a visitor who refused a category, which also cleans up stray cookies. Cookies set on third-party domains (e.g. Google's own on `google.com`/`doubleclick.net`) are not visible to `document.cookie` and cannot be removed from the site — this is stated in `/cookies`. GA4 withdrawal verified with headless-Chromium assertions.

### Ads

- `src/components/AdSlot.astro` renders nothing in production until ads are live *and* the caller passes a real slot id; in dev it shows a labeled placeholder whenever no real unit is emitted.
- **Enabling AdSense is a single switch**: set `ADS.enabled = true` and `ADS.client = 'ca-pub-…'` in `src/consts.ts`. Nothing needs to be uncommented. `ADS_ACTIVE` becomes true, which (a) renders the ad slots, (b) adds the advertising category to the consent dialog, and (c) makes `GoogleAds.astro` emit a loader that injects `adsbygoogle.js` only after the advertising category is accepted and then pushes every `.adsbygoogle` unit.
- **Site verification is a separate concern from ad serving.** AdSense requires its code — or the verification meta tag — inside `<head>` to connect the site, and **its crawler does not accept the cookie notice**, so a consent-gated loader is invisible to it and the site reads as "ad code not found". `BaseLayout.astro` therefore emits `<meta name="google-adsense-account" content={ADS.client}>` on every page whenever `ADS_ACTIVE`; it sets no cookie and needs no consent. In AdSense, select **Meta tag** as the verification method. **Do not "fix" a verification error by pasting the raw `adsbygoogle.js` `<script>` unconditionally into `<head>`** — that loads Google before consent, breaks the RGPD/LSSI model the consent banner and `/cookies` document, and contradicts them. The publisher id is currently `ca-pub-5346680680468175`.
- **A manual unit needs a real slot id**: `<AdSlot slot="1234567890" />`. The three current instances (home ×2, article ×1) pass none, so they render nothing until the ad units exist in AdSense. Pushing an `<ins>` with an empty `data-ad-slot` logs a TagError and stays blank, which is why `AdSlot.astro` guards on `ADS_ACTIVE && slot`.
- Ad slots are placed on the home (two) and on article pages (one).
- **Open item:** AdSense requires a **Google-certified CMP** to serve ads to EEA/UK users, and this site's own banner is not one. Resolve this (e.g. through AdSense's own Privacy & messaging CMP, reconciled with the existing banner) before relying on ad revenue from Spanish traffic.

### Web Analytics

- Vercel Web Analytics is enabled **per project in the Vercel dashboard**. The tracking routes (`/_vercel/insights/*`) are added on the next deployment.
- `src/layouts/BaseLayout.astro` renders `<Analytics />` from `@vercel/analytics/astro` inside `<head>`, so every page is tracked. It is a bundled client script (besides the inline theme/consent scripts).
- Vercel Web Analytics is **cookieless**: it sets no cookies and uses no persistent identifiers, so it is not gated by consent and is not part of the cookie inventory. It still collects aggregated visit metrics, which is disclosed in `/privacidad`.
- `@vercel/analytics` is a direct dependency. Do **not** set `webAnalytics: { enabled: true }` on the Vercel adapter: that option only applies to `@vercel/analytics@1.3.x` and earlier.

### Google Analytics

- Toggle: `GA = { enabled, measurementId }` in `src/consts.ts`, plus `GA_ACTIVE = GA.enabled && GA.measurementId.length > 0`. Every GA component gates on `GA_ACTIVE`, so analytics only runs when the switch is on **and** a measurement id is set. Keep `enabled: false` until a real id exists.
- **Nothing loads before consent.** `GoogleAnalytics.astro` emits no script at all when `GA_ACTIVE` is false, and even when active it only builds the `gtag/js` tag after the analytics category is accepted. No request to Google and no third-party cookie happens before the visitor accepts.

## 12. Configuration

`src/consts.ts` is where site-wide values live:

- `SITE` — `title`, `description`, `author` (the byline used across every article), `url`, `lang`.
- `NAV` — header navigation.
- `SOCIAL` — social profiles shared by the footer and `/contacto` (GitHub only; no placeholder URLs left).
- `ADS` — ad toggle and publisher id, plus `ADS_ACTIVE`.
- `GA` — Google Analytics 4 toggle and measurement id, plus `GA_ACTIVE`.
- `CONSENT` — consent storage keys (`storageKey`, `legacyKey`) and per-category availability, plus `CONSENT_ACTIVE` (see section 11).
- `BRAND` — the square `logo`, the default `socialBanner` and the generic `socialPool`, plus `socialPoolImageFor(id)` for the deterministic pick (see section 10).
- `LEGAL` — legal identification of the owner (name, NIF, address, email, country, jurisdiction) and the last-updated date. The three legal pages read from here, so the data is never hardcoded twice.

## 13. Deployment (Vercel)

1. The domain is set to `https://www.techspain24.com` in **both** `astro.config.mjs` (`site`) and `public/robots.txt`, and it must match the primary domain configured in Vercel (see the indexing gotchas in section 10).
2. Update `SITE` in `src/consts.ts` (name, description, author).
3. Push the repository to a Git remote and import it in Vercel (Astro is auto-detected; `npm run build`, output `dist/`).
4. The `@astrojs/vercel` adapter also writes `.vercel/output/`. Output remains static.

## 14. Gotchas and conventions

- **Astro 7 content config path**: the file must be `src/content.config.ts`. The legacy `src/content/config.ts` throws `LegacyContentConfigError`.
- **Content Layer API**: use `glob` from `astro/loaders` and `z` from `astro/zod` (Zod v4). Each entry is a folder `<slug>/index.mdx`; `generateId` maps the folder to `id` (the slug). There is **no `slug` field**.
- **Colocated images**: the `cover` field uses the `image()` helper from `astro:assets` and resolves relative to the entry folder (`./assets/...`). Inline body images use relative markdown paths. Article images are NOT placed in `public/`.
- **Inline article images and `height: auto` — do not "clean up" this rule.** Astro's markdown pipeline emits `width` and `height` attributes on every inline body image. Those attributes are a presentational hint, so a reset with only `max-width: 100%` constrained the width while the attribute height stayed fixed: on mobile every inline image rendered vertically stretched (measured 342×1672 px for a 1920×1672 source, roughly 5.6× too tall). `img { height: auto }` in `global.css` is what preserves the intrinsic ratio. It cannot be dropped while the attributes are present, and it is inert for the cover/thumbnail components because those set their own `aspect-ratio` + `object-fit` and carry no size attributes.
- **Rendering**: use `getCollection('news')`, `getEntry('news', id)`, and `render(entry)` from `astro:content`.
- **Heading levels in cards**: `NewsCard.astro` and `StoryCard.astro` hardcode `<h2>`, so neither can be reused inside an article page — the article title is already the `h1` and the body carries `h2`s, so a card's stray `h2` would corrupt the heading hierarchy. `StoryList.astro` is the shared recommendation block used instead: it takes `{ id, title, entries }`, renders a section `h2` plus one `h3` per item, and backs both the "Noticias relacionadas" and "Otras noticias" blocks on article pages. Its random trio is resolved at **build time** (Fisher–Yates over the non-related entries inside `getStaticPaths`), so it changes per deploy, not per visit — that non-determinism is intentional and requires no client JS (see §1 and the Client JS bullet below).
- **Endpoints**: `src/pages/rss.xml.js` and `sitemap-news.xml.ts` use `export async function GET(context)`.
- **Client JS**: any script that must not be bundled uses `is:inline`. Keep client JS to the absolute minimum (currently the two theme scripts, the consent init/preferences scripts, the conditional GA4 and AdSense loaders, the Vercel Analytics component, the search bar and the mobile navigation toggle). The search bar uses a regular `<script>` (not `is:inline`) so it goes through the build graph and is type-checked by Astro — not for paint-critical reasons. Note that Astro inlines into every page any script below Vite's `assetsInlineLimit` (4 KB): the search script currently ships inline, exactly like the Vercel Analytics one, so do not assume it is a separately cached file.
- **Mobile navigation is a progressive enhancement — do not "fix" the fallback.** `Header.astro` carries an `is:inline` script that sets `document.documentElement.dataset.nav = 'enhanced'` and only then does the stylesheet collapse the links behind the `.nav-toggle` button. That marker is the switch on purpose: the collapsed state is defined **only** under `html[data-nav='enhanced']` inside a `max-width: 47.999rem` block, so without JS the links keep the always-visible desktop-style layout. Navigation is the one feature a news site cannot lose to a failed script — do not move the collapsed state into the unscoped default rules, and do not replace the marker with a `<script>` that runs after the nav has already painted (it would flash the expanded menu). The panel is an overlay anchored under the header bar with `--z-nav-panel`, deliberately below the skip link.
- **Client-side state via `data-*` on `<html>`**: theme and consent are coordinated through `document.documentElement.dataset.*` (`theme`, `consent`), set by `is:inline` scripts in `<head>` and reacted to from CSS. The consent notice is shown only by `html[data-consent='pending']` and is never toggled from JavaScript; after a decision it is `set`. `--z-consent-panel` (300) must stay above `--z-consent-banner` (200), which must stay above `--z-skip-link` (100).
- **Cookie-consent storage**: the decision lives in `localStorage['consent-preferences']` (JSON, see section 11). The legacy `consent-analytics` key is migrated by the `BaseLayout` init script and must not be read anywhere else.
- **Never render `cover.src` (nor any `ImageMetadata.src`) into the output — go through the image API.** Astro keys its asset bookkeeping by the image's **output URL** and only keeps an original whose recorded source path was referenced while rendering. When two images in the same entry claim the same output URL, the cover's file is deleted at build time (`Deleting … as it's not referenced outside of image processing`) and **every** reference to it 404s: the article hero, its `og:image` and its listing thumbnails. That is why `[slug].astro` builds the hero and the share card with `getImage()` and why `LeadStory`, `NewsCard`, `StoryCard` and `StoryList` render through `<Image>`: an explicitly requested transform is always emitted. This is not only a correctness fix — before it, the home shipped **5.9 MB** of images and `/noticias/` **9.3 MB**, because every hero and every 72px thumbnail downloaded the full-size original (now 187 KB and 410 KB). Two articles were broken in production this way and the same collision was already latent on a third.
- **Article body images are optimized but not responsive.** Astro's markdown pipeline emits one full-resolution variant per inline image (a 3000×2400 body image ships as a ~528 KB webp). That is the remaining image weight on an article page; making them responsive would need a rehype step.
- **`public/` is NOT optimized by Astro — every byte there ships verbatim.** A file dropped in `public/` is copied to `dist/` and to the Vercel output as-is, and Astro's image pipeline never touches it. Anything large must be resized and compressed **before** it lands there: that is why the brand cards in `public/og/` are pre-built 1200×630 JPEGs (~120–176 KB) rather than the 1–2 MB PNGs they come from. The **unprocessed brand kit is deliberately NOT kept in `public/`** — it used to live there and shipped ≈14 MB that no template referenced. The originals live outside the repo; only the derivatives in `public/og/` and the root icons are tracked. Regenerate them with `magick <src> -resize 1200x630^ -gravity center -extent 1200x630 -strip -quality 84 <out>.jpg` if the kit changes.
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

- **Source list** — `src/data/sources.json` is the curated, machine-readable list of outlets used to detect, contrast, and confirm stories before rewriting them in Spanish. It groups 135 sources into 7 layers: `tech-media`, `reviews`, `asia`, `es-competition`, `primary`, `emulacion` (emulation news, per-console state, and tutorials), and `wearables` (smartwatches, smart rings and smart glasses: launches, reviews and tutorials). Each entry has `homepage`, `rss` (or `null` when there is no confirmed feed), `lang`, `focus`, and optional `notes`. The detector fetches every source with a non-null `rss`, regardless of layer — the layer is editorial metadata, not a fetch filter. Release feeds (`*.releases.atom`) only work when the release title names the project (`shadPS4`, `Winlator`, `Azahar`, `MAME`); feeds titled just `v1.2.3` cannot be classified and are not listed. Feeds are verified with the detector's own User-Agent before being added: a few outlets (Wareable, PhoneArena, Whoop, Withings, Notebookcheck) hard-block that agent with HTTP 403 and are therefore deliberately absent.
- **Press-writing skill** — `skills/redaccion-prensa/SKILL.md` encodes the daily editorial workflow: pull the latest from the detection layers, contrast with `tech-media`/`reviews`, confirm with `primary`, check `es-competition` for saturation, then write `src/content/news/<slug>/index.mdx` in neutral/professional Spanish with explicit `source` attribution. Use it whenever an article is written or the sources are reviewed.
- **Editorial verticals** — the portal covers 9 verticals: componentes de PC, portátiles, consolas (portátiles y de escritorio), tarjetas gráficas, memorias, móviles, wearables (relojes, anillos y gafas inteligentes), emuladores de videojuegos y tutoriales (guías how-to/paso a paso). Stories must fit one of them; the primary vertical goes first in `tags`. `emuladores` is host-agnostic: it covers console emulators on Windows, macOS, Linux and Android, with the host OS as a secondary tag. `wearables` is one editorial block, not three: glasses, watches and rings share a single vertical because splitting them would fragment a small news volume across three classifier buckets. It is checked **before** `moviles`, because a headline like "Samsung Galaxy Watch 8" also matches `moviles` through "galaxy" (and "Pixel Watch" through "pixel") and would otherwise be diluted into phone coverage. These are editorial focus, not URL sections (there are still no category/tag pages).
- **Daily news script** — `scripts/daily-news.mjs` (`npm run news`) fetches the RSS feeds from `sources.json`, marks already-seen items in `scripts/.seen.json` (gitignored), classifies titles into the 9 verticals, and writes `scripts/candidates.json` plus a markdown report for manual selection. No dependencies (uses Node's global `fetch` + a built-in RSS/Atom parser). `tutoriales` is checked first in the classifier, so a how-to title wins over the hardware topic it covers — but only when the title also carries a technology signal, so entertainment guides (live-stream and movie how-tos) are not offered as tutorials. `emuladores` is checked before `consolas`, so an emulator story lands under Emuladores even when it names the host console. `wearables` is checked before `moviles` (see above). The technology signal for `tutoriales` is derived automatically from the other verticals, so adding a vertical also widens which how-to titles qualify — that is why "Cómo configurar tu Apple Watch" only classifies as a tutorial once `wearables` exists.
- **Contrast index** — `scripts/articulos-publicados.md` (`npm run index`) lists every published article with its URL. It is the anti-duplication step of the workflow: writers consult it before proposing a story. It is **generated** from `src/content/news/` by `scripts/index-published.mjs` and must be regenerated at the close of every publication batch (section 7, step 8) — never hand-edited. It reads the site domain from `astro.config.mjs`, so it cannot drift from canonical URLs, and it skips `draft: true` entries.
- **Redaction delegation** — when the user selects articles and asks to redact them, delegate one subagent (`general`) per article, all in parallel, using the prompt template in `skills/redaccion-prensa/DELEGATION.md`. Each subagent writes one `src/content/news/<slug>/` folder, so there is no file overlap.
- **Redaction SEO pass** — each delegated writer also runs the pre-publish SEO pass on its own article via the `seo-audit` skill's article contract (`references/article-seo.md`); the pass never touches the headline, tags, or promotion flags, and never runs the build.
