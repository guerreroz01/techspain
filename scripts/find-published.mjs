#!/usr/bin/env node
/**
 * find-published.mjs — Busca si un tema ya está publicado en el portal.
 *
 * Uso:
 *   npm run find -- <término> [<término>...]
 *
 * Por qué existe: `npm run slug` valida el SLUG, no el TEMA. Nada impide asignar
 * un slug nuevo a una historia ya cubierta. Y el índice de contrastación
 * (`scripts/articulos-publicados.md`) solo guarda título y URL, así que un nombre
 * de proyecto que aparezca únicamente en la descripción pasa desapercibido.
 *
 * Esta consulta recorre internamente título, descripción, tags y URL de origen de
 * cada artículo publicado y devuelve SOLO las coincidencias. El agente nunca
 * lista `src/content/news/`: recibe unas pocas líneas en vez de ~12 KB de listado.
 *
 * La búsqueda es OR (basta que coincida un término), sin acentos y sin distinguir
 * mayúsculas. Los candidatos llegan en inglés o chino y los artículos publicados
 * están en español, así que lo que sobrevive a la traducción son los nombres
 * propios y los términos técnicos: usá esos para consultar.
 *
 * Salida (una línea por coincidencia):
 *   coincide  <slug>  (<campo>: "<término>")  <fecha>  <título>
 * o bien:
 *   sin coincidencias
 *
 * Sin dependencias: solo `node:fs` y `node:path`, como el resto de `scripts/`.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_DIR = join(__dirname, '..', 'src', 'content', 'news');

/** Minúsculas y sin acentos: "gráficos" y "graficos" deben coincidir. */
function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Campo escalar de una línea del frontmatter, sin comillas. */
function field(raw, name) {
  const m = raw.match(new RegExp(`^\\s*${name}:\\s*(.+)$`, 'm'));
  if (!m) return '';
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

function readEntries() {
  const entries = [];
  for (const dir of readdirSync(NEWS_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const indexPath = join(NEWS_DIR, dir.name, 'index.mdx');
    if (!existsSync(indexPath)) continue;

    const raw = readFileSync(indexPath, 'utf8');
    entries.push({
      slug: dir.name,
      title: field(raw, 'title'),
      description: field(raw, 'description'),
      tags: field(raw, 'tags'),
      sourceUrl: field(raw, 'url'),
      pubDate: field(raw, 'pubDate'),
    });
  }
  return entries;
}

const CAMPOS = [
  ['title', 'titulo'],
  ['description', 'descripcion'],
  ['tags', 'tags'],
  ['sourceUrl', 'url-origen'],
];

function main() {
  const terms = process.argv
    .slice(2)
    .filter((arg) => arg !== '--')
    .map((arg) => arg.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    process.stderr.write('Uso: npm run find -- <término> [<término>...]\n');
    process.exitCode = 1;
    return;
  }

  const needles = terms.map(normalize);
  let matches = 0;

  for (const entry of readEntries()) {
    for (const [key, label] of CAMPOS) {
      const haystack = normalize(entry[key] ?? '');
      const hit = needles.find((needle) => haystack.includes(needle));
      if (hit) {
        process.stdout.write(
          `coincide  ${entry.slug}  (${label}: "${hit}")  ${entry.pubDate}  ${entry.title}\n`,
        );
        matches += 1;
        break; // un artículo cuenta una vez, aunque coincida en varios campos
      }
    }
  }

  if (matches === 0) process.stdout.write('sin coincidencias\n');
}

main();
