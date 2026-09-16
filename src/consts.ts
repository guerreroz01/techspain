/**
 * Central site configuration.
 * Edit these values to customize the portal without touching components.
 */

export const SITE = {
  title: 'TechSpain',
  description:
    'Noticias de tecnología en español: inteligencia artificial, hardware, software y la industria que las mueve.',
  author: 'Redacción Tecnología Hoy',
  // `import.meta.env.SITE` comes from the `site` option in astro.config.mjs.
  url: import.meta.env.SITE ?? 'https://techspain24.com',
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
  { label: 'GitHub', href: 'https://github.com/guerreroz01' },
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

/**
 * Google Analytics 4 configuration.
 *
 * Analytics is opt-in for visitors: nothing is requested from Google and no
 * cookie is set until the cookie notice is accepted. Set `enabled: false` to
 * turn the notice and the loader off entirely.
 */
export const GA = {
  enabled: true,
  measurementId: 'G-23GTC9SZCF',
} as const;

/**
 * Analytics only runs when the switch is on AND a measurement id is set.
 * Every component gates on this single flag.
 */
export const GA_ACTIVE = GA.enabled && GA.measurementId.length > 0;
