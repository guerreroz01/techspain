#!/usr/bin/env node
/**
 * Editorial quality check.
 *
 * Search Console shows the site earns clicks on consumer pieces that answer a
 * concrete question, so volume without substance is the expensive failure mode.
 * This script measures the bars that can be checked mechanically, reports every
 * entry, and fails only on entries absent from the baseline — existing debt does
 * not block work, but a new article cannot be worse than the ones already
 * published.
 *
 * Usage:
 *   npm run quality                  report (never fails)
 *   npm run quality -- --strict      exit 1 on a violation not in the baseline
 *   npm run quality -- --update-baseline
 *   npm run quality -- --json
 *   npm run quality -- --baseline <path>
 *
 * Bars:
 *   - body at least 400 words
 *   - description between 70 and 160 characters
 *   - `source.name` and `source.url` present (attribution is not optional)
 *   - the body never starts with an H1 (the template renders the title)
 *   - a title exists
 *
 * Cover width is checked separately by `npm run covers`.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COLLECTIONS = ['src/content/news', 'src/content/news-en'];
const MIN_WORDS = 400;
const DESC_MIN = 70;
const DESC_MAX = 160;
const DEFAULT_BASELINE = join(ROOT, 'scripts/quality-baseline.json');

function parseFlags(argv) {
  const flags = { strict: false, updateBaseline: false, json: false, baseline: DEFAULT_BASELINE };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--strict') flags.strict = true;
    else if (arg === '--update-baseline') flags.updateBaseline = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--baseline') flags.baseline = resolve(argv[(i += 1)] ?? '');
  }
  return flags;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (entry.name === 'index.mdx') out.push(path);
  }
  return out;
}

/** Split frontmatter and body. */
function split(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  return { frontmatter: match ? match[1] : '', body: match ? source.slice(match[0].length) : source };
}

function field(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*['"]?(.*?)['"]?\\s*$`, 'm'));
  return match ? match[1].trim() : null;
}

function loadBaseline(path) {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    return parsed && typeof parsed.entries === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function main() {
  const flags = parseFlags(process.argv.slice(2));
  const baseline = loadBaseline(flags.baseline);

  const rows = [];
  for (const collection of COLLECTIONS) {
    const base = join(ROOT, collection);
    if (!existsSync(base)) continue;
    for (const file of walk(base)) {
      const id = relative(ROOT, file).replace(/\/index\.mdx$/, '');
      const { frontmatter, body } = split(readFileSync(file, 'utf8'));
      const words = body.split(/\s+/).filter(Boolean).length;
      const description = field(frontmatter, 'description') ?? '';
      const title = field(frontmatter, 'title');
      const hasSourceName = /^source:\s*$/m.test(frontmatter) && /^\s+name:\s*\S/m.test(frontmatter);
      const hasSourceUrl = /^\s+url:\s*["']?https?:/m.test(frontmatter);

      const issues = [];
      if (!title) issues.push('missing-title');
      if (words < MIN_WORDS) issues.push(`short:${words}w`);
      if (description.length < DESC_MIN) issues.push(`desc-short:${description.length}`);
      if (description.length > DESC_MAX) issues.push(`desc-long:${description.length}`);
      if (!hasSourceName || !hasSourceUrl) issues.push('source-missing');
      if (/^\s*#\s/.test(body)) issues.push('leading-h1');

      rows.push({ id, words, issues });
    }
  }

  const violations = rows.filter((row) => row.issues.length > 0);
  const baselined = new Set(Object.keys(baseline?.entries ?? {}));
  const fresh = violations.filter((row) => !baselined.has(row.id));
  const repaired = [...baselined].filter((id) => {
    const row = rows.find((candidate) => candidate.id === id);
    return row && row.issues.length === 0;
  });

  if (flags.updateBaseline) {
    const entries = Object.fromEntries(
      violations.map((row) => [row.id, row.issues]).sort(([a], [b]) => a.localeCompare(b)),
    );
    writeFileSync(
      flags.baseline,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString().slice(0, 10),
          minWords: MIN_WORDS,
          descriptionRange: [DESC_MIN, DESC_MAX],
          note: 'Known editorial debt. New entries must not be added here: fix the piece instead.',
          entries,
        },
        null,
        2,
      )}\n`,
    );
    if (!flags.json) console.log(`baseline escrita: ${relative(ROOT, flags.baseline)} (${violations.length} entradas)`);
  }

  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          total: rows.length,
          violations: violations.length,
          fresh: fresh.length,
          baseline: baseline ? Object.keys(baseline.entries).length : 0,
          repaired: repaired.length,
          entries: fresh,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`Quality check — mínimo ${MIN_WORDS} palabras, description ${DESC_MIN}–${DESC_MAX}`);
    console.log('');
    console.log(`  entradas:      ${rows.length}`);
    console.log(`  con fallos:    ${violations.length}`);
    console.log(`  baseline:      ${baseline ? Object.keys(baseline.entries).length : 0}`);
    console.log(`  nuevas:        ${fresh.length}`);
    if (repaired.length) console.log(`  corregidas:    ${repaired.length} (podés regenerar el baseline)`);

    if (fresh.length) {
      console.log('');
      console.log('--- pendientes de corregir (no están en el baseline) ---');
      for (const row of fresh.slice(0, 20)) console.log(`  ${row.id}  →  ${row.issues.join(', ')}`);
      if (fresh.length > 20) console.log(`  …y ${fresh.length - 20} más`);
    }
  }

  if (flags.strict && fresh.length > 0) {
    if (!flags.json) {
      console.log('');
      console.log(`FALLO: ${fresh.length} entrada(s) nueva(s) no cumplen el estándar editorial.`);
      console.log('Corregí la pieza antes de publicar; no la agregues al baseline.');
    }
    process.exit(1);
  }
}

main();
