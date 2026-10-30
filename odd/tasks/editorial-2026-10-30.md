# Editorial batch — 2026-10-30

## Objective and authorization

Draft the five approved stories with faithful English companions, sequentially with
one writer at a time. No parallelism, SDD or review activation. The earlier no-push
scope is superseded: the user now explicitly authorizes the parent to commit and
push directly to main for production deployment, then check OpenSEO themselves.
This integration worker must not commit, push, merge or create a PR. No PR is being
created and no review-budget size exception consent is inferred. Published content
may only change to clear previous featured flags during final promotion.
RDD is globally OFF according to the current parent verification; never enable it.
Branch: `feat/editorial-2026-10-30` (created from clean `main`).

## Tasks and delegation routes

- [x] 1. Fairbuds 2: verify SoundGuys' original lab review, obtain local source
  images, draft the Spanish audio article, apply article SEO, validate cover/quality.
  Route: current writer performs research → assets → writing sequentially;
  parent handles English translation and eventual paired work-unit commit.
- [x] 2. Ultrahuman Ring Pro hands-on: verify original source and regional claims,
  obtain assets, draft Spanish and SEO. Route: parent → one sequential writer
  for research → assets → writing; parent translates and commits the pair.
- [x] 3. EasySMX S10 Lite review: verify original source, obtain assets, draft
  Spanish and SEO. Route: parent → one sequential writer for research → assets
  → writing; parent translates and commits the pair.
- [x] 4. Persistent HomePod audio on Mac guide: verify every original step,
  obtain assets, draft Spanish and SEO. Route: parent → one sequential writer
  for research → assets → writing; parent translates and commits the pair.
- [x] 5. Windows battery drain/SleepStudy guide: verify commands and limitations,
  obtain assets, draft Spanish and SEO. Route: parent → one sequential writer
  for research → assets → writing; parent translates and commits the pair.
- [x] 6. Parent integration: generate each English companion through the authorized model fallback; handle
  translation failures only within authorized boundaries; decide promotion,
  regenerate the published index, run final build, strict covers/quality and
  sitemap validation. Record exact results and paired commit identities.

## Acceptance and checks

Each Spanish article: neutral professional Spanish, at least 400 meaningful words,
description 70–160 characters, original-source attribution, verified publication
date, no author override, no fabricated hands-on, local cover at least 1200px wide
without upscaling. Both promotion flags remain false in writer output.
English companions faithfully mirror the final Spanish master and full
`translationOf` ID. Never backfill older articles or rename published URLs.
Per-writer checks: `npm run covers -- --strict`, `npm run quality -- --strict`;
no build, translation or commit for the incomplete Spanish-only unit.

## TDD and runtime applicability

No explicit TDD setting is declared in AGENTS.md or package.json; no setting is
inferred. This unit is passive editorial MDX/assets, not runtime logic, so red/green
runtime TDD and runtime harness execution are N/A. Editorial validation and source
verification are applicable. Final rendering/build checks belong to the parent.

## Delivery strategy and forecast

`delivery_strategy: ask-on-risk`. Advisory review budget: 400 authored additions
plus deletions, not a cap and never a reason to compress prose or omit evidence.
Forecast: approximately 500–750 authored lines across ten ES/EN entries plus this
document; approximately 45–70 lines for the first Spanish entry and 90–140 for its
eventual pair. Generated index changes and binary assets are tracked separately.
The batch forecast exceeds 400. Current parent delivery is explicitly authorized
direct-main commit/push, not a PR or an inferred size exception. Suggested work
units remain one ES/EN pair with its checks and progress documentation; this worker
creates no commit. Actual commit identities remain pending parent delivery.
Rollback boundary: remove only this batch's new article pair/assets and its task
progress; do not revert unrelated existing content. Final integration is separate.

## Progress and evidence

- Planning initialized before source writes; Engram full-document mirror uses
  topic `odd/editorial-2026-10-30/tasks` (saved; refresh with this progress).
- Parent reports `npm run find -- Fairbuds` found no matches and the proposed
  Spanish slug is free. Contrast index consulted; generated 2026-10-26, so direct
  topic checks remain authoritative. No article directory listing performed.
- SoundGuys original review successfully opened; confirms €119 original price,
  November 2, 2026 release date, replaceable batteries and 5h29 ANC lab runtime.
  Release is still future on shell date 2026-10-30; do not claim current availability.
- First Spanish master written at
  `src/content/news/audio/fairbuds-2-auriculares-reparables-precio/index.mdx`:
  58 authored lines, nine local editorial images; cover JPEG 1920×1080, unscaled.
  Description: 153 characters. Original review supplies all product claims;
  launch date/price attributed to SoundGuys, not independently confirmed by maker.
