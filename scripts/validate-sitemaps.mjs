#!/usr/bin/env node
/**
 * Validates the built sitemap output in `dist/`.
 *
 * Run `npm run build` first, then `npm run test:sitemaps`. Exits 1 when any
 * check fails, printing one `OK:`/`FAIL:` line per check or per problem.
 *
 * What it proves:
 *   1. `sitemap-index.xml` references exactly `sitemap-0.xml` and
 *      `news-sitemap.xml` (the index is the single source of truth).
 *   2. `sitemap-0.xml` is clean: canonical host only, no duplicates, no
 *      archive pagination, no legal pages, crawlable-looking paths.
 *   3. `news-sitemap.xml` obeys the Google News rules: both namespaces,
 *      canonical absolute URLs, no duplicates, a `news:news` block per URL
 *      with `news:name` = TechSpain24, `news:language` in {es, en}, a real
 *      `news:publication_date` inside the 48 h window that matches the
 *      article's frontmatter `pubDate` (fabricated dates are caught here).
 *   4. All three files are well-formed XML with the expected declaration.
 *   5. `robots.txt` points at the index and carries no obsolete sitemap URL.
 *
 * Dependency-free on purpose (Node >= 22, built-in modules only), including
 * the hand-rolled XML reader below.
 *
 * Usage: node scripts/validate-sitemaps.mjs [distDir]
 */
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'https://www.techspain24.com';
const SITE_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const NEWS_NS = 'http://www.google.com/schemas/sitemap-news/0.9';
const PUBLICATION_NAME = 'TechSpain24';
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
const WINDOW_MS = 48 * 60 * 60 * 1000;
const LEGAL_PATHS = ['/aviso-legal/', '/privacidad/', '/cookies/'];
const PAGINATION_RE = /^https:\/\/www\.techspain24\.com\/noticias\/\d+\/$/;
const INDEX_SITEMAPS = [`${HOST}/sitemap-0.xml`, `${HOST}/news-sitemap.xml`];
const ROBOTS_INDEX_LINE = `Sitemap: ${HOST}/sitemap-index.xml`;
const ROBOTS_ALLOWED_LINES = [ROBOTS_INDEX_LINE, `Sitemap: ${HOST}/news-sitemap.xml`];

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : join(repoRoot, 'dist');
/** Label used in output lines: `dist/...` for the default, the folder name otherwise. */
const distLabel = basename(distDir);

let checks = 0;
let failures = 0;

const ok = (message) => {
  checks += 1;
  console.log(`OK:   ${message}`);
};

const fail = (message) => {
  checks += 1;
  failures += 1;
  console.error(`FAIL: ${message}`);
};

/** Report one OK summary, or one FAIL line per problem (never repeats the summary). */
const report = (file, summary, problems) => {
  if (problems.length === 0) {
    ok(`${file}: ${summary}`);
    return;
  }
  for (const problem of problems) fail(`${file}: ${problem}`);
};

// -----------------------------------------------------------------------------
// Minimal XML reader: balanced tags, single root, entity hygiene, and enough
// structure to pull text and children out of the nodes we care about.
// -----------------------------------------------------------------------------

/**
 * @param {string} source
 * @returns {{ document: {name: string, attrs: Record<string,string>, children: any[], text: string}, problems: string[] }}
 */
