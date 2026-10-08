#!/usr/bin/env node
/**
 * translate-en.mjs — Genera el compañero en inglés (`news-en`) de un artículo
 * español con el modelo local de LM Studio (API compatible con OpenAI, texto
 * entra / texto sale, **sin** herramientas).
 *
 * Uso:
 *   npm run translate:en -- <vertical>/<slug> [--en <english-slug>]
 *                                          [--model <id>] [--base-url <url>]
 *                                          [--dry-run]
 *
 * Entorno (precedencia: flag CLI > variable > default):
 *   LMSTUDIO_BASE_URL    default http://127.0.0.1:1234/v1
 *   LM_API_TOKEN         si está definido, se manda `Authorization: Bearer`
 *   TRANSLATE_MODEL      default qwen3.8-9b-abliterated-25
 *   TRANSLATE_TIMEOUT_MS default 180000
 *   TRANSLATE_MAX_TOKENS default 8192
 *
 * Contrato de fallback (lo lee el orquestador): CUALQUIER salida con código
 * distinto de cero significa "endpoint no disponible / salida inválida", y el
 * orquestador delega el compañero EN a un subagente remoto. Por eso todo fallo
 * (endpoint caído, non-2xx, timeout, JSON inválido, validación) sale con código
 * != 0 y un motivo claro en stderr. Este script NUNCA cambia la pieza española:
 * solo lee su `index.mdx` y escribe/actualiza la carpeta inglesa.
 *
 * El frontmatter lo recompone el script de forma determinista; el modelo solo
 * devuelve JSON con { title, description, coverAlt, tags, slug, body }. Nunca se
 * acepta MDX completo del modelo.
 *
 * Sin dependencias: solo `node:fs`, `node:path` y `node:url`; `fetch` es global
 * en Node >= 22 (engines del proyecto).
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_DIR = join(__dirname, '..', 'src', 'content', 'news');
const NEWS_EN_DIR = join(__dirname, '..', 'src', 'content', 'news-en');
const VERTICALS_FILE = join(__dirname, '..', 'src', 'lib', 'verticals.ts');

const DEFAULT_BASE_URL = 'http://127.0.0.1:1234/v1';
const DEFAULT_MODEL = 'qwen3.8-9b-abliterated-25';
const DEFAULT_TIMEOUT_MS = 180000;
const DEFAULT_MAX_TOKENS = 8192;

const USAGE =
  'Uso: npm run translate:en -- <vertical>/<slug> [--en <english-slug>] ' +
  '[--model <id>] [--base-url <url>] [--dry-run]\n';

/** Error con motivo en español; se imprime como `Error: <motivo>` y sale != 0. */
class ScriptError extends Error {}

/** Aborta la ejecución con un motivo claro en stderr (código != 0). */
function fail(reason) {
  throw new ScriptError(reason);
}

/** Entero positivo de una variable de entorno, o el default. */
function positiveInt(raw, fallback) {
  const value = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Quita comillas envolventes y desescapa el contenido. */
function stripQuotes(value) {
  const text = value.trim();
  if (text.length >= 2 && text.startsWith("'") && text.endsWith("'")) {
    return text.slice(1, -1).replace(/''/g, "'");
  }
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  return text;
}

/** Campo escalar de primer nivel del frontmatter, sin comillas. */
function scalar(frontmatter, name) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return match ? stripQuotes(match[1]) : undefined;
}

/** Campo booleano de primer nivel (`true`/`false`). */
function booleanField(frontmatter, name, fallback) {
  const value = scalar(frontmatter, name);
  if (value === undefined) return fallback;
  return value === 'true';
}

/** Bloque `source: { name, url }`; null si falta cualquiera de los dos. */
function sourceBlock(frontmatter) {
  const block = frontmatter.match(/^source:\s*\n((?:[ \t]+.*(?:\n|$))*)/m);
  if (!block) return null;
  const name = block[1].match(/^[ \t]+name:\s*(.+)$/m);
  const url = block[1].match(/^[ \t]+url:\s*(.+)$/m);
  if (!name || !url) return null;
  return { name: stripQuotes(name[1]), url: stripQuotes(url[1]) };
}

/** Separa el frontmatter del cuerpo; null si el archivo no trae frontmatter. */
function splitEntry(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  return { frontmatter: match[1], body: match[2] ?? '' };
}

/**
 * Ids de todas las entradas de una colección (ruta relativa, `vertical/slug`).
 * Misma lógica que `scripts/slug-check.mjs` para no duplicar criterios.
 */
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

/** Último segmento de un id (`vertical/slug` -> `slug`). */
const basename = (id) => id.slice(id.lastIndexOf('/') + 1);

/** Etiquetas de vertical leídas del registro (fuente única): token -> { es, en }. */
function verticalLabels() {
  const raw = readFileSync(VERTICALS_FILE, 'utf8');
  const labels = new Map();
  const rx = /token:\s*'([^']+)',\s*es:\s*'([^']*)',\s*en:\s*'([^']*)'/g;
  let match;
  while ((match = rx.exec(raw)) !== null) labels.set(match[1], { es: match[2], en: match[3] });
  return labels;
}

