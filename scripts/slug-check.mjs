#!/usr/bin/env node
/**
 * slug-check.mjs — Comprueba si un slug está libre en las colecciones de artículos.
 *
 * Uso:
 *   npm run slug -- <slug> [<slug>...]   # uno o varios slugs (colección ES)
 *   npm run slug -- --en <slug> [...]    # slugs de la colección EN (news-en)
 *   npm run slug -- --count              # solo el total de artículos ES
 *   npm run slug -- --en --count         # solo el total de artículos EN
 *
 * Por qué existe: para saber qué slugs existen, el agente listaba la carpeta
 * entera (`ls src/content/news/`). Con cientos de artículos eso son ~12 KB de
 * contexto POR LLAMADA, y el listado no dice nada que una consulta puntual no
 * responda. Acá se responde en una línea por slug.
 *
 * Estructura: los artículos nuevos viven en `src/content/news/<vertical>/<slug>/`
 * (una carpeta por vertical; la URL es `/noticias/<vertical>/<slug>/`). Los
 * artículos publicados antes de ese esquema siguen planos en
 * `src/content/news/<slug>/` y conservan su URL. El script recorre el árbol
 * completo, así que cuenta y detecta ambos.
 *
 * Salida (una línea por slug):
 *   libre    <slug>
 *   ocupado  <slug>  -> libre: <slug>-2
 *   reservado <slug> -> es una vertical, elegí otro slug
 *   aviso    <slug> no es kebab-case ASCII -> usa: <slug-normalizado>
 *
 * Convención de slugs: en **español**, kebab-case, minúsculas y ASCII. Un slug
 * con mayúsculas, acentos, `ñ` o cualquier carácter fuera de `[a-z0-9-]` recibe
 * un aviso con su versión normalizada. Los slugs ya publicados no se renombran.
 *
 * Los tokens de vertical (`audio`, `moviles`, …) están reservados: ocupan la URL
 * del hub `/noticias/<vertical>/`, así que ningún artículo puede usarlos. Se leen
 * de `src/lib/verticals.ts` para no duplicar la lista.
 *
 * Siempre sale con código 0 (salvo uso incorrecto): es una consulta informativa.
 *
 * Sin dependencias: solo `node:fs` y `node:path`, como el resto de `scripts/`.
 */
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_DIR = join(__dirname, '..', 'src', 'content', 'news');
const NEWS_EN_DIR = join(__dirname, '..', 'src', 'content', 'news-en');
const VERTICALS_FILE = join(__dirname, '..', 'src', 'lib', 'verticals.ts');

/** Ids de todas las entradas de una colección (ruta relativa, `vertical/slug`). */
function existingIds(dir) {
  const ids = new Set();
  const walk = (current, prefix) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const child = join(current, entry.name);
      const id = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (existsSync(join(child, 'index.mdx')) || existsSync(join(child, 'index.md'))) {
        ids.add(id);
      } else {
        walk(child, id);
      }
    }
  };
  walk(dir, '');
  return ids;
}

/** Tokens de vertical reservados, leídos del registro (fuente única). */
function reservedTokens() {
  const raw = readFileSync(VERTICALS_FILE, 'utf8');
  return new Set([...raw.matchAll(/token:\s*'([^']+)'/g)].map((match) => match[1]));
}

/** Último segmento de un id (`vertical/slug` -> `slug`). */
const basename = (id) => id.slice(id.lastIndexOf('/') + 1);

/** Primer sufijo `-2`, `-3`… libre para un slug ya ocupado. */
function nextFree(slug, taken) {
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${slug}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}

/**
 * Slug de artículo: español, kebab-case, minúsculas y ASCII.
 * Quita diacríticos (`á` → `a`, `ñ` → `n`), baja a minúsculas y colapsa todo lo que
 * no sea `[a-z0-9]` en guiones. Solo se usa para avisar: no renombra nada.
 */
function normalizeSlug(slug) {
  return slug
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function main() {
  // npm pasa los argumentos después de `--`; se ignora un `--` suelto por si
  // alguna versión lo reenvía. `--en` selecciona la colección de traducciones.
  const raw = process.argv.slice(2).filter((arg) => arg !== '--');
  const enMode = raw.includes('--en');
  const args = raw.filter((arg) => arg !== '--en');

  if (args.length === 0) {
    process.stderr.write(
      'Uso: npm run slug -- <slug> [<slug>...] | --count | --en <slug> [<slug>...] | --en --count\n',
    );
    process.exitCode = 1;
    return;
  }

  const ids = existingIds(enMode ? NEWS_EN_DIR : NEWS_DIR);
  const reserved = reservedTokens();
  const taken = new Set([...ids].map(basename));

  if (args[0] === '--count') {
    process.stdout.write(`${ids.size}\n`);
    return;
  }

  for (const slug of args) {
    const normalized = normalizeSlug(slug);
    if (normalized !== slug) {
      process.stdout.write(
        `aviso   ${slug} no es kebab-case ASCII -> usa: ${normalized || '(vacío)'}\n`,
      );
    }
    // Si el slug venía mal formado se consulta la versión normalizada, que es la
    // que el artículo acabará usando.
    const effective = normalized || slug;

    if (reserved.has(effective)) {
      process.stdout.write(`reservado ${effective} -> es una vertical, elegí otro slug\n`);
      continue;
    }

    if (!taken.has(effective)) {
      process.stdout.write(`libre   ${effective}\n`);
      continue;
    }
    const suggestion = nextFree(effective, new Set([...taken, ...reserved]));
    process.stdout.write(
      `ocupado ${effective}${suggestion ? `  -> libre: ${suggestion}` : ''}\n`,
    );
  }
}

main();
