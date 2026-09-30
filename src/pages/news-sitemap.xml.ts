/**
 * Google News sitemap — `/news-sitemap.xml`.
 *
 * - Google News only accepts articles published within the last 48 hours; the
 *   window is computed at build time (this site is static output, so the page
 *   is regenerated on every deploy, never at request time).
 * - No fallback by design: when nothing falls inside the window the endpoint
 *   emits an empty `<urlset>` rather than padding it with older articles,
 *   which would violate the 48 h rule.
 * - Both corpora are included: Spanish articles under `/noticias/<id>/`
 *   (`news:language` es) and their English companions under `/en/news/<id>/`
 *   (`news:language` en). Drafts are skipped in both, and an English
 *   companion is also skipped while its Spanish original is a draft (the
 *   route does not exist in production then, so the `<loc>` would 404).
 *
 * The `newsEn` schema has no `featured`/`breaking` fields and requires
 * `translationOf`; this endpoint only reads `id`, `pubDate`, `title` and
 * `draft`, which both collections share.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';

const escapeXml = (value: string): string =>
  value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });

/** A published article of either language, reduced to what the feed emits. */
type NewsRow = {
  loc: string;
  language: 'es' | 'en';
  pubDate: Date;
  title: string;
};

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE.url);

  const [allEs, allEn] = await Promise.all([getCollection('news'), getCollection('newsEn')]);

  // Draft state of every Spanish entry, including drafts: the English route
  // hides a translation while its `translationOf` target is a draft (see
  // `getStaticPaths` in `en/news/[slug].astro`), so advertising that `<loc>`
  // here would put a 404 in the feed.
  const esDraft = new Map(allEs.map((entry) => [entry.id, entry.data.draft === true]));

  const spanish: NewsRow[] = allEs
    .filter((entry) => !entry.data.draft)
    .map((entry) => ({
      loc: new URL(`/noticias/${entry.id}/`, base).href,
      language: 'es',
      pubDate: entry.data.pubDate,
      title: entry.data.title,
    }));

  const english: NewsRow[] = allEn
    .filter(
      (entry) =>
        !entry.data.draft &&
        // `!PROD` mirrors the route: drafts render in dev but vanish in builds.
        (!import.meta.env.PROD || !esDraft.get(entry.data.translationOf)),
    )
    .map((entry) => ({
      loc: new URL(`/en/news/${entry.id}/`, base).href,
      language: 'en',
      pubDate: entry.data.pubDate,
      title: entry.data.title,
    }));

  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const selected = [...spanish, ...english]
    .filter((row) => row.pubDate.valueOf() >= cutoff)
    // Newest first; `loc` breaks ties so the output is deterministic for a
    // given build (same corpus, same order).
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf() || a.loc.localeCompare(b.loc));

  const urls = selected.map((row) =>
    [
      '  <url>',
      `    <loc>${escapeXml(row.loc)}</loc>`,
      '    <news:news>',
      '      <news:publication>',
      `        <news:name>${escapeXml(SITE.title)}</news:name>`,
      `        <news:language>${escapeXml(row.language)}</news:language>`,
      '      </news:publication>',
      `      <news:publication_date>${row.pubDate.toISOString()}</news:publication_date>`,
      `      <news:title>${escapeXml(row.title)}</news:title>`,
      '    </news:news>',
      '  </url>',
    ].join('\n'),
  );

  // Empty `<urlset>` when the window is empty: valid XML, and honest.
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
