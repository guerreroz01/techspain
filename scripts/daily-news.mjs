#!/usr/bin/env node
/**
 * daily-news.mjs — Genera la lista diaria de artículos nuevos desde nuestras fuentes.
 *
 * Uso:
 *   node scripts/daily-news.mjs            # ventana de 2 días, solo verticales
 *   node scripts/daily-news.mjs --all      # incluye artículos sin vertical
 *   node scripts/daily-news.mjs --days 3   # ventana de 3 días
 *   node scripts/daily-news.mjs --limit 30 # tope de artículos a mostrar en consola
 *
 * Lee src/data/sources.json, descarga los feeds (campo `rss`), descarta lo ya visto
 * (scripts/.seen.json) y clasifica cada artículo en las 7 verticales. Escribe
 * scripts/candidates.json y un informe en markdown por consola.
 *
 * Sin dependencias: usa `fetch` (global en Node 18+) y un parser RSS/Atom propio.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCES_PATH = join(ROOT, 'src', 'data', 'sources.json');
const STATE_PATH = join(__dirname, '.seen.json');
const OUT_PATH = join(__dirname, 'candidates.json');
const SELECTION_PATH = join(__dirname, 'seleccion.md');

const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;

/** Palabras clave por vertical (inglés + español). Coincidencia por subcadena, sin distinción de mayúsculas. */
const VERTICALS = {
  // Tutoriales va primero a propósito: el informe agrupa cada artículo por su
  // vertical principal (`verticals[0]`), así que una guía how-to debe ganarle
  // al vertical de hardware del que trate para que aparezca bajo "Tutoriales".
  tutoriales: [
    'how to', 'how-to', 'tutorial', 'tutoriales', 'walkthrough', 'step by step',
    'step-by-step', 'guide', 'guía', 'guia', 'paso a paso', 'trucos', 'consejos',
    'cómo', 'como hacer', 'aprende', 'aprender', 'instalar', 'configurar',
  ],
  'tarjetas-graficas': [
    'gpu', 'graphics card', 'tarjeta gráfica', 'tarjeta grafica', 'geforce', 'rtx', 'radeon',
    'arc gpu', 'dlss', 'ray tracing', 'raytracing', 'video card', 'dx12', 'vulkan', 'fsr',
  ],
  memorias: [
    'ram', 'dram', 'ddr4', 'ddr5', 'ddr6', 'memory module', 'módulo de memoria', 'ssd', 'nvme',
    'nand', 'storage', 'almacenamiento', 'hbm', 'memory chip', 'sram', 'feram', 'lpcamm',
  ],
  portatiles: [
    'laptop', 'notebook', 'portátil', 'portatil', 'ultrabook', 'chromebook', '2-in-1',
    'convertible', 'macbook', 'thinkpad', 'zenbook', 'ideapad', 'zephyrus', 'legion laptop',
  ],
  consolas: [
    'console', 'consola', 'handheld', 'playstation', 'ps5', 'ps6', 'xbox', 'nintendo', 'switch',
    'steam deck', 'steamdeck', 'rog ally', 'legion go', 'game console', 'ps4',
  ],
  componentes: [
    'cpu', 'processor', 'procesador', 'motherboard', 'placa base', 'mainboard', 'psu',
    'fuente de alimentación', 'power supply', 'cooling', 'refrigeración', 'refrigeracion',
    'cooler', 'disipador', 'heatsink', 'aio', 'case', 'caja', 'chassis', 'power connector',
    'chipset', 'x870', 'b850', 'z890', 'b760', 'am5', 'lga', 'ryzen', 'core ultra', 'apu',
  ],
  moviles: [
    'phone', 'smartphone', 'móvil', 'movil', 'teléfono', 'telefono', 'iphone', 'android',
    'pixel', 'galaxy', 'xiaomi', 'redmi', 'poco', 'oneplus', 'oppo', 'realme', 'honor',
    'huawei', 'motorola', 'nokia', 'snapdragon', 'mediatek', 'dimensity', 'exynos',
    'foldable', 'plegable',
  ],
};

/*
 * A tutorial marker on its own is not a technology signal: "how to watch the F1
 * race" and "how to fish in Valheim" are guides, but they are not this portal's
 * subject. Requiring a tech term as well fails closed, which is the right way to
 * be wrong here: a candidate missing from the report costs one glance, while a
 * polluted list offers entertainment as a tutorial.
 */
const TECH_SIGNAL = [
  ...Object.entries(VERTICALS).flatMap(([v, kws]) => (v === 'tutoriales' ? [] : kws)),
  'windows', 'macos', 'linux', 'ubuntu', 'ios', 'ipados', 'android', 'app', 'apps',
  'software', 'programa', 'aplicación', 'aplicacion', 'navegador', 'browser',
  'chrome', 'firefox', 'safari', 'router', 'wifi', 'usb', 'hdmi', 'bios', 'uefi',
  'driver', 'controlador', 'disco', 'archivo', 'archivos', 'carpeta',
  'contraseña', 'contrasena', 'password', 'cuenta', 'privacidad', 'seguridad',
  'backup', 'copia de seguridad', 'excel', 'word', 'office', 'google', 'drive',
  'cloud', 'nube', 'servidor', 'server', 'internet', 'datos', 'pc', 'ordenador',
  'computadora', 'computer', 'escritorio', 'pantalla', 'monitor', 'teclado',
  'ratón', 'raton', 'impresora', 'telegram', 'whatsapp', 'notificaciones',
  'correo', 'email',
];