- Article SEO pass: no changes necessary; topic in introduction/H2, four-level
  heading limit respected (only H2 sections), descriptive image alts, preserved
  source/promotion/date, existing contextual Sonos Ace Ultra target verified on disk.
- `npm run covers -- --strict`: PASS (exit 0), 1280 entries, 354 baseline
  undersized, zero new undersized, zero unreadable; 19 existing missing covers.
- `npm run quality -- --strict`: PASS (exit 0), 1280 entries, 331 baseline
  failures, zero new failures. Both commands run once after writing.
- Current authored lines: 58 article + this evolving document; pair and batch
  forecasts unchanged. No build, English, index regeneration, commit or push.
- Task 1 remains open until parent generates English and verifies/commits pair;
  remaining tasks and delivery decision are pending parent orchestration.
- Self-evaluation: accuracy 4/5 (manufacturer availability unconfirmed, attribution
  explicit); completeness 4/5 (Spanish scope complete, paired delivery intentionally
  pending); clarity 4/5 (nine source images lengthen reading); actionability 4/5
  (parent must translate/build); conciseness 4/5 (detailed mandatory tracking).
  Overall 4.0/5. Priorities: parent translation/build; confirm retail availability
  before publication. Scoped result is useful, not a completed publication claim.
- Task 2 Spanish master ready at
  `src/content/news/wearables/ultrahuman-ring-pro-anillo-sin-suscripcion/index.mdx`:
  58 lines, 718 whitespace-counted body words, 158-character description, four H2s.
  Shell date verified as 2026-10-30. Tom's Guide original hands-on opened and dated
  October 30; news is US retail arrival at $479, not a global unveiling. Core
  features have no subscription; 15-day runtime remains an untested claim and
  Spanish price/distribution unconfirmed. No first-hand testing asserted.
- Ultrahuman official US product page corroborates titanium unibody, ProRelease
  and up-to-45-day case claim. All eight editorial photographs downloaded from
  Tom's Guide CDN, credited to Dan Bracaglia: cover and images 2–4/6–8 are
  2560×1440; image 5 is 2560×1439. No upscaling, hotlinks or baseline edits.
- Task 2 article SEO: no changes necessary after drafting; description, entity
  placement, H2 hierarchy, descriptive alts and source integrity checked. Related
  Ultrahuman medical-history article target verified on disk and linked in context.
  Source selection resolved to local press skill, wearables persona, delegation
  and frontmatter contracts; installed seo-audit article contract loaded.
- Task 2 checks run once each: `npm run covers -- --strict` PASS (exit 0), 1281
  entries, 354 baseline undersized, zero new, zero unreadable, 19 existing missing;
  `npm run quality -- --strict` PASS (exit 0), 1281 entries, 331 baseline failures,
  zero new. No build, English, commit, push or index regeneration by this writer.
- Task 2 remains open for parent English generation, final verification and paired
  commit. Fairbuds progress preserved; delivery forecast/decision gate unchanged.
- Task 2 self-evaluation: accuracy 4/5 (US retail price rests on original reporter;
  regional and test limits explicit), completeness 5/5 (authorized ES/assets/checks
  scope complete), clarity 4/5 (eight required photos interrupt reading),
  actionability 4/5 (parent translation/build still needed), conciseness 4/5
  (718 body words plus mandatory tracking). Overall 4.2/5. Improvements: parent
  verifies rendered pair; confirm Spanish offer before any local purchase claim.
- Task 3 Spanish master ready at
  `src/content/news/consolas/easysmx-s10-lite-mando-switch-2/index.mdx`:
  46 lines, 726 whitespace-counted body words, four H2s, final description 157
  characters. Engadget original review by Jessica Conditt dated October 29 verified;
  observations attributed to reviewer, not our own tests. Official Spain/EUR page
  shows €36.95; checkout determines shipping/taxes/discounts. Official compatibility
  fix currently offers PC updating, with app updating still marked coming soon.
- Task 3 has one editorial photograph, credited to Engadget: downloaded linked
  `l-intro` original at 1600×900, replacing its 780×438 default without upscaling.
  SEO pass shortened description from 161 to 157 characters; topic placement,
  four H2s, descriptive cover alt and existing Turtle Beach Rematch internal target
  verified. Headline, tags, date and promotion unchanged.