function parseXml(source) {
  const problems = [];
  const documentNode = { name: '#document', attrs: {}, children: [], text: '' };
  const stack = [documentNode];
  const top = () => stack[stack.length - 1];
  const tagPattern = /<[^>]*>/g;
  let cursor = 0;
  let match;

  while ((match = tagPattern.exec(source)) !== null) {
    const between = source.slice(cursor, match.index);
    if (between) top().text += between;
    cursor = tagPattern.lastIndex;
    const tag = match[0];

    if (tag.startsWith('<?')) {
      if (stack.length !== 1) problems.push('XML declaration found inside an element');
      continue;
    }
    if (tag.startsWith('<!--')) {
      if (!tag.endsWith('-->')) problems.push('unterminated comment');
      continue;
    }
    if (tag.startsWith('<!')) {
      // Doctype / CDATA opener: not produced by this project, accepted silently.
      continue;
    }

    if (tag.startsWith('</')) {
      const name = tag.slice(2, -1).trim();
      if (stack.length === 1) {
        problems.push(`stray closing tag </${name}>`);
        continue;
      }
      const open = stack.pop();
      if (open.name !== name) {
        problems.push(`mismatched tag: </${name}> closes <${open.name}>`);
      }
      continue;
    }

    const selfClosing = tag.endsWith('/>');
    const inner = tag.slice(1, selfClosing ? -2 : -1);
    const nameMatch = inner.match(/^[^\s/>]+/);
    if (!nameMatch) {
      problems.push(`unparsable tag ${tag}`);
      continue;
    }
    const attrs = {};
    const attrPattern = /([^\s=/>]+)\s*=\s*"([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrPattern.exec(inner.slice(nameMatch[0].length))) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }
    const node = { name: nameMatch[0], attrs, children: [], text: '' };
    top().children.push(node);
    if (!selfClosing) stack.push(node);
  }

  const trailing = source.slice(cursor);
  if (trailing.trim()) problems.push('content found after the root element');
  if (stack.length > 1) {
    problems.push(`unclosed tag <${stack[stack.length - 1].name}>`);
  }
  if (documentNode.text.trim()) problems.push('text found outside the root element');

  if (documentNode.children.length === 0) {
    problems.push('no root element');
  } else if (documentNode.children.length > 1) {
    problems.push(
      `multiple root elements: ${documentNode.children.map((node) => node.name).join(', ')}`,
    );
  }

  return { document: documentNode, problems };
}

/** Raw `&` that is not part of a character/entity reference. */
function rawAmpersandProblems(source) {
  const problems = [];
  const pattern = /&/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const ahead = source.slice(match.index, match.index + 12);
    if (/^&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/.test(ahead)) continue;
    problems.push(`raw '&' that is not part of an entity near "${ahead.slice(0, 12)}"`);
  }
  return problems;
}

/**
 * Raw `<`/`>` in text content: escaped entities are fine, literal brackets are
 * not (they break parsers and, inside `<loc>`/`<title>`, usually mean broken
 * escaping). Only leaf values that carry URLs or headlines are checked.
 */
function rawAngleBracketProblems(node, problems = []) {
  if (node.name === 'loc' || node.name === 'title' || node.name === 'news:title') {
    if (/[<>]/.test(node.text)) {
      problems.push(
        `raw '<' or '>' inside <${node.name}>: "${node.text.trim().slice(0, 60)}"`,
      );
    }
  }
  for (const child of node.children) rawAngleBracketProblems(child, problems);
  return problems;
}

const childrenNamed = (node, name) => node.children.filter((child) => child.name === name);
const childNamed = (node, name) => node.children.find((child) => child.name === name);

/** Text of a direct child, or undefined when the child is absent/empty. */
const childText = (node, name) => {
  const child = childNamed(node, name);
  return child ? child.text.trim() : undefined;
};

// -----------------------------------------------------------------------------
// Content frontmatter (used to prove `news:publication_date` is not fabricated)
// -----------------------------------------------------------------------------

