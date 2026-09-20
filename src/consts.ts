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
 * Enabling ads is a single switch: set `enabled: true` and `client` to
 * something like `ca-pub-0000000000000000`. Everything else (the loader, the
 * consent category and the ad slots) reacts to these two values.
 */
export const ADS = {
  enabled: false,
  client: '',
} as const;

/** Ads only run when the switch is on AND a publisher id is set. */
export const ADS_ACTIVE = ADS.enabled && ADS.client.length > 0;

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

/**
 * Cookie consent model.
 *
 * `necessary` storage (the decision itself and the theme preference) needs no
 * consent. The other categories are only *offered* when the matching service is
 * enabled in this build, so disabling analytics or ads removes the category
 * from the notice without any other change.
 *
 * State is stored as JSON under `storageKey`:
 *   { necessary: true, analytics: boolean, advertising: boolean, updatedAt: ISO }
 *
 * The legacy binary key (`legacyKey`) is migrated on first load: `granted` maps
 * to `analytics: true`, `denied` to `analytics: false`. Visitors who already
 * decided are never asked again.
 */
export const CONSENT = {
  storageKey: 'consent-preferences',
  legacyKey: 'consent-analytics',
  categories: {
    analytics: { available: GA_ACTIVE },
    advertising: { available: ADS_ACTIVE },
  },
} as const;

/**
 * The notice is shown when at least one non-essential category can be enabled.
 * With analytics and ads both off there is nothing to ask for.
 */
export const CONSENT_ACTIVE = CONSENT.categories.analytics.available || CONSENT.categories.advertising.available;

/**
 * Legal identification of the site owner, required by the LSSI-CE (Ley
 * 34/2002). Kept here so the legal pages never hardcode the data twice.
 */
const legalUpdated = new Date('2026-09-20T00:00:00.000Z');

export const LEGAL = {
  owner: 'Oliver Rafael Reyes Marquez',
  taxId: '61053122J',
  address: 'Concepción Arenal 19, Ferrol, España',
  email: 'oliverreyesmarquez27@gmail.com',
  country: 'España',
  jurisdiction: 'España',
  updated: legalUpdated,
  updatedLabel: new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(legalUpdated),
} as const;