const VERTICAL_LABELS = {
  tutoriales: '📘 Tutoriales',
  'tarjetas-graficas': '🎮 Tarjetas gráficas',
  memorias: '💾 Memorias',
  portatiles: '💻 Portátiles',
  consolas: '🕹️ Consolas',
  componentes: '🔧 Componentes',
  moviles: '📱 Móviles',
};

/* ------------------------------------------------------------------ */
/* Parser RSS/Atom mínimo (sin dependencias)                           */
/* ------------------------------------------------------------------ */

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function firstTag(block, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i');
  const m = block.match(re);
  return m ? decodeEntities(m[1]).trim() : '';
}

function atomLink(block) {
  const m = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return m ? m[1].trim() : '';
}

function parseFeedXml(xml) {
  const isAtom = /<feed[\s>]/i.test(xml);
  const tag = isAtom ? 'entry' : 'item';
  const itemRe = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const items = [];
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = firstTag(block, 'title');
    const link = isAtom ? atomLink(block) : firstTag(block, 'link');
    const pubDate = isAtom
      ? firstTag(block, 'updated') || firstTag(block, 'published')
      : firstTag(block, 'pubDate');
    const description =
      firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content');
    const guid = firstTag(block, 'guid') || firstTag(block, 'id') || link;
    items.push({ title, link, pubDate, description, guid });
  }
  return items;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function stripHtml(html) {
  if (!html) return '';
  return decodeEntities(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, n = 180) {
  return text.length > n ? text.slice(0, n).trimEnd() + '…' : text;
}

function classify(text) {
  const t = text.toLowerCase();
  const matchesAny = (keywords) =>
    keywords.some((k) =>
      new RegExp(`(^|[^${WORD_CHARS}])${escapeRegex(k)}(?=$|[^${WORD_CHARS}])`, 'i').test(t),
    );

  const hits = [];
  for (const [v, kws] of Object.entries(VERTICALS)) {
    if (!matchesAny(kws)) continue;
    // A guide about something outside technology is not one of this portal's
    // tutorials; see TECH_SIGNAL.
    if (v === 'tutoriales' && !matchesAny(TECH_SIGNAL)) continue;
    hits.push(v);
  }
  return hits;
}

const WORD_CHARS = 'a-z0-9áéíóúüñ';
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseArgs(argv) {
  const num = (flag) => {
    const i = argv.indexOf(flag);
    if (i === -1) return undefined;
    const v = Number(argv[i + 1]);
    return Number.isFinite(v) ? v : undefined;
  };
  return {
    days: num('--days') ?? 2,
    limit: num('--limit') ?? Infinity,
    includeOthers: argv.includes('--all'),
  };
}

async function fetchFeed(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(source.rss, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'techspain-newsbot/1.0 (+editorial)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return { source, items: parseFeedXml(xml) };
  } catch (error) {
    const msg = error.name === 'AbortError' ? 'timeout' : error.message;
    return { source, items: [], error: msg };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAll(sources) {
  const results = [];
  const queue = [...sources];
  async function worker() {
    while (queue.length) results.push(await fetchFeed(queue.shift()));
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, sources.length) }, worker));
  return results;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const { days, limit, includeOthers } = parseArgs(process.argv.slice(2));

  const data = JSON.parse(readFileSync(SOURCES_PATH, 'utf8'));
  const withRss = data.sources.filter((s) => s.rss);
  const withoutRss = data.sources.filter((s) => !s.rss);

  const state = existsSync(STATE_PATH) ? JSON.parse(readFileSync(STATE_PATH, 'utf8')) : { seen: {} };
  const seen = state.seen || {};

  const since = Date.now() - days * 24 * 60 * 60 * 1000;

  process.stderr.write(`Descargando ${withRss.length} feeds (concurrencia ${CONCURRENCY})…\n`);
  const results = await fetchAll(withRss);

  const newSeen = { ...seen };
  const candidates = [];
  const failed = [];

  for (const { source, items, error } of results) {
    if (error) {
      failed.push({ name: source.name, error });
      continue;
    }
    for (const item of items) {
      const guid = item.guid || item.link;
      if (!guid) continue;
      const date = item.pubDate ? new Date(item.pubDate) : null;
      const ts = date && !Number.isNaN(date.getTime()) ? date.getTime() : Date.now();

      newSeen[guid] = true;
      if (seen[guid]) continue; // ya visto en una corrida anterior
      if (ts < since) continue; // fuera de la ventana (primer arranque)

      const description = stripHtml(item.description);
      // Clasificamos solo por el título: las menciones incidentales en la
      // descripción ("GPU", "RAM", "SSD") ensucian el resultado.
      const verticals = classify(item.title || '');

      candidates.push({
        id: guid,
        title: item.title || '(sin título)',
        url: item.link || '',
        date: Number.isNaN(ts) ? null : new Date(ts).toISOString(),
        source: source.id,
        sourceName: source.name,
        verticals,
        description: truncate(description),
      });
    }
  }

  candidates.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  mkdirSync(__dirname, { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify({ lastRun: new Date().toISOString(), seen: newSeen }, null, 2));
  writeFileSync(
    OUT_PATH,
    JSON.stringify({ generated: new Date().toISOString(), count: candidates.length, candidates }, null, 2),
  );
  writeSelectionFile(candidates, includeOthers);

  printReport({ candidates, withoutRss, failed, days, limit, includeOthers });
}

function mdLink(title, url) {
  return `[${title.replace(/([\[\]])/g, '\\$1')}](${url})`;
}

function writeSelectionFile(candidates, includeOthers) {
  // Cada artículo aparece UNA vez, bajo su vertical principal.
  const byVertical = {};
  const others = [];
  const seen = new Set();
  for (const c of candidates) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    const v = c.verticals[0];
    if (v) (byVertical[v] ||= []).push(c);
    else others.push(c);
  }

  const lines = [];
  lines.push(`# Selección de artículos — ${new Date().toLocaleDateString('es-ES')}`);
  lines.push('');
  lines.push('Marca los que quieras publicar cambiando `[ ]` por `[*]`.');
  lines.push('');

  for (const [v, label] of Object.entries(VERTICAL_LABELS)) {
    const items = byVertical[v] || [];
    if (items.length === 0) continue;
    lines.push(`## ${label}`);
    lines.push('');
    for (const c of items) lines.push(`- [ ] ${mdLink(c.title, c.url)} — ${c.sourceName}`);
    lines.push('');
  }

  if (others.length > 0 && includeOthers) {
    lines.push('## Otros (sin vertical)');
    lines.push('');
    for (const c of others) lines.push(`- [ ] ${mdLink(c.title, c.url)} — ${c.sourceName}`);
    lines.push('');
  }

  writeFileSync(SELECTION_PATH, lines.join('\n'));
}

