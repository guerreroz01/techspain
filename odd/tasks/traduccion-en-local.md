# Feature: local English translation step for the redaction flow

## Objective

Add a zero-dependency script that generates the English companion (`news-en`) of a
Spanish article with the local LM Studio model, and wire it into the redaction flow
with a remote-subagent fallback when the local endpoint is unavailable.

## Problem

The English companion is **mandatory** (the build enforces `translationOf`) and today it
is produced by the same remote subagent that writes the Spanish piece. We want the
mechanical, text-in/text-out part — the translation — done by the local model (which
needs no tools), keeping the remote model for the steps that need tools (fetching the
source, downloading images, SEO pass, build). If the local endpoint is down, the flow
must not break: it falls back to translating with a remote subagent.

## Scope

- **New**: `scripts/translate-en.mjs`
- **New**: `package.json` script `translate:en`
- **Edit**: `skills/redaccion-prensa/DELEGATION.md` (writer produces Spanish only; the
  English companion is generated per article by the orchestrator)
- **Edit**: `AGENTS.md` (§7 step 5 and §16 delegation bullet)

Out of scope: Spanish drafting by the local model.

## Design

- Invoked as `npm run translate:en -- <vertical>/<slug> [--en <english-slug>]`.
- Reads `src/content/news/<vertical>/<slug>/index.mdx`; extract `pubDate`,
  `updatedDate` (optional), `cover`, `coverAlt`, `source.{name,url}`, `draft` with
  targeted regex (the frontmatter is regular; do **not** pull a YAML dependency).
- Calls LM Studio's OpenAI-compatible `/chat/completions`:
  `LMSTUDIO_BASE_URL` (default `http://127.0.0.1:1234/v1`), `LM_API_TOKEN` (sent when
  set), `TRANSLATE_MODEL` (default `qwen3.8-9b-abliterated-25`).
- The model returns **JSON only** (no MDX): `{ title, description, coverAlt, tags,
  slug, body }`. Prose lives in `body`; the frontmatter is rebuilt by the script, never
  by the model.
- The script composes the EN `index.mdx` deterministically: copied fields + translated
  fields + `translationOf: <vertical>/<slug>`; **no** `author`, `featured` or
  `breaking`; tags translated (vertical first; `Tutoriales` → `Tutorials`).
- Copies the ES `assets/` directory to the EN entry.
- Validates the EN slug against the existing EN ids + reserved vertical tokens and
  appends `-N` when taken.
- **Any** failure (endpoint unreachable, non-2xx, timeout, invalid JSON, validation)
  exits non-zero with a clear stderr reason, so the orchestrator can fall back.

## Tasks

- [x] T1 — write `scripts/translate-en.mjs`
- [x] T2 — add the `translate:en` npm script
- [x] T3 — update `DELEGATION.md` (Spanish-only writer + EN generation with fallback)
- [x] T4 — update `AGENTS.md` §7 / §16
- [x] T5 — end-to-end test on a throwaway ES entry, then delete it

## Acceptance criteria

- Given an existing ES entry, the script writes a valid `news-en/index.mdx` with
  `translationOf`, identical `pubDate`/`source`, no `author`/`featured`/`breaking`, and
  the assets copied.
- Any failure exits non-zero with a clear reason on stderr.
- `npm run build` passes with the generated entry.
- The flow change and its fallback contract are documented in `DELEGATION.md`.

## Checks

- Manual end-to-end run against the live local endpoint.
- `npm run build`.

## Progress (verified)

- `node --check scripts/translate-en.mjs` → OK; `package.json` parses.
- End-to-end against the live LM Studio endpoint: `npm run translate:en -- componentes/zz-test-traduccion-local`
  wrote `src/content/news-en/componentes/local-translation-test-with-lm-studio/index.mdx` in ~23 s.
  Verified: title/description/coverAlt translated, `pubDate` copied, tags `['Components','Semiconductors']`
  (EN vertical label first), `source` identical, `draft: false`, `translationOf` correct, no
  `author`/`featured`/`breaking`, `assets/` copied. Throwaway entries deleted afterwards.
- `npm run build` → 1034 pages with the test pair, 1032 after deletion (baseline). No stale-store error.
- Not committed (commit left to the user).

