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

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE.url);

  const news = (await getCollection('news', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  // Google News only indexes articles published within the last 48 hours.
  // This demo content is older than that window, so when the filter yields
  // nothing we fall back to the 10 most recent articles to keep the endpoint
  // demonstrable.
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recent = news.filter((entry) => entry.data.pubDate.valueOf() >= cutoff);
  const selected = recent.length > 0 ? recent : news.slice(0, 10);

  const urls = selected.map((entry) => {
    const loc = new URL(`/noticias/${entry.id}/`, base).href;

    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      '    <news:news>',
      '      <news:publication>',
      `        <news:name>${escapeXml(SITE.title)}</news:name>`,
      `        <news:language>${SITE.lang}</news:language>`,
      '      </news:publication>',
      `      <news:publication_date>${entry.data.pubDate.toISOString()}</news:publication_date>`,
      `      <news:title>${escapeXml(entry.data.title)}</news:title>`,
      '    </news:news>',
      '  </url>',
    ].join('\n');
  });

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