/**
 * Slug de artículo: kebab-case, minúsculas y ASCII. Misma normalización que
 * `scripts/slug-check.mjs` (NFD, sin diacríticos, `[^a-z0-9]+` -> `-`).
 */
function normalizeSlug(slug) {
  return slug
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Primer sufijo `-2`, `-3`… libre para un slug ya ocupado. */
function nextFree(slug, taken) {
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${slug}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}

/** Valor de string YAML entre comillas simples, con `'` -> `''`. */
function yamlString(value) {
  return `'${String(value).replace(/\r?\n/g, ' ').replace(/'/g, "''")}'`;
}

/** Arma el prompt ES->EN: traducción fiel, sin hechos añadidos ni quitados. */
function buildMessages(entry, body) {
  const system = [
    'You are a professional Spanish-to-English translator for a technology news site.',
    'Translate the provided Spanish article faithfully into neutral, professional English.',
    'Rules:',
    '- Preserve every fact, number, quote and date. Do not add, remove or editorialize.',
    '- Keep every image path exactly as written (e.g. ./assets/...).',
    '- Keep every URL exactly as written; do not translate or rewrite links.',
    '- Translate the title, description, coverAlt and tags.',
    '- Choose a kebab-case, lowercase, ASCII English slug derived from the English title.',
    '- Return ONLY valid JSON, with no markdown fences and no commentary, using this exact shape:',
    '  {"title": string, "description": string, "coverAlt": string, "tags": string[], "slug": string, "body": string}',
    'The `body` field holds the full translated article in Markdown (headings included) and must NOT contain the frontmatter.',
  ].join('\n');

  const user = [
    'Translate this Spanish technology-news article into English and return the JSON object described above.',
    '',
    `SPANISH TITLE: ${entry.title ?? ''}`,
    `SPANISH DESCRIPTION: ${entry.description ?? ''}`,
    `SPANISH COVER ALT: ${entry.coverAlt ?? ''}`,
    `SPANISH TAGS: ${entry.tagsRaw ?? '[]'}`,
    '',
    'SPANISH BODY (Markdown, without frontmatter):',
    '<<<BODY',
    body,
    'BODY>>>',
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/** Extrae el objeto JSON de `message.content` (quita fences, toma el `{…}` externo). */
function extractJson(content) {
  let text = content.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    fail('la respuesta del modelo no contiene un objeto JSON');
  }
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    fail('la respuesta del modelo no es JSON válido');
  }
}

/** Valida la forma mínima que exige el frontmatter/cuerpo ingleses. */
function validate(result) {
  const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    fail('el modelo no devolvió un objeto JSON');
  }
  if (!isNonEmptyString(result.title)) fail('el modelo no devolvió un `title` válido');
  if (!isNonEmptyString(result.description)) fail('el modelo no devolvió una `description` válida');
  if (!isNonEmptyString(result.body)) fail('el modelo no devolvió un `body` válido');
  if (
    !Array.isArray(result.tags) ||
    result.tags.length === 0 ||
    !result.tags.every((tag) => isNonEmptyString(tag))
  ) {
    fail('el modelo no devolvió un array `tags` válido y no vacío');
  }
}

/** Normaliza para comparar tags sin acentos ni mayúsculas. */
const foldTag = (value) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

/** Tags EN: la etiqueta inglesa de la vertical primero, luego las traducidas. */
function composeTags(vertical, modelTags) {
  const label = verticalLabels().get(vertical)?.en;
  const chosen = [];
  const seen = new Set();
  const push = (tag) => {
    const text = String(tag).trim();
    const key = foldTag(text);
    if (!text || seen.has(key)) return;
    seen.add(key);
    chosen.push(text);
  };
  if (label) push(label);
  for (const tag of modelTags) push(tag);
  return chosen;
}

/** Compone el `index.mdx` inglés de forma determinista. */
function composeMdx(entry, result, translationOf) {
  const lines = [
    '---',
    `title: ${yamlString(result.title)}`,
    `description: ${yamlString(result.description)}`,
    `pubDate: ${entry.pubDate}`,
  ];
  if (entry.updatedDate) lines.push(`updatedDate: ${entry.updatedDate}`);
  const tags = composeTags(entry.vertical, result.tags);
  lines.push(`tags: [${tags.map(yamlString).join(', ')}]`);
  if (entry.cover) lines.push(`cover: ${yamlString(entry.cover)}`);
  const coverAlt = typeof result.coverAlt === 'string' && result.coverAlt.trim() ? result.coverAlt : entry.coverAlt;
  if (entry.cover && coverAlt) lines.push(`coverAlt: ${yamlString(coverAlt)}`);
  if (entry.source) {
    lines.push('source:');
    lines.push(`  name: ${yamlString(entry.source.name)}`);
    lines.push(`  url: ${yamlString(entry.source.url)}`);
  }
  lines.push(`draft: ${entry.draft}`);
  lines.push(`translationOf: ${yamlString(translationOf)}`);
  lines.push('---', '', String(result.body).trim(), '');

  return lines.join('\n');
}

