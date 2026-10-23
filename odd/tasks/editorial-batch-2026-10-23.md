# Editorial batch — 2026-10-23

## Objective, authority and route

Prepare the seven user-selected technology stories for a later local bilingual editorial drafting batch. This is direct ODD, not SDD. Current delegation authorizes PREPARATION ONLY: create a feature branch, this task document and a safe candidate append. No article writes, writers launched, translation calls, commits, staging, push, PR, publication or deployment are authorized in this preparation step.

- Branch: `feat/editorial-batch-2026-10-23`, created from clean `main` without overwriting a branch.
- Implementation route: delegated direct. The user explicitly requested parallel writers; the parent will own one isolated Spanish article folder per writer (E1–E7). This preparation worker must not spawn children. Writers must not overlap folders, edit shared tracking/candidate/index files, generate EN companions or run builds.
- Scope: seven Spanish masters, later seven faithful English companions, then orchestrator-owned promotion and validation. No runtime, routing, schema, configuration or published-slug changes.
- English is mandatory but pending; no story is complete without both languages and observed applicable checks.
- Parent-reported topic duplicate checks: `npm run find` found no matches for Ultimate 3E, TT Pro, Rest to Open, Insta360 Mic, Q990H, View 590, ns2jb, pepsipu or smilehax. This worker did not repeat those checks. Recheck only if the publication state changes before delegation.

## Effective TDD and applicable checks

- Applicability: software RED/GREEN/REFACTOR is N/A for passive editorial artifacts with no source behavior changes. Structural/content validation remains mandatory, not waived.
- Source: explicit preparation instruction limits this batch to passive content validation; repository `AGENTS.md` sections 3, 6–7 and the delegation playbook define the applicable runners. No explicit project TDD on/off selector was found in repository instructions, `.atl/` (registry/cache only), package scripts, known local/global Gentle config paths, or TDD-specific keys in global OpenCode configuration. Installed agents and test scripts do not enable TDD. Do not claim a configured global on/off mode; resolve it separately if behavior-changing work is proposed. Do not invoke SDD initialization.
- Runners: `npm run covers -- --strict`, `npm run quality -- --strict`, exactly one final `npm run build`, then `npm run test:sitemaps`, and `npm run index` as the batch-closing step. These are planned, NOT executed during preparation.
- Runtime harness: N/A for this preparation; no new runtime boundary. A future build verifies static content integration, not hands-on hardware testing or live deployment.

## Skill resolution

`skill_resolution: paths-injected` — loaded exact paths for `skills/redaccion-prensa/SKILL.md`, `skills/redaccion-prensa/DELEGATION.md`, `/home/kali/.agents/skills/work-unit-commits/SKILL.md`, repository `AGENTS.md`, and `/home/kali/.config/opencode/skills/seo-audit/SKILL.md`.

Registry `.atl/skill-registry.md` lines 240 and 275 confirms the SEO and work-unit skill paths. Verified article SEO contract exists at `/home/kali/.config/opencode/skills/seo-audit/references/article-seo.md`; each future writer must read it, its vertical persona and `skills/redaccion-prensa/assets/frontmatter-template.md` before writing. No article SEO pass has run yet.

## Acceptance criteria

- Every E1–E7 writer produces only its Spanish `index.mdx` and colocated assets, in neutral/professional Spanish, with original-source attribution, verified facts and real tutorial steps. Do not claim original hands-on testing of a relayed review.
- Covers are at least 1200 px wide; descriptions are 70–160 characters; bodies meet the strict quality check (at least 400 words); no leading H1 or manually assigned author; no baseline expansion.
- Spanish slugs remain the checked canonical IDs below. Each writer leaves `featured: false` and `breaking: false`, records images, attributed source and SEO changes, and never runs the build.
- The parent generates EN from final Spanish masters, preserving facts, assets, source and date, with full `translationOf` IDs and available English slugs. No EN promotion fields and no legacy backfill.
- Exactly one batch lead is chosen centrally after all returns; previous lead changes, if needed, are explicitly recorded. `breaking` only for genuinely urgent same-day news. No publication/deployment is implied by local draft readiness.
- All required checks have observed results before final readiness; failed or unavailable items remain pending rather than marked complete. No task checkbox is delivery authority.

