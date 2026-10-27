# October 2026: evidence-led SEO improvements

## Objective and problem

Improve the existing PS5 exploit guide and its relevant internal links, preserve
the measured diagnosis of the October 21 visibility anomaly and English ROG
decline, and reconcile the project's primary research market with its audience.
Do not treat low impressions as proof that a headline rewrite will recover traffic.

## Starting evidence

- Repository: clean `main` at `c84f132` before preparation; work branch:
  `feature/seo-metrics-october-2026`. Implementation was pending at preparation.
- GSC property: `sc-domain:techspain24.com`; OpenSEO project:
  `98cd401d-afa2-4853-ad8d-e41cd2cdb1f9`. Latest complete date: October 25.
- October 19–25: 87 clicks / 5,312 impressions / 1.64% CTR / position 10.73;
  October 12–18: 106 / 7,872 / 1.35% / 9.90. Query rows are incomplete and
  must not be interpreted as representing every click or search intent.
- PS5 guide: 4 to 14 clicks and 135 to 577 impressions across those weeks;
  latest position 8.9. Its live title ends with a dangling "y" before the brand.
- October 20: 17 clicks / 743 impressions; October 21: 0 / 21;
  October 22: 12 / 842. Both `final` and `all` reads agree. October 21 spans
  16 page rows and 11 countries; the historical root cause remains unresolved.
- ROG EN: 7 to 0 clicks, 145 to 2 impressions. Its decline predates October 21.
  Current ES/EN pages return 200 with self-canonicals and mutual hreflang;
  present availability does not establish historical availability or indexing.
- OpenSEO default is `2840/en`. Spain contributed 43 clicks versus US 4 in the
  latest week, but `traffic-growth.md` explicitly retains US + Spain intent.
  OpenSEO project context and saved reports were empty during preparation.

## Authorized scope and delivery

Local improvements only: existing PS5 content and relevant reciprocal links,
evidence-led metadata changes, and a primary market update through an explicitly
authorized app session. Preserve US as a secondary audience.

No URL changes, deletion, new articles or legacy English backfill, shared layout
edits, remote administration, credentials discovery, deployment, pushes, or PRs.
No automatic remote delivery. Delivery strategy: **ask-on-risk**; stop and ask if
source conflicts, authorization gaps, or scope growth prevent a bounded change.
RDD is effectively OFF globally, as verified by the parent with
`gentle-ai review mode status --cwd /home/kali/Projects/techspain`; do not start,
toggle, or gate RDD.

## Stable task checklist and route evidence

- [x] **T1 — Improve the PS5 guide and reciprocal Mupen64Plus link.**
  Route: delegated editorial writer; multi-file/preparation trigger applies.
  Files: `src/content/news/guia-exploit-ps5/index.mdx` and
  `src/content/news/emuladores/mupen64plus-ps5/index.mdx`.
  Use a complete concise title, clarify method-specific prerequisites and
  limitations, and add descriptive contextual links in both directions.
  Source: <https://gbatemp.net/threads/ps5-exploit-guide.613891/>.
  Its status summary lists ReLapse through 13.60, but older method text still
  says no kernel exploit above 12.70. Resolve or explicitly qualify this
  conflict; never promise universal firmware or payload support. Preserve the
  existing URL, publication date, attribution, and legacy author. No EN backfill.
  Work-unit commit identity: `a7d6b14d6fcb17370d5471f2d1ca0b98825e0e30`
  (`fix(seo): clarify PS5 exploit requirements and related links`).
  Rollback boundary: these two content files and their task evidence only.
- [x] **T2 — Verify October 21 and ROG diagnosis, read-only.**
  Route: free local OpenSEO GSC reads and targeted public HTTP/source readback.
  Findings are recorded above; no speculative fix is authorized by these data.
  ROG files: `src/content/news/componentes/rog-phantom-blade-zero/index.mdx`
  and `src/content/news-en/componentes/rog-reveals-limited-edition-phantom-blade-zero-equipment/index.mdx`.
  Existing source <https://www.ithome.com/1/010/575.htm> confirms the gear lineup,
  not new gear pricing or availability. Historical root cause remains unresolved.
  No content changes or implementation commit are claimed for this diagnosis.
- [ ] **T3 — Set primary OpenSEO market only through an authorized app session.**
  Route: supported application `updateProject`, not a nonexistent MCP market tool.
  Pending authorized app session and reconciliation of primary ES / secondary US
  intent. Preserve project ID, name `Techspain24`, and domain `techspain24.com`;
  proposed market pair is `locationCode: 2724`, `languageCode: "es"`.
  Pass the domain explicitly: omitted domain is documented to clear it.
  Re-read `list_projects` after any authorized update. Do not mark complete until
  the saved pair is verified. Rollback: restore the prior `2840/en` pair only.

## Acceptance and validation

- [x] T1 claims and steps trace to the cited source; uncertain support stays qualified.
- [x] No published URL, shared layout, legacy author, or publication date changes.
- [x] After content normalization, run `npm run quality:strict` and `npm run covers:strict`.
- [x] Run `npm run build` once, then `npm run test:sitemaps` once; record actual results.
- [x] Read built PS5 HTML: complete rendered title, unchanged self-canonical,
  indexability, and working structural links to/from Mupen64Plus. Check link targets.
- [x] Record focused checks, rendered-artifact readback, rollback boundary, and
  eventual work-unit commit identity together; ask before delivery risk expands.