- Task 3 checks run once each: covers strict PASS (exit 0), 1282 entries, 354
  baseline undersized, zero new/unreadable, 19 existing missing. Quality strict
  initially FAIL (exit 1), solely own 161-character description. Fixed only own
  description; final targeted assertions PASS for 157 characters, word count,
  source/date/flags, headings, local asset and internal target. Global quality not
  rerun, preserving the once-only writer instruction; parent must verify final pair.
- Task 3 remains open for EN, integration checks and paired commit. Prior Fairbuds
  and Ultrahuman progress preserved; forecast and parent delivery gate unchanged.
  No EN, build, index regeneration, commit, push, SDD, review or child agents.
  skill_resolution: local press/delegation/consolas persona/frontmatter contracts
  and installed seo-audit article contract loaded; self-evaluation skill applied.
- Task 3 self-evaluation: accuracy 4/5 (firmware claims manufacturer-attributed,
  no independent testing), completeness 4/5 (global final quality awaits parent),
  clarity 4/5 (four explicit decision sections), actionability 4/5 (EN/build/pair
  checks pending), conciseness 4/5 (726 useful body words). Overall 4.0/5. Highest
  priority: parent reruns strict quality and verifies translated/rendered pair.
- Task 4 Spanish master ready at
  `src/content/news/tutoriales/configurar-homepod-altavoz-predeterminado-mac/index.mdx`:
  61 lines, 696 whitespace-counted body words, final description 149 characters.
  Shell date verified as 2026-10-30. Cult of Mac guide by Ed Hardy dated October 29
  supplies all three menu steps and hardware/software prerequisites. Apple release
  notes dated October 28 corroborate persistent AirPlay in HomePod software 27.2,
  but do not independently specify the Mac/hardware prerequisites on that page.
- Task 4 includes both source editorial images, no advertisements: illustrative
  cover 1500×843 WebP (actual download, despite HTML claiming 2040w), screenshot
  1600×900 JPEG. No upscaling; cover credited to shyam mishra/Pexels via Cult of Mac,
  screenshot to Cult of Mac. Existing HomePod product article linked contextually;
  this is a configuration guide, not a repeat of the October 14 announcement.
- Task 4 SEO pass shortened description from 163 to 149 characters after validation;
  keyword introduction/H2, heading hierarchy, descriptive alts, verified internal
  target and attribution checked. Title, tags, date and promotion unchanged.
- Task 4 checks run once each: covers strict PASS (exit 0), 1283 entries, 354
  baseline undersized, zero new/unreadable, 19 existing missing. Quality strict
  initially FAIL (exit 1), solely own 163-character description; corrected only
  own description. Final targeted assertions PASS (149 characters, 696 body words,
  source/date/flags, local assets and internal target). Parent must rerun global
  quality; no repeat global check under the once-only writer instruction.
- Task 4 remains open for EN, final integration checks and paired commit. Previous
  Fairbuds, Ultrahuman and EasySMX evidence preserved; forecast/delivery gate unchanged.
  No EN, build, index regeneration, commit, push, SDD, review or child agents.
  skill_resolution: exact local press/delegation/tutoriales persona/frontmatter
  files and installed article SEO contract loaded; self-evaluation skill applied.
- Task 4 self-evaluation: accuracy 4/5 (hardware requirements rely on original guide,
  not independent testing), completeness 4/5 (global final quality awaits parent),
  clarity 4/5 (English labels accompany translated menu names), actionability 4/5
  (no source-backed repair sequence available), conciseness 4/5 (696 body words).
  Overall 4.0/5; priority: parent verifies translated/rendered pair and global quality.
- Task 5 Spanish master ready at
  `src/content/news/tutoriales/detectar-aplicaciones-consumen-bateria-portatil-windows/index.mdx`:
  76 lines, 889 whitespace-counted body words, description 155 characters. Shell
  date 2026-10-30 and PCWorld October 29 Mark Hachman original verified. All steps,
  menu labels and the elevated SleepStudy command trace to that original; no Windows
  command executed locally. Microsoft Learn clarifies Modern Standby-only support,
  default three-day reporting and current-working-directory output. Context7 had no
  suitable powercfg corpus; exact Microsoft documentation fetched directly instead.
- Task 5 assets: original cover JPEG 4000×2250; battery screenshot 1200×827;
  SleepStudy overview 1199×892 and details 1199×626, despite HTML claiming 1200w.
  All four source images downloaded locally without upscaling; Mark Hachman/Foundry
  credited. Unrelated calendar-newsletter image and author portraits excluded.
- Task 5 article SEO: no changes necessary after drafting; 155-character description,
  topic in opening/H2, descriptive alts, logical H2s, source integrity and existing
  `/noticias/windows-11-pantalla-bateria/` contextual target verified. No promise of
  doubled battery life; explicit distinction from the source's linked separate guide.