function printReport({ candidates, withoutRss, failed, days, limit, includeOthers }) {
  // Agrupar TODOS los candidatos para contadores exactos; el límite solo recorta
  // cuántos se listan en consola.
  const grouped = {};
  const others = [];
  const seen = new Set();
  for (const c of candidates) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    const v = c.verticals[0]; // vertical principal (evita duplicados)
    if (v) (grouped[v] ||= []).push(c);
    else others.push(c);
  }
  const matchedCount = Object.values(grouped).reduce((n, arr) => n + arr.length, 0);

  let out = '';
  out += `# Novedades de nuestras fuentes (últimas ${days} d)\n\n`;
  out += `**${candidates.length}** artículos nuevos · **${matchedCount}** dentro de verticales · ${new Date().toISOString()}\n\n`;

  let idx = 0;
  let budget = limit === Infinity ? Infinity : limit;
  for (const [v, label] of Object.entries(VERTICAL_LABELS)) {
    const items = grouped[v] || [];
    if (items.length === 0) continue;
    out += `## ${label} (${items.length})\n\n`;
    for (const c of items) {
      if (budget <= 0) break;
      budget -= 1;
      idx += 1;
      const when = c.date ? new Date(c.date).toLocaleDateString('es-ES') : '—';
      out += `**[${idx}]** ${c.title} — _${c.sourceName}_ (${when})\n     ${c.url}\n`;
      if (c.description) out += `     ${truncate(c.description, 140)}\n\n`;
    }
  }

  if (others.length > 0 && includeOthers) {
    out += `## Otros (sin vertical) (${others.length})\n\n`;
    for (const c of others) {
      if (budget <= 0) break;
      budget -= 1;
      idx += 1;
      const when = c.date ? new Date(c.date).toLocaleDateString('es-ES') : '—';
      out += `**[${idx}]** ${c.title} — _${c.sourceName}_ (${when})\n     ${c.url}\n\n`;
    }
  } else if (others.length > 0) {
    out += `\n_${others.length} artículo(s) sin vertical omitidos (usa --all para verlos)._\n`;
  }

  if (failed.length > 0) {
    out += `\n## Feeds con error (${failed.length})\n\n`;
    for (const f of failed) out += `- ${f.name}: ${f.error}\n`;
  }

  if (withoutRss.length > 0) {
    out += `\n## Fuentes sin RSS (seguimiento manual, ${withoutRss.length})\n\n`;
    out += withoutRss.map((s) => `- ${s.name} — ${s.homepage}`).join('\n') + '\n';
  }

  out += `\n---\n_Lista también en scripts/candidates.json · usa los números para seleccionar._\n`;
  process.stdout.write(out + '\n');
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
