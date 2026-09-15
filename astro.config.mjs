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

/** Slug -> most recent date (`updatedDate`, else `pubDate`). */
function readEntryDates() {
  /** @type {Map<string, Date>} */
  const dates = new Map();

  const slugs = readdirSync(newsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const slug of slugs) {
    // Entries are folders: `<slug>/index.mdx` (or `.md`).
    for (const file of ['index.mdx', 'index.md']) {
      let raw;
      try {
        raw = readFileSync(new URL(`${slug}/${file}`, newsDir), 'utf8');
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

const entryDates = readEntryDates();
const newestEntryDate = [...entryDates.values()].sort((a, b) => b - a)[0];

// https://astro.build/config
export default defineConfig({
  // Real domain. Required by @astrojs/sitemap and the RSS feed to build
  // absolute URLs.
  site: 'https://techspain24.com',
  adapter: vercel(),
  integrations: [
    sitemap({
      serialize(item) {
        const { pathname } = new URL(item.url);

        // `/noticias/<slug>/` -> that entry's real date.
        const article = pathname.match(/^\/noticias\/([^/]+)\/$/);
        if (article) {
          const lastmod = entryDates.get(article[1]);
          if (lastmod) item.lastmod = lastmod;
          return item;
        }

        // The home and the archive re-list every entry, so they change whenever
        // the newest one does. `/acerca/` is static and gets no <lastmod>.
        if ((pathname === '/' || pathname === '/noticias/') && newestEntryDate) {
          item.lastmod = newestEntryDate;
        }

        return item;
      },
    }),
    mdx(),
  ],
});