/** @returns {{pubDate?: string, error?: string, source?: string}} */
function frontmatterPubDate(loc) {
  let url;
  try {
    url = new URL(loc);
  } catch {
    return { error: `not an absolute URL: ${loc}` };
  }

  const esMatch = url.pathname.match(/^\/noticias\/([^/]+)\/$/);
  const enMatch = url.pathname.match(/^\/en\/news\/([^/]+)\/$/);
  if (!esMatch && !enMatch) {
    return { error: `${loc} does not match /noticias/<slug>/ or /en/news/<slug>/` };
  }
  const corpus = esMatch ? 'news' : 'news-en';
  const slug = (esMatch ?? enMatch)[1];
  const folder = join(repoRoot, 'src', 'content', corpus, slug);

  for (const file of ['index.mdx', 'index.md']) {
    const candidate = join(folder, file);
    if (!existsSync(candidate)) continue;
    const raw = readFileSync(candidate, 'utf8');
    // First fenced block only, so `---` in the body can never leak in.
    const frontmatter = raw.split(/^---$/m)[1] ?? '';
    const pubDate = frontmatter.match(/^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (!pubDate) {
      return { error: `no pubDate in frontmatter of ${candidate}` };
    }
    return { pubDate, source: candidate };
  }

  return { error: `no content entry for ${loc} (looked in ${corpus}/${slug}/index.{md,mdx})` };
}

// -----------------------------------------------------------------------------
// Per-file checks
// -----------------------------------------------------------------------------

function readXmlFile(name) {
  const path = join(distDir, name);
  if (!existsSync(path)) {
    fail(`${distLabel}/${name}: missing (run \`npm run build\` first)`);
    return null;
  }

  const source = readFileSync(path, 'utf8');
  const { document, problems } = parseXml(source);
  const local = [
    ...problems,
    ...rawAmpersandProblems(source),
    ...rawAngleBracketProblems(document),
  ];
  if (!source.startsWith(XML_DECLARATION)) {
    local.push(`missing ${XML_DECLARATION} at the start of the file`);
  }

  report(
    `${distLabel}/${name}`,
    'well-formed XML (single root, balanced tags, valid entities, declaration)',
    local,
  );

  const root = document.children.length === 1 && problems.length === 0 ? document.children[0] : null;
  if (!root) {
    fail(`${distLabel}/${name}: root element unusable, skipping content checks`);
    return null;
  }
  return root;
}

function checkIndex(root) {
  const problems = [];
  if (root.name !== 'sitemapindex') problems.push(`root is <${root.name}>, expected <sitemapindex>`);
  if (root.attrs.xmlns !== SITE_NS) {
    problems.push(`xmlns is "${root.attrs.xmlns ?? ''}", expected ${SITE_NS}`);
  }

  const entries = childrenNamed(root, 'sitemap');
  const locs = entries.map((entry) => childText(entry, 'loc') ?? '(missing <loc>)');

  const expected = [...INDEX_SITEMAPS].sort();
  const actual = [...locs].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    problems.push(
      `<sitemap> references are [${locs.join(', ')}], expected exactly [${expected.join(', ')}]`,
    );
  }

  report(
    `${distLabel}/sitemap-index.xml`,
    'references exactly sitemap-0.xml and news-sitemap.xml',
    problems,
  );
}

function checkGeneral(root) {
  const problems = [];
  if (root.name !== 'urlset') problems.push(`root is <${root.name}>, expected <urlset>`);
  if (root.attrs.xmlns !== SITE_NS) {
    problems.push(`xmlns is "${root.attrs.xmlns ?? ''}", expected ${SITE_NS}`);
  }

  const entries = childrenNamed(root, 'url');
  const locs = entries
    .map((entry) => childText(entry, 'loc') ?? '')
    .filter((loc) => loc !== '');
  if (locs.length !== entries.length) {
    problems.push(`${entries.length - locs.length} <url> entr(y/ies) without a <loc>`);
  }

  const seen = new Set();
  for (const loc of locs) {
    if (!loc.startsWith(HOST)) {
      problems.push(`<loc> off the canonical host: ${loc}`);
    } else {
      const url = new URL(loc);
      if (LEGAL_PATHS.includes(url.pathname)) problems.push(`legal page URL: ${loc}`);
    }
    if (seen.has(loc)) problems.push(`duplicate <loc>: ${loc}`);
    seen.add(loc);
    if (PAGINATION_RE.test(loc)) problems.push(`archive pagination URL: ${loc}`);
    if (!loc.endsWith('/') && !/\.[A-Za-z0-9]+$/.test(loc)) {
      problems.push(`<loc> ends with neither '/' nor a file extension: ${loc}`);
    }
  }

  report(
    `${distLabel}/sitemap-0.xml`,
    `${locs.length} URL(s), canonical host, no duplicates, no pagination, no legal pages`,
    problems,
  );
}

