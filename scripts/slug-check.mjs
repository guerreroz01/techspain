#!/usr/bin/env node
/**
 * slug-check.mjs — Comprueba si un slug está libre en `src/content/news/`.
 *
 * Uso:
 *   npm run slug -- <slug> [<slug>...]   # uno o varios slugs
 *   npm run slug -- --count              # solo el total de artículos
 *
 * Por qué existe: para saber qué slugs existen, el agente listaba la carpeta
 * entera (`ls src/content/news/`). Con cientos de artículos eso son ~12 KB de
 * contexto POR LLAMADA, y el listado no dice nada que una consulta puntual no
 * responda. Acá se responde en una línea por slug.
 *
 * Salida (una línea por slug):
 *   libre   <slug>
 *   ocupado <slug>  -> libre: <slug>-2
 *
 * Siempre sale con código 0 (salvo uso incorrecto): es una consulta informativa,
 * no un chequeo que deba cortar una cadena de comandos.
 *
 * Sin dependencias: solo `node:fs` y `node:path`, como el resto de `scripts/`.
 * La carpeta `src/content/news/<slug>/` es la fuente de verdad: el nombre de la
 * carpeta ES el slug de la URL (`entry.id`).
 */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_DIR = join(__dirname, '..', 'src', 'content', 'news');

/** Nombres de carpeta existentes: cada uno cuenta como slug ocupado. */
function existingSlugs() {
  return new Set(
    readdirSync(NEWS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name),
  );
}

/** Primer sufijo `-2`, `-3`… libre para un slug ya ocupado. */
function nextFree(slug, taken) {
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${slug}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}

function main() {
  // npm pasa los argumentos después de `--`; se ignora un `--` suelto por si
  // alguna versión lo reenvía.
  const args = process.argv.slice(2).filter((arg) => arg !== '--');

  if (args.length === 0) {
    process.stderr.write('Uso: npm run slug -- <slug> [<slug>...] | --count\n');
    process.exitCode = 1;
    return;
  }

  const taken = existingSlugs();

  if (args[0] === '--count') {
    process.stdout.write(`${taken.size}\n`);
    return;
  }

  for (const slug of args) {
    if (!taken.has(slug)) {
      process.stdout.write(`libre   ${slug}\n`);
      continue;
    }
    const suggestion = nextFree(slug, taken);
    process.stdout.write(
      `ocupado ${slug}${suggestion ? `  -> libre: ${suggestion}` : ''}\n`,
    );
  }
}

main();
