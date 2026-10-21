#!/usr/bin/env node
/**
 * Cover width check.
 *
 * Google Discover needs a main image at least 1200 px wide to show the large
 * card, which is the fastest surface a news site without domain authority can
 * win. This script reports every published entry whose cover is below that, and
 * fails only on entries that are not already in the baseline, so the existing
 * debt does not block work while new articles cannot make it worse.
 *
 * Usage:
 *   npm run covers                    report (never fails)
 *   npm run covers -- --strict        exit 1 on a cover not in the baseline
 *   npm run covers -- --update-baseline   accept the current state as debt
 *   npm run covers -- --baseline <p>  use an alternative baseline file
 *   npm run covers -- --json          machine-readable output
 *
 * Image sizes are read from the file header (JPEG, PNG, WebP, GIF) so the check
 * needs no image library and no ImageMagick. Other formats are reported as
 * unreadable rather than silently passing.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COLLECTIONS = ['src/content/news', 'src/content/news-en'];
const MIN_WIDTH = 1200;
const DEFAULT_BASELINE = join(ROOT, 'scripts/cover-baseline.json');

/** @param {string[]} argv */
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

/** Every `index.mdx` below a collection root. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (entry.name === 'index.mdx') out.push(path);
  }
  return out;
}

/** Frontmatter `cover:` value, or null. */
function coverFrom(frontmatter) {
  const match = frontmatter.match(/^cover:\s*['"]?(.+?)['"]?\s*$/m);
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

/** Collect every field of `key: value` lines in the frontmatter block. */
function frontmatterOf(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : '';
}

/** @returns {{width: number, height: number} | null} */
function imageSize(buffer) {
  // PNG
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  // GIF
  if (buffer.length > 10 && buffer.toString('ascii', 0, 4) === 'GIF8') {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  // WebP
  if (
    buffer.length > 30 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const format = buffer.toString('ascii', 12, 16);
    if (format === 'VP8X') {
      return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
    }
    if (format === 'VP8 ') {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (format === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  }

  // AVIF / HEIF: ISOBMFF container; the display size lives in the `ispe`
  // property box (size + type, version/flags, then width and height as uint32).
  if (buffer.length > 16 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12);
    if (['avif', 'avis', 'heic', 'heix', 'mif1', 'msf1'].includes(brand)) {
      const ispe = buffer.indexOf(Buffer.from('ispe', 'ascii'));
      if (ispe !== -1 && ispe + 16 <= buffer.length) {
        return { width: buffer.readUInt32BE(ispe + 8), height: buffer.readUInt32BE(ispe + 12) };
      }
      return null;
    }
  }

  // JPEG: walk the segment chain until a Start Of Frame marker.
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 9) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      // Standalone markers carry no length field.
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      const isStartOfFrame =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isStartOfFrame) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  return null;
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
      const source = readFileSync(file, 'utf8');
      const cover = coverFrom(frontmatterOf(source));

      if (!cover) {
        rows.push({ id, status: 'missing', width: null });
        continue;
      }

      const path = resolve(dirname(file), cover);
      if (!existsSync(path)) {
        rows.push({ id, status: 'missing-file', width: null, cover });
        continue;
      }

      const size = imageSize(readFileSync(path));
      if (!size) {
        rows.push({ id, status: 'unreadable', width: null, cover });
        continue;
      }

      rows.push({
        id,
        status: size.width >= MIN_WIDTH ? 'ok' : 'low',
        width: size.width,
        height: size.height,
        cover,
      });
    }
  }

  const low = rows.filter((row) => row.status === 'low');
  const missing = rows.filter((row) => row.status === 'missing' || row.status === 'missing-file');
  const unreadable = rows.filter((row) => row.status === 'unreadable');
  const baselined = new Set(Object.keys(baseline?.entries ?? {}));
  const fresh = low.filter((row) => !baselined.has(row.id));
  const repaired = [...baselined].filter((id) => {
    const row = rows.find((candidate) => candidate.id === id);
    return row && row.status === 'ok';
  });

  if (flags.updateBaseline) {
    const entries = Object.fromEntries(low.map((row) => [row.id, row.width]).sort());
    writeFileSync(
      flags.baseline,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString().slice(0, 10),
          minWidth: MIN_WIDTH,
          note: 'Known covers below the Discover minimum. New entries must not be added here: fix the cover instead.',
          entries,
        },
        null,
        2,
      )}\n`,
    );
    if (!flags.json) console.log(`baseline escrita: ${relative(ROOT, flags.baseline)} (${low.length} entradas)`);
  }

  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          minWidth: MIN_WIDTH,
          total: rows.length,
          low: low.length,
          fresh: fresh.length,
          missing: missing.length,
          unreadable: unreadable.length,
          repaired: repaired.length,
          baseline: baseline ? Object.keys(baseline.entries).length : 0,
          entries: { fresh, missing, unreadable },
        },
        null,
        2,
      ),
    );
  } else {
    const pct = rows.length ? Math.round((low.length / rows.length) * 100) : 0;
    console.log(`Cover check — ancho mínimo ${MIN_WIDTH}px (tarjeta grande de Discover)`);
    console.log('');
    console.log(`  entradas:       ${rows.length}`);
    console.log(`  bajo el mínimo: ${low.length} (${pct}%)`);
    console.log(`  baseline:       ${baseline ? Object.keys(baseline.entries).length : 0}`);
    console.log(`  nuevas:         ${fresh.length}`);
    console.log(`  sin cover:      ${missing.length}`);
    console.log(`  ilegibles:      ${unreadable.length}`);
    if (repaired.length) console.log(`  corregidas:     ${repaired.length} (podés regenerar el baseline)`);

    if (fresh.length) {
      console.log('');
      console.log('--- pendientes de corregir (no están en el baseline) ---');
      for (const row of fresh.slice(0, 20)) {
        console.log(`  ${String(row.width).padStart(5)}px  ${row.id}`);
      }
      if (fresh.length > 20) console.log(`  …y ${fresh.length - 20} más`);
    }

    if (missing.length) {
      console.log('');
      console.log('--- sin cover utilizable ---');
      for (const row of missing.slice(0, 10)) console.log(`  ${row.status.padEnd(12)} ${row.id}`);
      if (missing.length > 10) console.log(`  …y ${missing.length - 10} más`);
    }

    if (unreadable.length) {
      console.log('');
      console.log('--- formato no soportado ---');
      for (const row of unreadable.slice(0, 10)) console.log(`  ${row.cover}  (${row.id})`);
    }
  }

  if (flags.strict && fresh.length > 0) {
    if (!flags.json) {
      console.log('');
      console.log(`FALLO: ${fresh.length} cover(s) nuevo(s) por debajo de ${MIN_WIDTH}px.`);
      console.log('Reemplazá la imagen por una de al menos 1200px de ancho antes de publicar.');
    }
    process.exit(1);
  }
}

main();
