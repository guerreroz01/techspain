import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';

export async function GET(context) {
  const news = await getCollection('news', ({ data }) => !data.draft);

  const items = news
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: `/noticias/${entry.id}/`,
    }));

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
    customData: `<language>${SITE.lang}</language>`,
  });
}
