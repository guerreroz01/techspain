/**
 * Related/random article recommendation, shared by the Spanish
 * (`/noticias/<slug>/`) and English (`/en/news/<slug>/`) article routes.
 *
 * The scoring algorithm lives here exactly as it did inside the Spanish route's
 * `getStaticPaths`: tag overlap weighted by inverse document frequency, plus a
 * slug-family bonus, with a build-time Fisher–Yates shuffle for the random
 * trio. It is generic over the entry type so one algorithm serves both
 * collections (`news` and `newsEn`) — each route passes its own visible corpus.
 *
 * Nothing here runs per-visit: every call happens during the static build, so
 * results are frozen into the HTML until the next deploy (AGENTS.md §14).
 */

/** Minimal shape the recommendation logic needs. Both collections satisfy it. */
export interface ArticleLike {
  id: string;
  data: {
    tags: string[];
    pubDate: Date;
  };
}

/** Per-corpus statistics, computed once per route, reused for every entry. */
export interface RecommendationStats<T extends ArticleLike> {
  /** Normalized tag set per entry id (trimmed + lowercased). */
  tagSets: Map<string, Set<string>>;
  /** IDF weight for a normalized tag inside this corpus. */
  tagWeight: (tag: string) => number;
  /** Pre-split slug tokens per entry id. */
  slugTokens: Map<string, string[]>;
}

// Tag comparison is normalized (trimmed + lowercased) because the corpus has
// real casing and fragmentation defects ('Inteligencia Artificial' vs
// 'Inteligencia artificial'). Normalizing at comparison time keeps the article
// files untouched.
const normalizeTag = (tag: string) => tag.trim().toLowerCase();

/**
 * Build the statistics for a corpus. Call once per route with the visible
 * entries of that locale's collection.
 */
export function computeStats<T extends ArticleLike>(entries: T[]): RecommendationStats<T> {
  // Each entry's normalized tag set is built exactly once, never per pair.
  const tagSets = new Map<string, Set<string>>();
  for (const entry of entries) {
    tagSets.set(entry.id, new Set(entry.data.tags.map(normalizeTag)));
  }

  // Document frequency: how many visible entries carry each normalized tag.
  const documentFrequency = new Map<string, number>();
  for (const tags of tagSets.values()) {
    for (const tag of tags) {
      documentFrequency.set(tag, (documentFrequency.get(tag) ?? 0) + 1);
    }
  }

  const total = entries.length;

  // Inverse-document-frequency weight. A rare tag weighs far more than a broad
  // vertical, so no "brand beats vertical" rule needs to be hardcoded. Guarded
  // against an empty corpus.
  const tagWeight = (tag: string) => {
    const df = documentFrequency.get(tag) ?? 0;
    return df > 0 && total > 0 ? Math.log(total / df) : 0;
  };

  const slugTokens = new Map<string, string[]>();
  for (const entry of entries) {
    slugTokens.set(entry.id, entry.id.split('-'));
  }

  return { tagSets, tagWeight, slugTokens };
}

// Shared leading hyphen-separated tokens between two slugs, e.g.
// `iphone-18-pro-teardown-critique` vs `iphone-18-pro-1tb-qlc` -> 3.
const sharedPrefixLength = (aTokens: string[], bTokens: string[]) => {
  const max = Math.min(aTokens.length, bTokens.length);
  let shared = 0;
  while (shared < max && aTokens[shared] === bTokens[shared]) shared++;
  return shared;
};

// Rewards real slug families (iphone-18-pro-*, oppo-find-x10-*, ...).
const slugFamilyBonus = (shared: number) => (shared >= 3 ? 1.5 : shared === 2 ? 0.5 : 0);

/** Up to 3 related entries, ranked by weighted tag overlap + slug family. */
export function relatedFor<T extends ArticleLike>(
  entry: T,
  visible: T[],
  stats: RecommendationStats<T>,
): T[] {
  const { tagSets, tagWeight, slugTokens } = stats;
  const tags = tagSets.get(entry.id) ?? new Set<string>();

  // An entry with no tags has nothing editorial to match on. Return empty
  // rather than matching on the slug bonus alone.
  if (tags.size === 0) return [];

  return visible
    .filter((candidate) => candidate.id !== entry.id)
    .map((candidate) => {
      const candidateTags = tagSets.get(candidate.id) ?? new Set<string>();
      let score = 0;
      for (const tag of tags) {
        if (candidateTags.has(tag)) score += tagWeight(tag);
      }
      score += slugFamilyBonus(
        sharedPrefixLength(slugTokens.get(entry.id) ?? [], slugTokens.get(candidate.id) ?? []),
      );
      return { candidate, score };
    })
    .filter((scored) => scored.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.candidate.data.pubDate.valueOf() - a.candidate.data.pubDate.valueOf();
    })
    .slice(0, 3)
    .map((scored) => scored.candidate);
}

// Fisher–Yates shuffle over a copy, so the input array is never mutated.
const shuffle = <T,>(input: T[]): T[] => {
  const result = [...input];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * A random trio, resolved at BUILD TIME ONLY. `Math.random()` runs here inside
 * `getStaticPaths`, so the trio is frozen into the generated HTML until the
 * next deploy. Two builds of identical content will legitimately differ — that
 * non-determinism is intentional, not a bug (AGENTS.md §14). Per-visit
 * randomness would require client-side JavaScript and is forbidden.
 */
export function randomFor<T extends ArticleLike>(
  entry: T,
  related: T[],
  visible: T[],
): T[] {
  // Exclude the entry itself and every article already shown in the related
  // block, so the two blocks on one page can never link the same article twice.
  const excluded = new Set<string>([entry.id, ...related.map((item) => item.id)]);
  const pool = visible.filter((candidate) => !excluded.has(candidate.id));
  return shuffle(pool).slice(0, 3);
}
