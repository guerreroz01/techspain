/**
 * Editorial verticals — the single registry of the ten sections.
 *
 * A vertical's `token` is at once:
 *   - the folder name under `src/content/news|news-en/`,
 *   - the leading segment of a nested entry's `id` (`<vertical>/<slug>`),
 *   - the URL segment (`/noticias/<vertical>/<slug>/`, `/noticias/<vertical>/`).
 *
 * New articles live in a vertical folder, so `verticalOf` reads the token from
 * the id. Legacy flat entries (published before this scheme) keep their flat
 * id and are grouped into a hub through their primary `tags[0]` label.
 */

/** Minimal shape shared by the `news` and `newsEn` collections. */
export interface VerticalCandidate {
  id: string;
  data: { tags: string[] };
}

export interface VerticalEntry extends VerticalCandidate {
  data: { tags: string[]; pubDate: Date };
}

export interface Vertical {
  /** Folder name and URL segment (kebab-case ASCII). */
  token: string;
  /** Display label used as `tags[0]` in the Spanish collection. */
  es: string;
  /** Display label used as `tags[0]` in the English collection. */
  en: string;
}

export type Locale = 'es' | 'en';

export const VERTICALS: readonly Vertical[] = [
  { token: 'audio', es: 'Audio', en: 'Audio' },
  { token: 'wearables', es: 'Wearables', en: 'Wearables' },
  { token: 'moviles', es: 'Móviles', en: 'Mobile' },
  { token: 'tutoriales', es: 'Tutoriales', en: 'Tutorials' },
  { token: 'tarjetas-graficas', es: 'Tarjetas gráficas', en: 'Graphics cards' },
  { token: 'memorias', es: 'Memorias', en: 'Memory' },
  { token: 'portatiles', es: 'Portátiles', en: 'Laptops' },
  { token: 'emuladores', es: 'Emuladores', en: 'Emulators' },
  { token: 'consolas', es: 'Consolas', en: 'Consoles' },
  { token: 'componentes', es: 'Componentes', en: 'Components' },
];

/** Lowercase, accent-stripped, trimmed: `Portátiles` and `portatiles` match. */
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

// Legacy entries are grouped by their primary tag. The real corpora use a few
// aliases per vertical (EN: Mobile/Mobiles/Phones/Smartphones), so the map is
// explicit instead of guessing.
const ES_ALIASES: Record<string, string> = {
  audio: 'audio',
  wearables: 'wearables',
  moviles: 'moviles',
  tutoriales: 'tutoriales',
  'tarjetas graficas': 'tarjetas-graficas',
  'tarjetas-graficas': 'tarjetas-graficas',
  memorias: 'memorias',
  portatiles: 'portatiles',
  emuladores: 'emuladores',
  consolas: 'consolas',
  componentes: 'componentes',
};

const EN_ALIASES: Record<string, string> = {
  audio: 'audio',
  wearables: 'wearables',
  mobile: 'moviles',
  mobiles: 'moviles',
  phones: 'moviles',
  smartphones: 'moviles',
  tutorials: 'tutoriales',
  'graphics cards': 'tarjetas-graficas',
  'graphics card': 'tarjetas-graficas',
  'tarjetas graficas': 'tarjetas-graficas',
  'tarjetas-graficas': 'tarjetas-graficas',
  memory: 'memorias',
  laptops: 'portatiles',
  laptop: 'portatiles',
  emulators: 'emuladores',
  emulator: 'emuladores',
  consoles: 'consolas',
  console: 'consolas',
  components: 'componentes',
  component: 'componentes',
};

const ALIASES: Record<Locale, Record<string, string>> = { es: ES_ALIASES, en: EN_ALIASES };

/** Vertical token encoded in a nested id (`audio/foo` -> `audio`), else null. */
export const verticalTokenFromId = (id: string): string | null => {
  const slash = id.indexOf('/');
  return slash === -1 ? null : id.slice(0, slash);
};

/** Last id segment (`audio/foo` -> `foo`; `foo` -> `foo`). */
export const slugFromId = (id: string): string => id.slice(id.lastIndexOf('/') + 1);

/** The vertical a hub URL segment refers to, or undefined when unknown. */
export const verticalByToken = (token: string): Vertical | undefined =>
  VERTICALS.find((vertical) => vertical.token === token);

/**
 * The vertical token an entry belongs to: the id folder for nested entries,
 * else its primary `tags[0]` mapped through the locale aliases. Returns null
 * for legacy entries whose primary tag is not a known vertical label.
 */
export function verticalOf(entry: VerticalCandidate, locale: Locale): string | null {
  const fromId = verticalTokenFromId(entry.id);
  if (fromId) return fromId;
  const primary = entry.data.tags[0];
  if (!primary) return null;
  return ALIASES[locale][normalize(primary)] ?? null;
}

/** Published entries of one vertical, newest first. */
export function articlesByVertical<T extends VerticalEntry>(
  entries: T[],
  token: string,
  locale: Locale,
): T[] {
  return entries
    .filter((entry) => verticalOf(entry, locale) === token)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
