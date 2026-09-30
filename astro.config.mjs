// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync, readdirSync } from 'node:fs';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// `@astrojs/sitemap` cannot read a page's source code (documented limitation of
// the Integration API), so it has no way to know when an entry was published or
// edited. The `news` collection is only reachable from inside the Astro runtime,
// so we read the frontmatter here and hand `serialize` a slug -> date map.
//
// Dependency-free on purpose: the build tooling in this project avoids extra
// packages, and the only values needed are two ISO dates. Fails loudly if the
// content directory is missing, which would mean a broken checkout anyway.
const newsDir = new URL('./src/content/news/', import.meta.url);
// English counterparts live beside them; their `/en/news/<slug>/` URLs need the
// same `lastmod` treatment (section: serialize below).
const newsEnDir = new URL('./src/content/news-en/', import.meta.url);

/** Slug -> most recent date (`updatedDate`, else `pubDate`), per directory. */
function readEntryDates(dir) {
  /** @type {Map<string, Date>} */
  const dates = new Map();

  const slugs = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const slug of slugs) {
    // Entries are folders: `<slug>/index.mdx` (or `.md`).
    for (const file of ['index.mdx', 'index.md']) {
      let raw;
      try {
        raw = readFileSync(new URL(`${slug}/${file}`, dir), 'utf8');
      } catch {
        continue;
      }

      // Only the first fenced block, so `---` in the body can never leak in.
      const frontmatter = raw.split(/^---$/m)[1] ?? '';
      const iso = (name) =>
        frontmatter.match(new RegExp(`^${name}:\\s*'?(\\d{4}-\\d{2}-\\d{2})'?`, 'm'))?.[1];
      const value = iso('updatedDate') ?? iso('pubDate');

      if (value) dates.set(slug, new Date(`${value}T00:00:00.000Z`));
      break;
    }
  }

  return dates;
}

const entryDates = readEntryDates(newsDir);
const entryDatesEn = readEntryDates(newsEnDir);
// Home and archive list only Spanish articles, so their `<lastmod>` tracks the
// Spanish corpus alone; English articles have no listing page to bump.
const newestEntryDate = [...entryDates.values()].sort((a, b) => b - a)[0];

// https://astro.build/config
export default defineConfig({
  // Real domain. Required by @astrojs/sitemap and the RSS feed to build
  // absolute URLs.
  //
  // `www` is the host that serves 200 in Vercel; the bare apex 308-redirects
  // here. Every absolute URL the site declares (canonical, og:url, sitemaps,
  // RSS, robots.txt) must therefore use `www`, or the site ends up pointing its
  // own canonical at a redirecting URL. See section 10 of AGENTS.md.
  site: 'https://www.techspain24.com',
  adapter: vercel(),
  // The Google News feed moved from `/sitemap-news.xml` (its long-published
  // path, advertised in robots.txt and possibly registered in Search
  // Console) to `/news-sitemap.xml`. One 301 keeps every crawler that still
  // requests the old URL on the single source of truth instead of a 404.
  redirects: {
    '/sitemap-news.xml': '/news-sitemap.xml',
  },
  integrations: [
    sitemap({
      // Register the Google News sitemap in the index so that
      // `/sitemap-index.xml` becomes the single source of truth for the whole
      // sitemap architecture (index -> sitemap-0 + news sitemap) instead of
      // robots.txt being the only place that knows about the news feed.
      // Absolute URL: kept as the same literal host as `site` above.
      customSitemaps: ['https://www.techspain24.com/news-sitemap.xml'],
      // Two deliberate exclusions; both are still crawlable (linked, never
      // `Disallow`ed):
      //   - the legal pages (explicit editorial request), and
      //   - archive pagination pages (`/noticias/2/`, `/noticias/3/`, ...),
      //     which are listings we do not promote; they stay discoverable via
      //     the links on `/noticias/`.
      filter: (page) => {
        const { pathname } = new URL(page);
        return (
          !/^\/(aviso-legal|privacidad|cookies)\/$/.test(pathname) &&
          !/^\/noticias\/\d+\/$/.test(pathname)
        );
      },
      serialize(item) {
        const { pathname } = new URL(item.url);

        // The archive is paginated (`/noticias/`, `/noticias/2/`, …). Those are
        // listings, not articles, and `/noticias/2/` would otherwise match the
        // article pattern below — where the "2" is not a slug, so the lookup
        // fails and the early return would skip the listing branch entirely.
        const isArchiveListing =
          pathname === '/noticias/' || /^\/noticias\/\d+\/$/.test(pathname);

        // `/noticias/<slug>/` -> that entry's real date.
        const article = isArchiveListing ? null : pathname.match(/^\/noticias\/([^/]+)\/$/);
        if (article) {
          const lastmod = entryDates.get(article[1]);
          if (lastmod) item.lastmod = lastmod;
          return item;
        }

        // `/en/news/<slug>/` -> the English entry's real date.
        const articleEn = pathname.match(/^\/en\/news\/([^/]+)\/$/);
        if (articleEn) {
          const lastmod = entryDatesEn.get(articleEn[1]);
          if (lastmod) item.lastmod = lastmod;
          return item;
        }

        // The home and every archive page re-list every entry, so they change
        // whenever the newest one does. `/acerca/` is static: no <lastmod>.
        if ((pathname === '/' || isArchiveListing) && newestEntryDate) {
          item.lastmod = newestEntryDate;
        }

        return item;
      },
    }),
    mdx(),
  ],
});
