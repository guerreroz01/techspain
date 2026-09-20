import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Search index consumed by `SearchBar.astro`.
 *
 * A static JSON endpoint instead of relying on the rendered archive: the news
 * list is paginated, so the DOM of a single page only holds one slice of the
 * collection. This index carries every published article so the client can
 * match across the whole archive.
 */
interface SearchIndexEntry {
  title: string;
  url: string;
}

export const GET: APIRoute = async () => {
  const news = await getCollection('news');

  const index: SearchIndexEntry[] = news
    // Same draft policy as `src/pages/noticias/[...page].astro`: drafts are
    // visible in dev but excluded from the production build.
    .filter((entry) => (import.meta.env.PROD ? !entry.data.draft : true))
    // Most recent first, matching the archive order.
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((entry) => ({
      title: entry.data.title,
      url: `/noticias/${entry.id}/`,
    }));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
