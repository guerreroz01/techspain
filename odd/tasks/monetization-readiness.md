# Monetization readiness

## Objective

Make the six existing AdSense placements activatable from one file, so the site can
start earning the moment real ad units exist. No behaviour change while slot ids are
empty.

## Problem

`ADS.enabled = true` and `ADS.client = 'ca-pub-5346680680468175'` are real, consent
gating is implemented, and six `<AdSlot />` placements exist. But `AdSlot.astro`
only renders when the caller passes a `slot` id, and **all six call sites pass
nothing**. In production `showUnit` is `false` everywhere: the site renders zero ads.

To fix it today someone must edit six files. That is a footgun and a reason ads have
stayed off.

## Scope

In scope: a named slot registry in `src/consts.ts`, resolution inside
`AdSlot.astro`, and the six call sites passing a semantic name.

Out of scope (account-level, cannot be done from this repo): creating AdSense ad
units, enabling Auto ads, configuring a Google-certified CMP, connecting GA4 to
OpenSEO. Recorded below as owner actions.

## Constraints

- No visual or behavioural change while every slot id is empty.
- No invented slot ids: an `<ins>` with an empty `data-ad-slot` logs a TagError.
- Do not touch slugs, editorial line or verticals: URLs are indexed.
- Consent model stays as-is (`CONSENT`, `data-consent`).

## Tasks

- [ ] M1 — Add `ADS.slots` registry (homeTop, homeMid, article, archive, hub). Route: inline (single mechanical config unit).
- [ ] M2 — `AdSlot.astro`: accept `name`, resolve through the registry, keep explicit `slot` override. Route: inline (2 small files, already understood).
- [ ] M3 — Wire the six call sites to semantic names. Route: inline (mechanical one-line edits).
- [ ] M4 — `npm run build` passes and no `AdSlot` renders without an id.

## Acceptance criteria

- With every slot id empty, build output contains no rendered ad unit (same as today).
- Setting one id in `consts.ts` makes every placement bound to that name emit a
  real `<ins class="adsbygoogle" data-ad-slot="...">`.
- Explicit `slot="..."` still overrides the registry.

## Verification

`npm run build`, then grep the built HTML for `data-ad-slot` (must be absent while
ids are empty).

## Known blockers outside the repo

1. Ad units do not exist yet — no slot ids to paste.
2. Spain is ~49% of traffic and sits in the EEA: AdSense will not serve there
   without a Google-certified CMP. The custom banner is not one. Free fix:
   AdSense → Privacy & messaging → GDPR message.
3. Display ads at ~550 clicks/month cannot carry the project. The pages that do
   convert (`fitbit charge 7`, `oppo find x10`, `suunto race 3s`, `apple watch
   ultra 2 vs 4`) have purchase intent: affiliate is the realistic early revenue.
