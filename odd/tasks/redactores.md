# Un redactor por vertical (firma + personalidad)

## Objective

Give each of the ten editorial verticals its own fictional writer who signs its
articles and writes them with a documented, reproducible voice. The byline is
derived from the vertical encoded in a nested entry's id — the same source of
truth the URL already uses — so the signature can never drift from the section.

## Problem / Why

- Every article is currently signed with the same generic byline
  (`Redacción TechSpain24`), so the site has no author identity and no voice
  differentiation between sections.
- A byline hardcoded in each frontmatter can disagree with the article's
  vertical, and it duplicates the writer's name across hundreds of entries.
- Readers and search engines both benefit from stable, specialised author
  identities per topical section.

## Decisions (approved by the user)

| Fork | Decision |
| --- | --- |
| Scope | **Go-forward only.** Only nested entries (`<vertical>/<slug>`) get the new byline. The 700+ legacy flat articles keep `Redacción TechSpain24` / `TechSpain24 Staff`. |
| Byline source | Single registry in `src/lib/authors.ts`, resolved from the nested vertical token. **Never** derived from `tags[0]`, so legacy is untouched. |
| English companion | The **same** writer signs the ES entry and its EN translation (one person, one name). No parallel English voices. |
| Personas | Ten fictional Spanish pen names, approved. Voice is style only; never a licence to invent facts or break factual neutrality. |
| Author pages | Out of scope for this delivery (`/redactores/<slug>/` is a phase-2 follow-up). |

## Constraints

- No URL, slug or title changes. No content edits to legacy entries.
- No new dependencies.
- `author` becomes optional in both schemas; the fallback lives in `bylineFor`,
  not in the Zod default. `RSS`, `buscar.json` and the sitemaps never read
  `author`, so they are unaffected.
- Technical artifacts in English (code, comments, docs). Persona files and
  user-facing copy in Spanish. Identifiers stay English.

## Task list

| ID | Task | Route | Trigger / evidence | Status |
| --- | --- | --- | --- | --- |
| T1 | `src/lib/authors.ts`: registry + `authorForVertical` + `bylineFor` | inline | Design held in orchestrator; no research, mechanical | done |
| T2 | `src/content.config.ts`: `author` optional in `news` + `newsEn` | inline | One mechanical edit | done |
| T3 | Wire `bylineFor` in `ArticleView`, `ArticleViewEn`, `LeadStory` | inline | Three mechanical edits, same pattern | done |
| T4 | Ten persona files in `skills/redaccion-prensa/redactores/` | inline | Approved copy authored in-context; delegating would re-transfer it | done |
| T5 | Workflow docs: `SKILL.md`, `DELEGATION.md`, `frontmatter-template.md` | inline | Doc edits that must mirror the approved design | done |
| T6 | `AGENTS.md` (§5, §6, §7, §16) | inline | Doc edit | done |
| T7 | `npm run build` + byline spot-check | inline | Verification | done |

Route note: the change is one cohesive writer thread reusing the design already
held in the orchestrator's context (registry shape, the ten approved personas,
and the exact fallback rules). Delegating a writer would have meant re-sending
all of that design and risking drift in the approved copy, so it ran inline —
mirroring the `vertical-urls` precedent. No raw listing of
`src/content/news/` was performed.

## Acceptance criteria

- [x] Nested Spanish articles show their vertical's writer in the byline **and**
      in the JSON-LD `author` (`Person`). *Verified with a temporary
      `audio/zzz-fixture-redactor` entry (rebuilt, then removed): visible byline
      `Marta Ruiz` + `"author":{"@type":"Person","name":"Marta Ruiz"}`.*
- [x] Nested English companions show the **same** writer name. *Verified with the
      paired `audio/zzz-fixture-writer` entry.*
- [x] Legacy flat articles still render `Redacción TechSpain24` (ES) and
      `TechSpain24 Staff` (EN). *Verified on `pixel-11a` / `pixel-11a-renders`.*
- [x] An explicit frontmatter `author` still overrides the derived byline.
      *Guaranteed by the early return in `bylineFor`; no current entry sets it.*
- [x] `npm run build` passes (752 pages).

## Progress

- [x] Exploration: content schema, byline surfaces, vertical registry, skill docs.
- [x] User approved the ten writer profiles and the go-forward scope.
- [x] T1–T7 implemented; fixture-verified derivation, then fixture removed and the
      content store cleaned (`.astro`, `node_modules/.astro/data-store.json`).
- [x] `npm run build` green after cleanup (752 pages).

## Follow-ups

- Phase 2 (not in this delivery): `/redactores/<slug>/` (+ `/en/authors/<slug>/`)
  with bio + article list, and `url`/`jobTitle` in the JSON-LD author.
- Engram mirror: saved under topic `odd/redactores/tasks` (observation 789).
