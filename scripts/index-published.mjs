#!/usr/bin/env node
/**
 * index-published.mjs — Regenera `scripts/articulos-publicados.md`.
 *
 * Uso:
 *   npm run index
 *
 * Recorre `src/content/news/<slug>/index.mdx`, lee el frontmatter
 * (`title`, `pubDate`, `draft`) y reescribe el índice de contrastación que se
 * consulta ANTES de redactar para no repetir una historia ya cubierta.
 *
 * Sin dependencias: el frontmatter es YAML plano del que solo se extraen campos
 * de una línea, así que un parser propio alcanza y evita sumar una dependencia.
 *
 * Convenciones (mantener si se toca el formato):
 * - El nombre de la carpeta ES el slug de la URL (`entry.id`).
 * - Se ordena por fecha ascendente y, dentro de cada fecha, por título
 *   alfabético en español (locale `es`).
 * - Los borradores (`draft: true`) NO entran: no llegan al build de producción.
 * - El dominio se lee de `astro.config.mjs` (`site`), la misma fuente que usan
 *   canonical, sitemaps y RSS. No hardcodear la URL acá.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NEWS_DIR = join(ROOT, 'src', 'content', 'news');
const ASTRO_CONFIG = join(ROOT, 'astro.config.mjs');
const OUT_PATH = join(__dirname, 'articulos-publicados.md');

/** Dominio del sitio desde `astro.config.mjs` (fuente única, no duplicar). */
function readSiteUrl() {
  const config = readFileSync(ASTRO_CONFIG, 'utf8');
  const m = config.match(/^\s*site:\s*['"]([^'"]+)['"]/m);
  if (!m) throw new Error('No se encontró `site` en astro.config.mjs');
  return m[1].replace(/\/+$/, '');
}

/** Extrae un campo escalar de una línea del frontmatter, sin las comillas. */
function frontmatterField(raw, name) {
  const m = raw.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  if (!m) return '';
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

function readEntries() {
  const entries = [];
  for (const slug of readdirSync(NEWS_DIR, { withFileTypes: true })) {
    if (!slug.isDirectory()) continue;
    const indexPath = join(NEWS_DIR, slug.name, 'index.mdx');
    if (!existsSync(indexPath)) continue;

    const raw = readFileSync(indexPath, 'utf8');
    const draft = frontmatterField(raw, 'draft') === 'true';
    if (draft) continue;

    const title = frontmatterField(raw, 'title');
    const pubDate = frontmatterField(raw, 'pubDate');
    if (!title || !pubDate) {
      process.stderr.write(`Aviso: ${slug.name} sin title o pubDate, se omite.\n`);
      continue;
    }
    entries.push({ slug: slug.name, title, pubDate });
  }
  return entries;
}

/** Escapa lo mínimo para que un título no rompa la celda de la tabla. */
function escapeCell(text) {
  return text.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function render(entries, siteUrl, today) {
  const lines = [];
  lines.push('# Artículos publicados — índice de contrastación');
  lines.push('');
  lines.push('Lista de los artículos ya publicados en la página, con su enlace directo.');
  lines.push('Consúltala ANTES de redactar para no duplicar una historia ya cubierta.');
  lines.push('');
  lines.push(
    `> Generado automáticamente desde \`src/content/news/\` con \`npm run index\`. ` +
      `${entries.length} artículos. Actualizado: ${today}`,
  );
  lines.push('');
  lines.push('| Fecha | Artículo | URL |');
  lines.push('| --- | --- | --- |');
  for (const e of entries) {
    lines.push(`| ${e.pubDate} | ${escapeCell(e.title)} | [${e.slug}](${siteUrl}/noticias/${e.slug}/) |`);
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const siteUrl = readSiteUrl();
  const entries = readEntries().sort(
    (a, b) => a.pubDate.localeCompare(b.pubDate) || a.title.localeCompare(b.title, 'es'),
  );

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
  writeFileSync(OUT_PATH, render(entries, siteUrl, today));

  process.stdout.write(
    `Índice regenerado: ${entries.length} artículos publicados en scripts/articulos-publicados.md\n`,
  );
}

main();