function checkNews(root) {
  const problems = [];
  if (root.name !== 'urlset') problems.push(`root is <${root.name}>, expected <urlset>`);
  if (root.attrs.xmlns !== SITE_NS) {
    problems.push(`xmlns is "${root.attrs.xmlns ?? ''}", expected ${SITE_NS}`);
  }
  if (root.attrs['xmlns:news'] !== NEWS_NS) {
    problems.push(`xmlns:news is "${root.attrs['xmlns:news'] ?? ''}", expected ${NEWS_NS}`);
  }

  const entries = childrenNamed(root, 'url');
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const seen = new Set();

  for (const entry of entries) {
    const loc = childText(entry, 'loc') ?? '';
    const label = loc || '(entry without <loc>)';

    if (!loc.startsWith(`${HOST}/`)) {
      problems.push(`<loc> is not an absolute URL on the canonical host: ${loc}`);
    } else {
      const url = new URL(loc);
      if (url.protocol !== 'https:' || url.host !== 'www.techspain24.com') {
        problems.push(`<loc> protocol/host mismatch: ${loc}`);
      }
    }
    if (seen.has(loc)) problems.push(`duplicate <loc>: ${loc}`);
    seen.add(loc);

    const news = childNamed(entry, 'news:news');
    if (!news) {
      problems.push(`${label}: missing <news:news> block`);
      continue;
    }

    const publication = childNamed(news, 'news:publication');
    const name = publication ? childText(publication, 'news:name') : undefined;
    const language = publication ? childText(publication, 'news:language') : undefined;
    if (!publication) {
      problems.push(`${label}: missing <news:publication>`);
    } else {
      if (name !== PUBLICATION_NAME) {
        problems.push(`${label}: <news:name> is "${name ?? ''}", expected ${PUBLICATION_NAME}`);
      }
      if (language !== 'es' && language !== 'en') {
        problems.push(`${label}: <news:language> is "${language ?? ''}", expected es or en`);
      }
    }

    const dateText = childText(news, 'news:publication_date');
    const timestamp = dateText ? Date.parse(dateText) : NaN;
    if (!dateText || Number.isNaN(timestamp)) {
      problems.push(
        `${label}: <news:publication_date> is not a parseable ISO 8601 date: "${dateText ?? ''}"`,
      );
    } else {
      if (timestamp < cutoff) {
        problems.push(`${label}: <news:publication_date> ${dateText} is outside the last 48 h`);
      }
      if (timestamp > now) {
        problems.push(`${label}: <news:publication_date> ${dateText} is in the future`);
      }
      const expected = frontmatterPubDate(loc);
      if (expected.error) {
        problems.push(`${label}: ${expected.error}`);
      } else if (dateText.slice(0, 10) !== expected.pubDate) {
        problems.push(
          `${label}: <news:publication_date> ${dateText} does not match frontmatter pubDate ${expected.pubDate} (${expected.source})`,
        );
      }
    }

    const title = childText(news, 'news:title');
    if (!title) problems.push(`${label}: empty <news:title>`);
  }

  report(
    `${distLabel}/news-sitemap.xml`,
    `${entries.length} URL(s), namespaces, 48 h window, real pubDates`,
    problems,
  );
}

function checkRobots() {
  const path = join(distDir, 'robots.txt');
  if (!existsSync(path)) {
    fail(`${distLabel}/robots.txt: missing (run \`npm run build\` first)`);
    return;
  }

  const source = readFileSync(path, 'utf8');
  const lines = source.split(/\r?\n/);
  const problems = [];

  if (!lines.includes(ROBOTS_INDEX_LINE)) {
    problems.push(`missing line "${ROBOTS_INDEX_LINE}"`);
  }

  for (const line of lines) {
    if (!/^sitemap:/i.test(line.trim())) continue;
    if (!ROBOTS_ALLOWED_LINES.includes(line.trim())) {
      problems.push(`unexpected sitemap reference: "${line.trim()}"`);
    }
  }

  // Any bare `sitemap.xml` reference (e.g. `/sitemap.xml`) is obsolete; the
  // only tolerated occurrences are inside `news-sitemap.xml`.
  const pattern = /sitemap\.xml/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    if (source.slice(Math.max(0, match.index - 5), match.index) === 'news-') continue;
    const near = source.slice(Math.max(0, match.index - 20), match.index + 12).trim();
    problems.push(`obsolete sitemap.xml reference near "${near}"`);
  }

  report(`${distLabel}/robots.txt`, 'index reference present, no obsolete sitemap URLs', problems);
}

// -----------------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------------

const indexRoot = readXmlFile('sitemap-index.xml');
const generalRoot = readXmlFile('sitemap-0.xml');
const newsRoot = readXmlFile('news-sitemap.xml');

if (indexRoot) checkIndex(indexRoot);
if (generalRoot) checkGeneral(generalRoot);
if (newsRoot) checkNews(newsRoot);
checkRobots();

if (failures > 0) {
  console.error(`\nFAIL: ${failures} problem(s) out of ${checks} check(s) in ${distDir}`);
  process.exit(1);
}
console.log(`\nOK: all ${checks} check(s) passed in ${distDir}`);