- Task 5 checks run once each: covers strict PASS (exit 0), 1284 entries, 354 baseline
  undersized, zero new/unreadable, 19 existing missing; quality strict PASS (exit 0),
  1284 entries, 331 baseline failures, zero new. No baseline edits or scoped fixes.
- Task 5 remains open for parent EN, final checks and paired commit; all four prior
  writers' progress preserved. No EN/build/index/commit/push/SDD/review/child agents.
  Forecast 500–750 batch lines and parent delivery decision before commits unchanged.
  skill_resolution: exact local press/delegation/tutoriales/frontmatter contracts and
  installed article SEO contract loaded; self-evaluation skill applied.
- Task 5 self-evaluation: accuracy 4/5 (source verification, not Windows runtime
  testing), completeness 5/5 (authorized ES/assets/checks scope covered), clarity 4/5
  (English source labels accompany Spanish labels), actionability 4/5 (rendered pair
  awaits parent), conciseness 4/5 (889 words accommodate support/report caveats).
   Overall 4.2/5; priority: parent checks translated/rendered pair and delivery gate.

## Integration attempt — blocked before publication checks

- Required press/delegation, article SEO and work-unit-commits contracts and this
  document/AGENTS.md loaded. Existing CodeGraph index queried for translator behavior;
  no initialization, installs, mode toggles, review, child agents or remote probing.
- Exactly one translation attempted:
  `npm run translate:en -- audio/fairbuds-2-auriculares-reparables-precio`.
  Exit 1: `Error: no se pudo contactar el endpoint local (http://100.96.164.72:1234/v1): fetch failed`.
  No retry and no companion created by this attempt.
- Discovered that `scripts/translate-en.mjs:444` gives `LMSTUDIO_BASE_URL` precedence
  over its loopback default (`http://127.0.0.1:1234/v1`). The invocation unexpectedly
  targeted a non-loopback address. No credential/session inspection was performed.
  Remaining commands are withheld rather than repeat a remote-target request under
  a local-only boundary or silently override the requested existing defaults.
- Remaining IDs NOT attempted: `wearables/ultrahuman-ring-pro-anillo-sin-suscripcion`,
  `consolas/easysmx-s10-lite-mando-switch-2`,
  `tutoriales/configurar-homepod-altavoz-predeterminado-mac`,
  `tutoriales/detectar-aplicaciones-consumen-bateria-portatil-windows`.
   This historical blocker is superseded by the explicit model-fallback authorization
   below; no further endpoint attempts are permitted.
- Publication readiness is BLOCKED: zero completed EN companions in this worker.
  Promotion, historical edits, index regeneration, strict covers/quality, build,
  sitemaps and ten-route inspection were NOT run. Historical per-article evidence
  above remains intact; no new validation or production readiness is claimed.
- Actual article authored lines remain 299 ES / 0 EN. This document is tracked
  separately; generated index delta is zero and asset additions remain binary.
  Commit IDs for tasks 1–6 remain pending; no source functionality/config changes.
- Rollback boundary: this worker changed only this document; preserve all five ES
  masters/assets and their evidence. TDD/runtime harness remain N/A for passive
  content; final functional build/sitemap checks remain applicable and pending.
- skill_resolution: exact requested local press/delegation, installed article SEO
  reference and installed work-unit-commits loaded; no substitute workflows used.

## Authorized model fallback — integration ready, delivery pending

This section supersedes the historical integration blocker above. The parent explicitly
authorized this model to translate all five masters sequentially, without another
translator invocation, endpoint, remote machine, SSH, credentials or child agents.
All five ES/EN pairs are READY; tasks 1–6 remain unchecked only because their parent
work-unit commits and direct-main delivery are pending. No PR or size exception is
claimed. No code, configuration, dependency, RDD setting or review workflow changed.

English mappings (under `src/content/news-en/`, each with `index.mdx` and copied `assets/`):

| Spanish ID | English ID |
| --- | --- |
| `audio/fairbuds-2-auriculares-reparables-precio` | `audio/fairbuds-2-repairable-earbuds-for-119-euros-with-sound-and-call-limitations` |
| `wearables/ultrahuman-ring-pro-anillo-sin-suscripcion` | `wearables/ultrahuman-ring-pro-subscription-free-ring-reaches-us-stores-for-479-dollars` |
| `consolas/easysmx-s10-lite-mando-switch-2` | `consolas/easysmx-s10-lite-budget-switch-2-controller-with-a-questionable-shell` |
| `tutoriales/configurar-homepod-altavoz-predeterminado-mac` | `tutoriales/how-to-set-homepod-as-your-macs-default-speaker` |
| `tutoriales/detectar-aplicaciones-consumen-bateria-portatil-windows` | `tutoriales/how-to-identify-apps-draining-your-windows-laptop-battery` |

