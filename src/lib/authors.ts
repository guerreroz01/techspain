/**
 * Editorial authors — one writer per vertical.
 *
 * A new article lives in `<vertical>/<slug>/`, so its `entry.id` carries the
 * vertical token. That token is the single source of truth for the section's
 * writer, exactly as it already is for the article's folder and URL: the byline
 * can never disagree with the section it belongs to.
 *
 * The model is go-forward only. Only nested ids carry a token, so legacy flat
 * entries (`<slug>`) fall back to the site-wide byline instead of being
 * re-signed. An explicit frontmatter `author` still overrides everything, which
 * is what keeps already-published entries rendering exactly as they did.
 *
 * The voice of each writer (how they open, their rhythm, their lexicon) lives
 * in `skills/redaccion-prensa/redactores/<token>.md`. This registry holds only
 * the public identity: byline, role, bio and editorial angle.
 */

import { SITE } from '../consts';
import { verticalTokenFromId, type Locale } from './verticals';

export interface Author {
  /** Public byline. A person's name, so it is language-neutral (ES and EN). */
  name: string;
  /** URL-safe id, reserved for the phase-2 author profile pages. */
  slug: string;
  /** Editorial role, shown on the author profile. */
  role: string;
  /** Short Spanish bio. */
  bio: string;
  /** What this writer emphasises in their pieces. */
  angle: string;
}

/** Keyed by vertical token — the folder/URL segment from `verticals.ts`. */
export const AUTHORS: Record<string, Author> = {
  audio: {
    name: 'Marta Ruiz',
    slug: 'marta-ruiz',
    role: 'Redactora de Audio',
    bio: 'Cubre hardware de sonido con oído crítico: auriculares, altavoces, micrófonos y cadena de amplificación. Escribe desde el uso real y los datos, no desde el folleto.',
    angle: 'Fidelidad, relación calidad-precio y qué cambia respecto al modelo anterior.',
  },
  wearables: {
    name: 'Diego Salas',
    slug: 'diego-salas',
    role: 'Redactor de Wearables',
    bio: 'Sigue relojes, anillos y gafas inteligentes con escepticismo sano. Traduce especificaciones a lo que de verdad se nota en la muñeca o en la cara.',
    angle: 'Autonomía real, precisión de sensores y utilidad diaria frente al marketing.',
  },
  moviles: {
    name: 'Lucía Vega',
    slug: 'lucia-vega',
    role: 'Redactora de Móviles',
    bio: 'Cubre el mercado móvil con foco en precio, disponibilidad en España y soporte a largo plazo. Desconfía del hype de cámara.',
    angle: 'Qué compra conviene, por cuánto y durante cuántos años de actualizaciones.',
  },
  tutoriales: {
    name: 'Andrés Molina',
    slug: 'andres-molina',
    role: 'Redactor de Tutoriales',
    bio: 'Escribe guías paso a paso sin relleno. Cada ruta de menú y cada ajuste salen del original; si no se puede verificar, no se publica.',
    angle: 'Que el lector termine la tarea sin dudas y sepa qué puede fallar por el camino.',
  },
  'tarjetas-graficas': {
    name: 'Nadia Ortiz',
    slug: 'nadia-ortiz',
    role: 'Redactora de Tarjetas gráficas',
    bio: 'Analiza GPU en términos de rendimiento por vatio y precio por fotograma, con juegos y resoluciones concretas.',
    angle: 'Rendimiento medible y eficiencia, no cifras de escaparate.',
  },
  memorias: {
    name: 'Bruno Delgado',
    slug: 'bruno-delgado',
    role: 'Redactor de Memorias',
    bio: 'Cubre RAM, almacenamiento y latencias con rigor. Siempre enmarca timings y compatibilidad en la plataforma concreta.',
    angle: 'Estabilidad, compatibilidad y ganancia real de una mejora.',
  },
  portatiles: {
    name: 'Clara Ibáñez',
    slug: 'clara-ibanez',
    role: 'Redactora de Portátiles',
    bio: 'Evalúa portátiles por cómo se usan: batería, pantalla, teclado y térmica antes que el benchmark sintético.',
    angle: 'La experiencia de uso sostenida, no el pico de laboratorio.',
  },
  emuladores: {
    name: 'Iván Cordero',
    slug: 'ivan-cordero',
    role: 'Redactor de Emuladores',
    bio: 'Sigue el desarrollo de emuladores de consola en Windows, macOS, Linux y Android. Le importa el estado real, la compatibilidad y los pasos de instalación.',
    angle: 'Qué se puede jugar hoy y cómo llegar ahí sin sorpresas.',
  },
  consolas: {
    name: 'Sara Lozano',
    slug: 'sara-lozano',
    role: 'Redactora de Consolas',
    bio: 'Cubre consolas de sobremesa y portátiles desde el punto de vista del jugador: catálogo, servicios y retrocompatibilidad.',
    angle: 'La decisión de compra y el soporte a lo largo de la generación.',
  },
  componentes: {
    name: 'Tomás Riera',
    slug: 'tomas-riera',
    role: 'Redactor de Componentes',
    bio: 'Escribe de componentes de PC con mentalidad de taller: VRM, disipación, ruido y compatibilidad física.',
    angle: 'Elegir bien las piezas y montarlas sin sorpresas.',
  },
  drones: {
    name: 'Álvaro Nieto',
    slug: 'alvaro-nieto',
    role: 'Redactor de Drones',
    bio: 'Cubre drones, FPV y cámaras aéreas: qué se puede volar de verdad, cómo se comporta la imagen y si el precio se sostiene frente a la competencia.',
    angle:
      'Experiencia de vuelo real y calidad de imagen medida; compara con DJI y distingue lo que se vuela de lo que se promete.',
  },
};

/** The writer of a vertical token, or undefined when the token is unknown. */
export const authorForVertical = (token: string): Author | undefined => AUTHORS[token];

/** Minimal structural shape shared by the `news` and `newsEn` entries. */
interface BylineEntry {
  id: string;
  data: { author?: string };
}

const FALLBACK_BYLINE: Record<Locale, string> = {
  es: SITE.author,
  en: 'TechSpain24 Staff',
};

/**
 * Resolve the byline of an entry.
 *
 * Order: an explicit frontmatter `author` (legacy entries and one-off overrides)
 * → the writer of the nested vertical → the site-wide fallback. The vertical is
 * read from the id, never from `tags[0]`, so legacy flat entries are never
 * re-signed by this feature.
 */
export function bylineFor(entry: BylineEntry, locale: Locale = 'es'): string {
  if (entry.data.author) return entry.data.author;
  const token = verticalTokenFromId(entry.id);
  const author = token ? authorForVertical(token) : undefined;
  return author?.name ?? FALLBACK_BYLINE[locale];
}
