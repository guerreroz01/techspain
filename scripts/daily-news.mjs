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
 * (scripts/.seen.json) y clasifica cada artículo en los verticales editoriales. Escribe
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
    'como hacer', 'aprende', 'aprender', 'improve your',
    // El «cómo» interrogativo suelto NO marca tutorial (enganchaba noticias como
    // «cómo y cuándo»). Solo cuenta la construcción «cómo + verbo», resuelta por
    // TUTORIAL_HOWTO_RX junto a WORD_CHARS. Por el mismo motivo se retiran
    // 'instalar' y 'configurar' a secas: «sin instalar Android» no es un tutorial.
  ],
  // Wearables va antes que `moviles` a propósito: un titular como "Samsung
  // Galaxy Watch 8" también coincide con `moviles` por "galaxy", y uno de
  // "Pixel Watch" por "pixel", así que el reloj debe ganarles para no quedar
  // diluido dentro de la telefonía. Es un bloque editorial único (relojes,
  // anillos y gafas inteligentes); ver AGENTS.md §16.
  //
  // Se deja FUERA el paraguas genérico de realidad virtual (`vr`, `virtual
  // reality`, `vr game`): un titular de juego de VR ("Echoes of Mora VR llega a
  // Steam") entraría en wearables y no es un artículo de hardware ponible. Solo
  // entra el XR cuando nombra el producto o las siglas AR de gafas.
  //
  // También se deja fuera 'watch' y 'ring' a secas: son palabras demasiado
  // comunes ("watch the trailer", "ring") y ensuciarían el vertical. Las
  // familias se listan siempre con su marca delante.
  wearables: [
    // Genérico
    'wearable', 'wearables', 'ponible', 'ponibles',
    // Relojes
    'smartwatch', 'smartwatches', 'smart watch', 'smart watches',
    'reloj inteligente', 'relojes inteligentes',
    'apple watch', 'watchos', 'watch os', 'galaxy watch', 'pixel watch',
    'huawei watch', 'honor watch', 'oneplus watch', 'xiaomi watch',
    'redmi watch', 'watch gt', 'watch fit', 'watch ultra',
    // Pulseras y monitores de actividad
    'pulsera de actividad', 'pulsera inteligente', 'banda de actividad',
    'fitness tracker', 'activity tracker', 'fitbit',
    // Anillos
    'smart ring', 'smart rings', 'anillo inteligente', 'anillos inteligentes',
    'galaxy ring', 'oura', 'ringconn', 'ultrahuman', 'whoop',
    // Gafas inteligentes y XR de hardware
    'smart glasses', 'smartglasses', 'smartglass', 'ar glasses', 'xr glasses',
    'gafas inteligentes', 'gafas de sol inteligentes', 'gafas de realidad',
    'ray-ban', 'rayban', 'rayneo', 'xreal', 'vuzix', 'rokid', 'even realities',
    'spectacles', 'vision pro', 'meta quest', 'augmented reality', 'realidad aumentada',
    // Marcas de relojes deportivos (aparecen en titulares de prensa general).
    // 'polar' a secas queda FUERA a propósito: en prensa de ciencia en español
    // "polar" es vocabulario corriente (vórtice polar, amplificación polar,
    // osos polares) y metía artículos de clima en Wearables. Se listan sus
    // familias de producto, que es lo que aparece en un titular de review.
    'garmin', 'amazfit', 'suunto',
    'polar vantage', 'polar grit', 'polar pacer', 'polar ignite', 'polar verity',
    // Chino: 智能手表 (reloj), 智能手环/手环 (pulsera), 智能眼镜 (gafas), 穿戴 (ponible).
    '智能手表', '智能手环', '手环', '智能眼镜', '穿戴',
    // Gafas con IA/de cámara y marcas que aún no estaban.
    'ai glasses', 'camera glasses', 'ai pendant', 'smartband', 'eyewear',
    'coros', 'viture',
    // Paráfrasis en español para gafas de cámara/IA.
    'gafas ar', 'gafas con camara', 'gafas con cámara', 'gafas con ia',
  ],
  'tarjetas-graficas': [
    'gpu', 'graphics card', 'tarjeta gráfica', 'tarjeta grafica', 'tarjetas gráficas',
    'tarjetas graficas', 'geforce', 'rtx', 'radeon',
    'arc gpu', 'dlss', 'ray tracing', 'raytracing', 'video card', 'dx12', 'vulkan', 'fsr',
    // Chino: 显卡 (tarjeta gráfica), 显存 (VRAM). El plural español es irregular
    // (tarjetas gráficas), por eso se listan las dos formas.
    '显卡', '显存', 'intel arc', 'game ready', 'rx 7900',
  ],
  memorias: [
    'ram', 'dram', 'ddr4', 'ddr5', 'ddr6', 'memory module', 'módulo de memoria', 'ssd', 'nvme',
    'nand', 'storage', 'almacenamiento', 'hbm', 'hbm2', 'hbm3', 'hbm4', 'memory chip',
    'sram', 'feram', 'lpcamm', 'lpddr5', 'lpddr6', 'gddr7',
    // Chino: 内存 (RAM), 闪存 (flash), 固态硬盘 (SSD), 长江存储 (YMTC), 长鑫 (CXMT).
    '内存', '闪存', '固态硬盘', '长江存储', '长鑫', '存储芯片',
    // Marcas que aparecen a secas en los titulares.
    'cxmt', 'hynix', 'kioxia', 'micron',
  ],
  portatiles: [
    'laptop', 'notebook', 'portátil', 'portatil', 'ultrabook', 'chromebook', '2-in-1',
    'convertible', 'macbook', 'thinkpad', 'zenbook', 'ideapad', 'zephyrus', 'legion laptop',
    // Googlebooks (familia de portátiles de Google) y marcas de gama baja.
    'googlebook', 'vaio', 'xmg', 'lenovo yoga',
    // Chino: 笔记本/笔记本电脑 (portátil), 轻薄本/游戏本 (ultraligero/gaming).
    '笔记本', '笔记本电脑', '轻薄本', '游戏本',
  ],
  // Emuladores va antes que consolas a propósito: una noticia sobre un emulador
  // casi siempre nombra la consola anfitriona (Xbox, Switch, PS5), así que debe
  // ganarle a `consolas` para no quedar diluida dentro de ella.
  //
  // Es agnóstico del sistema anfitrión: emulación de consola en Windows, macOS,
  // Linux y Android. La plataforma anfitriona va como tag secundario, no cambia
  // la vertical.
  //
  // Se incluyen el sustantivo y el acto EN ESPAÑOL (`emular`, `emulación`): la
  // prensa en español titula con el verbo ("Xbox Series X consigue emular juegos
  // de PS5") y sin esto la noticia cae en `consolas`.
  //
  // Se deja FUERA el genérico inglés (`emulation`, `emulate`, `emulated`): en el
  // corpus de este portal el único titular con "emulation" era un teclado que
  // imitaba un mando ("Controller Emulation"), no un emulador de consolas, y las
  // noticias en inglés usan el sustantivo ("Emulator"), que ya está cubierto.
  emuladores: [
    'emulator', 'emulators', 'emulador', 'emuladores', 'emular', 'emula', 'emulando',
    'emulación', 'emulacion',
    // Proyectos de escritorio
    'ryujinx', 'yuzu', 'suyu', 'sudachi', 'rpcs3', 'pcsx2', 'ppsspp', 'duckstation',
    'dolphin', 'cemu', 'citra', 'lime3ds', 'azahar', 'melonds', 'desmume', 'mgba',
    'snes9x', 'epsxe', 'flycast', 'redream', 'xenia', 'xemu', 'vita3k', 'shadps4',
    'kyty', 'retroarch', 'emudeck', 'emulationstation', 'batocera', 'lakka', 'romm',
    'mame', 'mame4droid', 'dosbox', 'scummvm',
    // Chino: 模拟器 (emulador).
    '模拟器',
    // Proyectos y frontends que aún no estaban.
    'winuae', 'winvice', 'padforge', 'nextendo', 'visualboyadvance', 'ymir',
    'pureikyubu', 'pcsx', 'sharpemu', 'recompilation',
    // Consolas portátiles de emulación.
    'retroid', 'ayaneo', 'anbernic', 'powkiddy',
    // Recreativas FPGA que emulan consolas (ver «FPGA GAME BOY»).
    'fpga',
    // Host Android
    'winlator', 'mobox', 'gamenative', 'aethersx2', 'nethersx2',
  ],
  consolas: [
    'console', 'consola', 'handheld', 'playstation', 'ps5', 'ps6', 'xbox', 'nintendo', 'switch',
    'steam deck', 'steamdeck', 'rog ally', 'legion go', 'game console', 'ps4',
    // Retro y consolas portátiles.
    'neogeo', 'neo geo', 'game boy', 'gameboy', 'hyperkin', 'supaboy', 'modretro',
    'n64', 'ps2', 'ps3', 'gamecube', 'dreamcast', 'sega saturn', 'mega drive', 'wii u', 'wiiu',
    'gta',
    // Mandos de consola que aparecen a secas.
    'dualsense', 'joy-con', 'joycon',
    // Chino: 手柄 (mando), 掌机 (consola portátil), 游戏机 (videoconsola).
    '手柄', '掌机', '游戏机',
  ],
  componentes: [
    'cpu', 'processor', 'procesador', 'motherboard', 'placa base', 'mainboard', 'psu',
    'fuente de alimentación', 'power supply', 'cooling', 'refrigeración', 'refrigeracion',
    'cooler', 'disipador', 'heatsink', 'aio', 'case', 'caja', 'chasis', 'chassis',
    'power connector', 'chipset', 'x870', 'b850', 'z890', 'b760', 'am4', 'am5', 'lga',
    'ryzen', 'core ultra', 'apu', 'mlcc',
    // Mac mini / Mac Studio son sobremesas: entran en componentes. Un MacBook ya
    // gana antes por `macbook` en portátiles, así que `mac` no lo adelanta.
    'mac', 'mini pc', 'gaming desktop', 'ventilador', 'corsair', 'noctua', 'nzxt',
    'celeron', 'raptor lake',
    // Chino: 主板 (placa base), 电源 (fuente), 液冷 (refrigeración líquida),
    // 机箱 (caja), 超节点 (supernodo IA), 封装载板 (sustrato), 处理器 (CPU).
    '主板', '电源', '液冷', '机箱', '超节点', '封装载板', '处理器',
  ],
  moviles: [
    'phone', 'smartphone', 'móvil', 'movil', 'teléfono', 'telefono', 'iphone', 'android',
    'pixel', 'galaxy', 'xiaomi', 'redmi', 'poco', 'oneplus', 'oppo', 'realme', 'honor',
    'huawei', 'motorola', 'nokia', 'snapdragon', 'mediatek', 'dimensity', 'exynos',
    'foldable', 'plegable',
    // Marcas que aparecen sin el apellido de producto.
    'redmagic', 'red magic', 'iqoo', 'doogee', 'originos', 'vivo x', 'vivo v',
    // Chino: 骁龙 (Snapdragon), 天玑 (Dimensity), 一加 (OnePlus), 摩托罗拉,
    // 高通 (Qualcomm), 联发科 (MediaTek), 红米 (Redmi),
    // 手机芯片/旗舰手机/安卓手机/电竞手机 (móvil de gama alta/juegos).
    '骁龙', '天玑', '一加', '摩托罗拉', '高通', '联发科', '红米',
    '手机芯片', '旗舰手机', '安卓手机', '电竞手机',
    // «小米» a secas queda FUERA: en las fuentes chinas aparece en titulares de
    // electrodomésticos y coches (ninguna). Los modelos de móvil concretos sí.
    '小米18', '小米 18', '小米17', '小米 17',
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
  'correo', 'email', 'spotify', 'clipchamp', 'carplay', 'roku',
];