- All five `npm run slug -- --en <slug>` checks: exit 0, `libre` before creation.
  EN descriptions: 152 / 148 / 145 / 144 / 145 characters respectively; EN files:
  57 / 57 / 45 / 60 / 75 lines (294 total). ES files total 299 lines.
- Faithful model translations preserve structure, links, attribution, availability
  caveats and all numeric values (English decimal/thousands punctuation localized).
  Readback assertions passed for metadata/source equality, exact `translationOf`,
  image order, heading counts, identical command blocks and all 24 asset byte copies.
  No separate English SEO pass. HomePod prerequisites and steps, SleepStudy elevation,
  explicit output path, Modern Standby limitation, three-day default and mains/battery
  distinction retained. No independent hands-on or schema-validation claim.
- Promotion: only `src/content/news/audio/fairbuds-2-auriculares-reparables-precio/index.mdx`
  becomes featured; `src/content/news/emuladores/nxnative-juegos-switch-mac/index.mdx`
  changes only `featured: true` to `false`. Previous promotion found through targeted
  frontmatter extraction, not directory dumping. No breaking flags changed.
- `npm run index`: exit 0, 957 Spanish published articles. Generated index only.
- `npm run covers -- --strict`: exit 0, 1289 entries, 354 baseline undersized,
  zero new undersized, zero unreadable; 19 historical missing covers unchanged.
- `npm run quality -- --strict`: exit 0, 1289 entries, 331 baseline failures,
  zero new failures. No baseline changes or publication fixes required.
- `npm run build`: run exactly once, exit 0, 1349 pages in 14.34 seconds;
  8663 image operations including cached output. No build warnings observed.
  Log: `/tmp/opencode/editorial-2026-10-30-build.log` (local evidence, not committed).
- `npm run test:sitemaps`: exit 0, all 7 checks passed; general sitemap 1315 URLs,
  news sitemap 10 URLs. Ten new built routes structurally checked: expected language,
  exact canonical and mutual es/en/x-default hreflang, hero/social/body and srcset image
  files exist in `dist/`. This is static structural evidence, not external schema,
  browser interaction, production deployment or live availability verification.
- All article/promotion/index mutations preceded final strict/build/sitemap checks;
  this closing document records those results afterward. Commits/push/merge/PR: none.
  Parent alone performs authorized direct-main delivery; no integration blocker remains.
- Feature rollback: remove exactly the five new ES folders and five EN folders listed
  above (including assets), restore the prior nxnative featured flag, regenerate the
  index, and remove this feature document/progress. Preserve unrelated content; reverting
  promotion must not leave another new featured flag active. Each pair is an independent
  publication work unit; promotion/index are final integration. All commit IDs pending.
- skill_resolution: requested local press SKILL.md and DELEGATION.md fallback, installed
  article-seo.md and work-unit-commits SKILL.md loaded; self-evaluation applied. Passive
  MDX TDD/runtime harness N/A; no review or extra research performed.
- Self-evaluation: accuracy 4/5 (faithful source-master parity, not independent device
  testing), completeness 5/5 (five companions, promotion/index and all checks), clarity
  4/5 (historical evidence retained alongside explicit current status), actionability
  5/5 (parent can deliver), conciseness 4/5 (long existing task history preserved).
  Overall 4.4/5. Next: parent commit/push and production checks; no extra local rewrite.

## Verified work-unit commits and delivery handoff

Checked tasks supersede historical pending statements above. All pairs passed final
checks before committing; no article bytes or modes changed after verification.
RDD remains globally disabled; no review receipt is claimed. The user explicitly
authorized direct-main commit and push, not a PR.

| Task | Commit | Scope |
| --- | --- | --- |
| 1 | `badffec` | Fairbuds ES/EN, assets and exclusive featured promotion |
| 2 | `fc6bbe8` | Ultrahuman ES/EN and assets |
| 3 | `00d7aa7` | EasySMX ES/EN and assets |
| 4 | `01ad165` | HomePod guide ES/EN and assets |
| 5 | `bee4b8e` | Windows battery guide ES/EN and assets |

Task 6 closes in the integration commit containing this document and the generated
published index. `git fetch origin main` confirmed local main and origin/main
aligned at `66e84c9`; the feature branch started at that same commit. Next: fast-forward
main and push origin main without force. Push and production deployment require
separate confirmation; the successful local build does not prove live availability.