## Stable tasks (completed 2026-10-23)

- [x] **E1 — Spanish draft: 8BitDo Ultimate 3E.** Delegated isolated writer; canonical ID `consolas/8bitdo-ultimate-3e-llega-europa-mando-xbox-pc`. Verify Europe availability, Xbox/PC compatibility and price from the selected original. Own only `src/content/news/consolas/8bitdo-ultimate-3e-llega-europa-mando-xbox-pc/`. Apply article SEO and strict cover/quality validation; return proof. EN pending.
- [x] **E2 — Spanish draft: GuliKit TT Pro.** Delegated isolated writer; canonical ID `consolas/gulikit-tt-pro-alternativa-mando-switch-2`. Verify Switch 2 compatibility and actual differentiators without inventing testing. Own only its matching Spanish folder. Apply article SEO and strict cover/quality validation; return proof. EN pending.
- [x] **E3 — Spanish tutorial: iPhone Duo Touch ID without swiping.** Delegated isolated writer; canonical ID `tutoriales/como-desbloquear-iphone-duo-touch-id-sin-deslizar`. Read the tutorial variant and verify every Rest to Open step, setting name and limitation against the original. Own only its matching Spanish folder. Apply article SEO and strict cover/quality validation; return proof. EN pending.
- [x] **E4 — Spanish draft: Insta360 Mic.** Delegated isolated writer; canonical ID `audio/insta360-mic-pantalla-tinta-electronica-grabacion-32-bits`. Verify display, recording format, availability and compatibility. Own only its matching Spanish folder. Apply article SEO and strict cover/quality validation; return proof. EN pending.
- [x] **E5 — Spanish draft: Samsung Q990H.** Delegated isolated writer; canonical ID `audio/samsung-q990h-analisis-barra-sonido-dolby-atmos`. Attribute review findings to the actual reviewer; no false first-person testing. Own only its matching Spanish folder. Apply article SEO and strict cover/quality validation; return proof. EN pending.
- [x] **E6 — Spanish draft: Thermaltake View 590.** Delegated isolated writer; canonical ID `componentes/thermaltake-view-590-cristal-curvo-cinco-ventiladores`. Verify curved glass, included fans, compatibility and availability. Own only its matching Spanish folder. Apply article SEO and strict cover/quality validation; return proof. EN pending.
- [x] **E7 — Spanish draft: Switch 2 ns2jb limits.** Delegated isolated writer; canonical ID `consolas/switch-2-jailbreak-ns2jb-limites`. Primary supplied source: pepsipu, `https://pepsipu.com/blog/2026-10-switch2-jailbreak-ns2jb` (18 October); secondary supplied lead: NintendoEverything (22 October, exact URL pending parent/writer verification). Verify prerequisites, supported firmware and actual exploit reach; distinguish research from a general consumer jailbreak, homebrew or piracy capability. Own only its matching Spanish folder. Apply article SEO and strict cover/quality validation; return proof. EN pending.
- [x] **E8 — English companions (parent-owned after E1–E7).** Run `npm run translate:en -- <final-spanish-id>` per article only after the Spanish return. Record final English IDs, confirm availability, faithful content, copied assets and full `translationOf`. A nonzero local result permits no blind retries; return the fallback need to the parent. Any remote fallback still requires authorization for its destination, operation and session. No preparation-time endpoint probes or calls.
- [x] **E9 — Promotion, checks and closing index (parent-owned after E8).** Reconcile all seven results; select exactly one lead under the authorized editorial scope, keep non-urgent breaking flags false, run strict covers and quality checks, one `npm run build`, then `npm run test:sitemaps`, then closing `npm run index`. Record exact results and any pending entries. This prepares local artifacts only; commit, push, PR and deploy need their own authorized continuation.

For E1–E6 the selected source URLs must be carried forward from the parent selection, not guessed from the stale detector snapshot. The existing selection and candidate snapshot are dated 21 October and contain no exact matches for these six topic strings. Do not rerun the detector or alter seen state to fill that gap.

## Observed completion evidence (2026-10-23)