const VERTICAL_LABELS = {
  tutoriales: '📘 Tutoriales',
  'tarjetas-graficas': '🎮 Tarjetas gráficas',
  memorias: '💾 Memorias',
  portatiles: '💻 Portátiles',
  emuladores: '👾 Emuladores',
  consolas: '🕹️ Consolas',
  componentes: '🔧 Componentes',
  moviles: '📱 Móviles',
  wearables: '⌚ Wearables',
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
  const matchesAny = (keywords) => keywords.some((k) => keywordMatches(t, k));

  const hits = [];
  for (const [v, kws] of Object.entries(VERTICALS)) {
    const matched =
      v === 'tutoriales' ? matchesAny(kws) || TUTORIAL_HOWTO_RX.test(t) : matchesAny(kws);
    if (!matched) continue;
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

// Los términos en chino no tienen fronteras de palabra como el latín: 骁龙 debe
// coincidir dentro de «骁龙8», así que se buscan como subcadena literal (dentro
// de una palabra china más larga el término sigue siendo la señal correcta). El
// resto usa la frontera de WORD_CHARS y además admite el plural (-s / -es),
// salvo las bases de NO_PLURAL, donde el plural es una palabra común distinta
// ("pixels", "pocos", "cases") y abriría falsos positivos.
const CJK_RX = /[\u3400-\u9fff\uf900-\ufaff]/;
const NO_PLURAL = new Set(['pixel', 'poco', 'case', 'notebook']);
function keywordMatches(t, k) {
  if (CJK_RX.test(k)) return t.includes(k.toLowerCase());
  const plural = NO_PLURAL.has(k) ? '' : '(?:s|es)?';
  // Tras la clave también vale un dígito: los modelos se pegan al nombre
  // ("Vivo X500", "Vivo V80"), y sin esto `vivo x` nunca casaría.
  return new RegExp(
    `(^|[^${WORD_CHARS}])${escapeRegex(k)}${plural}(?=$|[^${WORD_CHARS}]|\\d)`,
    'i',
  ).test(t);
}

// «cómo» solo marca tutorial cuando encabeza una construcción «cómo + verbo».
// Un «cómo» interrogativo suelto («cómo y cuándo») no es una marca de tutorial.
const TUTORIAL_VERBS = [
  'actualizar', 'activar', 'agregar', 'añadir', 'abrir', 'acelerar', 'aprovechar',
  'arreglar', 'bloquear', 'borrar', 'buscar', 'cambiar', 'cerrar', 'comparar',
  'compartir', 'comprobar', 'conectar', 'configurar', 'conseguir', 'convertir',
  'crear', 'desactivar', 'descargar', 'desbloquear', 'devolver', 'elegir',
  'eliminar', 'emparejar', 'encontrar', 'escanear', 'escoger', 'evitar',
  'exportar', 'fijar', 'forzar', 'grabar', 'guardar', 'hacer', 'identificar',
  'importar', 'instalar', 'jugar', 'limpiar', 'maximizar', 'medir', 'mejorar',
  'montar', 'ocultar', 'optimizar', 'personalizar', 'pescar', 'potenciar',
  'programar', 'proteger', 'recuperar', 'reducir', 'reparar', 'restablecer',
  'restaurar', 'revertir', 'saber', 'seleccionar', 'sincronizar', 'solucionar',
  'transferir', 'unir', 'unirte', 'usar', 'utilizar', 'ver', 'verificar',
  'vincular',
];
// El pronombre enclítico no debe romper la marca: «cómo conectarlo/usarla».
const TUTORIAL_HOWTO_RX = new RegExp(
  `(^|[^${WORD_CHARS}])cómo\\s+(?:${TUTORIAL_VERBS.join('|')})(?:lo|la|los|las|le|les|me|te|se|nos)?(?=$|[^${WORD_CHARS}])`,
  'i',
);

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
        'User-Agent': 'techspain24-newsbot/1.0 (+editorial)',
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
