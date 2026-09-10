/**
 * Central site configuration.
 * Edit these values to customize the portal without touching components.
 */

export const SITE = {
  title: 'Tecnología Hoy',
  description:
    'Noticias de tecnología en español: inteligencia artificial, hardware, software y la industria que las mueve.',
  author: 'Redacción Tecnología Hoy',
  // `import.meta.env.SITE` comes from the `site` option in astro.config.mjs.
  url: import.meta.env.SITE ?? 'https://example.com',
  lang: 'es',
} as const;

/** Primary navigation. */
export const NAV = [
  { label: 'Inicio', href: '/' },
  { label: 'Noticias', href: '/noticias' },
  { label: 'Acerca', href: '/acerca' },
] as const;

/** Social profiles shown in the footer. Replace the placeholder URLs. */
export const SOCIAL = [
  { label: 'GitHub', href: 'https://github.com/usuario' },
  { label: 'X', href: 'https://x.com/usuario' },
] as const;

/**
 * AdSense configuration.
 * Keep `enabled: false` until you have a real publisher id.
 * When enabling, set `client` to something like `ca-pub-0000000000000000`.
 */
export const ADS = {
  enabled: false,
  client: '',
} as const;