- Seven Spanish masters written under their canonical IDs, 813–918 words each, with colocated assets; seven English companions generated by delegated translators after the local `translate:en` endpoint (127.0.0.1:1234) refused connection.
- Final EN IDs: `consolas/8bitdo-ultimate-3e-europe-xbox-pc-controller`, `consolas/gulikit-tt-pro-60-dollar-switch-2-controller-alternative`, `tutoriales/how-to-unlock-iphone-duo-touch-id-without-swiping`, `audio/insta360-mic-e-ink-display-32-bit-recording`, `audio/samsung-q990h-review-dolby-atmos`, `componentes/thermaltake-view-590-curved-glass-five-fans`, `consolas/switch-2-software-jailbreak-ns2jb-limits`.
- `npm run covers -- --strict`: 0 new covers below 1200 px. `npm run quality -- --strict`: 1 new failure (8BitDo description at 161 chars) fixed inline to 160; re-run reports 0 new failures.
- `npm run build`: passed, 1329 pages. `npm run test:sitemaps`: all 7 checks passed (1295 URLs in sitemap-0, 14 in the 48 h news sitemap). `npm run index`: regenerated, 947 published articles.
- Promotion: `consolas/switch-2-jailbreak-ns2jb-limites` set `featured: true`; the previous lead `wearables/oura-incorpora-cardio-effort-y-prueba-el-vo2-max-automatico` set `featured: false`. All seven keep `breaking: false`.
- Gap: the article SEO pass is evidenced only for the Touch ID tutorial. For the other six the writers were cut by a usage limit after writing, so the pass is unverified, not claimed as done. Structural quality and cover checks did pass for all seven.
- Authored changed lines across the 14 new MDX entries: 863, plus the task document and regenerated index. This exceeds the 400-line delivery budget, so `ask-on-risk` requires a delivery/chain decision before any commit; no commit, push, PR or deploy has been performed.

## Review workload and delivery

- Forecast: approximately 850–1,350 authored changed lines for fourteen MDX entries (roughly 50–80 lines each), tracking and selection metadata; binary images add bytes, not authored text lines. The generated published index is excluded from the authored estimate but remains in the complete change inventory. This is an estimate, not an observed count or a cap; source detail may increase it.
- `delivery_strategy: ask-on-risk`; user decided on 2026-10-23: **single PR with maintainer-approved `size:exception`**, no chained PRs and no chain strategy. Forecast already exceeds 400 authored additions plus deletions: the user granted the `size:exception` for a single PR on 2026-10-23 before the first commit. Push, PR creation and merge remain separate decisions under ordinary repository policy.
- Coherent future rollback/review boundary: each article's Spanish/English pair plus its assets and relevant verification/tracking evidence; central promotion/index integration stays a separate coordinated work unit. No file-type-only split, minification or omitted content to fit a budget. There is no hard per-task line limit.
- Current work-unit commit identities: none (commits explicitly out of scope). Native review authority is not asserted or changed by this document.

## Preparation evidence and handoff

- Observed: initially clean `main`; new feature branch created; all seven final slug basenames returned `libre` from `npm run slug -- <slug>` (exit 0). These checks do not reserve the slugs.
- Candidate update: append ns2jb to the existing Consolas selection as user-selected and to `scripts/candidates.json`, preserving all prior candidates and metadata except the necessary `count` increment (1409 to 1410). Retain original `generated` timestamp; the manually added historical source item is not a fresh detector run. Source date and secondary date are supplied leads, not newly fetched evidence.
- No article writes, detector rerun, seen-state writes, build, translation, commits or remote work performed.
- Candidate persistence limitation: both candidate files are ignored local artifacts, absent from `HEAD`; do not force-add them. A `git show HEAD:scripts/candidates.json` comparison failed for that reason, not because the JSON is invalid. Existing content was preserved by targeted patch; no pre-edit full snapshot exists for an independent whole-file comparison.
- Engram mirror: **pending**. `mem_save` for topic `odd/editorial-batch-2026-10-23/tasks`, project `techspain`, failed because multiple active runtime sessions match this directory and no authoritative session ID was supplied to this worker. No mirror readback is possible; parent must save the full current document with its runtime identity. Local file is the recovery locator. Do not invent a runtime session identity or create an independent save session.
- Next: parent reads this document and its full mirror, resolves first-six source URLs, then launches the seven requested isolated Spanish writers. E1–E9 remain unchecked; preparation is not article completion.