Previous read-only checks are baseline evidence, **not final post-edit checks**:
`quality:strict` and `covers:strict` both exited 0 with zero new debt. Build and
sitemap checks have not run for this work. No explicit project TDD configuration
or unit runner was found; `package.json` has no `test` script. Editorial scope is
validated by content and built output, not claimed TDD or RED/GREEN. Add no framework.
The exact sitemap runner is `node scripts/validate-sitemaps.mjs` against `dist/`.

## Forecast and local sources

Forecast: **at most 150 authored implementation lines plus this task document**;
T2 is read-only and T3 is an app setting, not repository implementation. Keep the
eventual T1 content, checks, and documentation in one coherent work unit.

Local contracts: `AGENTS.md`, `.atl/skill-registry.md`, `package.json`,
`scripts/check-quality.mjs`, `scripts/check-covers.mjs`,
`scripts/validate-sitemaps.mjs`, `skills/redaccion-prensa/SKILL.md`,
`skills/redaccion-prensa/redactores/tutoriales.md`, and `odd/tasks/traffic-growth.md`.
OpenSEO operation sources: `src/serverFunctions/projects.ts`,
`src/types/schemas/projects.ts`, `src/server/features/projects/services/projects.ts`,
and `src/shared/keyword-locations.ts` in the sibling `open-seo` repository.

## T1 implementation attempt: superseded preflight stop

The two scoped content files now contain an uncommitted shorter PS5 title,
138-character description, substantive `updatedDate: 2026-10-27`, explicit
source-conflict and entry-point/kernel/payload qualifications, and reciprocal
contextual links. Content diff: 51 additions / 15 deletions. No other content changed.

`git diff --check` exited 0. A subsequent inline Python metadata/whitespace preflight
exited 1: its description-length assertion incorrectly applied the 160-character
limit to the unchanged Mupen64Plus description (161 characters). This is an
overbroad verification assertion, not evidence that this edit introduced a defect.
The author/date/source checks passed for both files before that assertion.

Stopped under the explicit stop-on-failure instruction; no retry, baseline change,
or scope expansion. Final `quality:strict`, `covers:strict`, build, sitemap validation,
and generated-HTML readback have not run for these edits. T1 remains unchecked and
its implementation commit identity remains pending. Nothing staged or committed.
Parent must resolve whether to resume verification with the unchanged metadata
treated as baseline. T2 historical cause remains unresolved; T3 still requires an
authorized app session. RDD remains untouched.

## T1 final validation and delivery evidence

The parent authorized correcting the verification scope: the unchanged 161-character
Mupen64Plus description remains baseline. The erroneous metadata assertion was not
retried, and no content changed after final validation began. No configured formatter
or normalizer was needed; existing line endings and whitespace were retained.

Build-side-effect inspection confirmed `build` invokes `astro build`, with local
glob content loaders and no translation lifecycle hook or translation call in the
inspected configuration/routes/libraries. No translation command, remote endpoint,
credential discovery, RDD action, or browser session was invoked.

Final commands, each executed once after normalization:

| Command | Exit | Observed result |
| --- | --- | --- |
| `npm run quality:strict` | 0 | 1,279 entries; 331 baseline violations; zero new violations. |
| `npm run covers:strict` | 0 | 354 baseline undersized covers; zero new violations. |
| `npm run build` | 0 | 1,339 pages built; static output copied locally to `.vercel/output/static`. |
| `npm run test:sitemaps` | 0 | All 7 checks passed; 1,305 canonical sitemap URLs and 10 news URLs. |

Generated HTML was read directly from both `dist/noticias/guia-exploit-ps5/index.html`
and `dist/noticias/emuladores/mupen64plus-ps5/index.html`. The complete PS5 title is
`Exploit de PS5: compatibilidad, requisitos y límites`, without an appended brand.
An initial readback assertion wrongly required an appended brand and exited 1;
that expectation is not an acceptance criterion. Direct parsed readback confirmed
the full intended title, both reciprocal anchors, existing built targets, and the
source-conflict disclosure. No content rewrite or build retry followed that mistake.

- PS5 canonical: `https://www.techspain24.com/noticias/guia-exploit-ps5/`.
- Both pages: `index, follow, max-image-preview:large`.
- Guide anchor: `Mupen64Plus PS5 para emular Nintendo 64` to
  `/noticias/emuladores/mupen64plus-ps5/`.
- Reciprocal anchor: `guía de exploit de PS5: compatibilidad, requisitos y límites`
  to `/noticias/guia-exploit-ps5/`.
- Rendered article shows the October 27 update and explicitly states that source
  sections are not synchronized and a userland entry point is not a full jailbreak.

Runtime harness: N/A for server/session behavior; this is static editorial content.
Actual built-HTML parsing and local target existence checks cover its rendering
boundary. No unit runner, TDD, RED/GREEN, or production deployment is claimed.
Rollback remains the two scoped content files and their task evidence only.
Content changes remain 51 additions / 15 deletions; no generated tracked changes
were observed. T2 diagnosis is complete with historical cause unresolved; T3 remains
pending an authorized app session. Remote delivery remains unauthorized and unused.

Local delivery: implementation commit `a7d6b14d6fcb17370d5471f2d1ca0b98825e0e30`
contains exactly the two scoped content files and this feature document (225 additions,
15 deletions, including 174 document lines). A separate documentation-only evidence
commit records this identity; content bytes remain those validated by the single
build. No push, PR, or deployment was performed.