/** Lee y parsea el `index.mdx` español con regex puntuales (sin dependencia YAML). */
function readSpanishEntry(id) {
  const [vertical, slug] = id.split('/');
  const dir = join(NEWS_DIR, vertical, slug);
  const file = join(dir, 'index.mdx');
  if (!existsSync(file)) {
    fail(`no existe la entrada española ${file}; revisá la vertical y el slug`);
  }
  const split = splitEntry(readFileSync(file, 'utf8'));
  if (!split) fail(`la entrada española no tiene frontmatter delimitado por '---'`);

  const entry = {
    vertical,
    slug,
    dir,
    pubDate: scalar(split.frontmatter, 'pubDate'),
    updatedDate: scalar(split.frontmatter, 'updatedDate'),
    cover: scalar(split.frontmatter, 'cover'),
    coverAlt: scalar(split.frontmatter, 'coverAlt'),
    tagsRaw: scalar(split.frontmatter, 'tags'),
    title: scalar(split.frontmatter, 'title'),
    description: scalar(split.frontmatter, 'description'),
    source: sourceBlock(split.frontmatter),
    draft: booleanField(split.frontmatter, 'draft', false),
    body: split.body,
  };
  if (!entry.pubDate) fail(`la entrada española no tiene 'pubDate' en el frontmatter`);
  return entry;
}

/** Llama al endpoint local y devuelve el `message.content` como string. */
async function translate({ baseURL, token, model, messages, timeoutMs, maxTokens }) {
  const url = `${baseURL.replace(/\/+$/, '')}/chat/completions`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: maxTokens, stream: false }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    const reason = error?.name === 'AbortError' ? `timeout a los ${timeoutMs} ms` : error?.message;
    fail(`no se pudo contactar el endpoint local (${baseURL}): ${reason}`);
  }
  clearTimeout(timer);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const snippet = body.replace(/\s+/g, ' ').trim().slice(0, 300);
    fail(`el endpoint respondió ${response.status} ${response.statusText}${snippet ? ` — ${snippet}` : ''}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    fail('el endpoint devolvió una respuesta que no es JSON');
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    fail('el endpoint devolvió una respuesta sin `choices[0].message.content`');
  }
  return content;
}

/** Parser de argumentos: posición único y flags con valor. */
function parseArgs(argv) {
  const flags = {};
  const positionals = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--') continue;
    if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--en' || arg === '--model' || arg === '--base-url') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) fail(`falta el valor de ${arg}`);
      flags[arg.slice(2)] = value;
      i += 1;
    } else if (arg.startsWith('--')) {
      fail(`opción desconocida: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }
  return { flags, positionals };
}

async function main() {
  const { flags, positionals } = parseArgs(process.argv.slice(2));

  if (positionals.length !== 1) {
    process.stderr.write(USAGE);
    process.exitCode = 1;
    return;
  }

  const id = positionals[0];
  const segments = id.split('/');
  if (segments.length !== 2 || !segments[0] || !segments[1]) {
    fail(`el id debe tener exactamente dos segmentos '<vertical>/<slug>': recibí '${id}'`);
  }
  const [vertical] = segments;

  const entry = readSpanishEntry(id);
  const model = flags.model || process.env.TRANSLATE_MODEL || DEFAULT_MODEL;
  const baseURL = flags['base-url'] || process.env.LMSTUDIO_BASE_URL || DEFAULT_BASE_URL;
  const token = process.env.LM_API_TOKEN || '';
  const timeoutMs = positiveInt(process.env.TRANSLATE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const maxTokens = positiveInt(process.env.TRANSLATE_MAX_TOKENS, DEFAULT_MAX_TOKENS);

  const content = await translate({
    baseURL,
    token,
    model,
    messages: buildMessages(entry, entry.body),
    timeoutMs,
    maxTokens,
  });
  const result = extractJson(content);
  validate(result);

  const taken = new Set([...existingIds(NEWS_EN_DIR)].map(basename));
  const reserved = new Set(verticalLabels().keys());
  const requested = normalizeSlug(flags.en || result.slug || result.title);
  if (!requested) fail('no se pudo derivar un slug EN válido (revisá `--en` o el título)');
  const enSlug =
    taken.has(requested) || reserved.has(requested)
      ? nextFree(requested, new Set([...taken, ...reserved]))
      : requested;
  if (!enSlug) fail(`no hay sufijo libre para el slug '${requested}'`);

  const composed = composeMdx(entry, result, id);

  if (flags.dryRun) {
    process.stdout.write(composed);
    return;
  }

  const targetDir = join(NEWS_EN_DIR, vertical, enSlug);
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(targetDir, 'index.mdx'), composed);

  const sourceAssets = join(entry.dir, 'assets');
  if (existsSync(sourceAssets)) {
    cpSync(sourceAssets, join(targetDir, 'assets'), { recursive: true });
  }

  process.stdout.write(`EN listo: src/content/news-en/${vertical}/${enSlug}/index.mdx\n`);
}

main().catch((error) => {
  const reason = error instanceof ScriptError ? error.message : error?.message || String(error);
  process.stderr.write(`Error: ${reason}\n`);
  process.exitCode = 1;
});
