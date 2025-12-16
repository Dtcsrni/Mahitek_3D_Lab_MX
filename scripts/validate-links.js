/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const rootArg = getArg("--root");
const PROJECT_ROOT = path.resolve(__dirname, "..", rootArg || "");

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".dev",
  ".vscode",
  ".tasks",
  "dist",
  "build",
]);

const DIR_INDEX_CACHE = new Map();

function getDirIndex(dir) {
  const key = path.resolve(dir);
  const cached = DIR_INDEX_CACHE.get(key);
  if (cached) return cached;

  let entries = [];
  try {
    entries = fs.readdirSync(key, { withFileTypes: true });
  } catch (_) {
    const empty = { names: new Set(), lowerToActual: new Map() };
    DIR_INDEX_CACHE.set(key, empty);
    return empty;
  }

  const names = new Set();
  const lowerToActual = new Map();
  for (const entry of entries) {
    names.add(entry.name);
    const lower = entry.name.toLowerCase();
    if (!lowerToActual.has(lower)) lowerToActual.set(lower, entry.name);
  }

  const idx = { names, lowerToActual };
  DIR_INDEX_CACHE.set(key, idx);
  return idx;
}

function getPathWithActualCase(targetPath) {
  const abs = path.resolve(targetPath);
  const parsed = path.parse(abs);
  let current = parsed.root;
  const segments = abs.slice(parsed.root.length).split(path.sep).filter(Boolean);

  const actualParts = [];
  const mismatches = [];

  for (const seg of segments) {
    const { names, lowerToActual } = getDirIndex(current);
    if (names.has(seg)) {
      actualParts.push(seg);
      current = path.join(current, seg);
      continue;
    }

    const actual = lowerToActual.get(seg.toLowerCase());
    if (!actual) return { ok: false, actualPath: abs, mismatches };

    mismatches.push({ expected: seg, actual });
    actualParts.push(actual);
    current = path.join(current, actual);
  }

  const actualPath = path.join(parsed.root, ...actualParts);
  return { ok: mismatches.length === 0, actualPath, mismatches };
}

function walkFiles(rootDir, predicate) {
  const results = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      results.push(...walkFiles(path.join(rootDir, entry.name), predicate));
      continue;
    }
    const fullPath = path.join(rootDir, entry.name);
    if (predicate(fullPath)) results.push(fullPath);
  }
  return results;
}

function isExternalUrl(value) {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("sms:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("javascript:")
  );
}

function stripQueryAndHash(value) {
  const trimmed = value.trim();
  const withoutHash = trimmed.split("#")[0];
  return withoutHash.split("?")[0];
}

function resolveLocalPath(fromFile, target) {
  const raw = stripQueryAndHash(target);
  if (!raw) return null;

  if (raw.startsWith("/")) {
    return path.join(PROJECT_ROOT, raw.replace(/^\//, ""));
  }

  return path.resolve(path.dirname(fromFile), raw);
}

function checkFileExists(fromFile, attr, value, errors) {
  if (!value) return;
  if (isExternalUrl(value)) return;
  if (value.trim().startsWith("#")) return;

  const resolved = resolveLocalPath(fromFile, value);
  if (!resolved) return;

  if (!fs.existsSync(resolved)) {
    errors.push(`${path.relative(PROJECT_ROOT, fromFile)}: ${attr} -> "${value}" (no existe: ${path.relative(PROJECT_ROOT, resolved)})`);
    return;
  }

  // En Windows `existsSync` es case-insensitive; en deploys Linux (GitHub Pages) no.
  const { ok, actualPath } = getPathWithActualCase(resolved);
  if (!ok) {
    errors.push(
      `${path.relative(PROJECT_ROOT, fromFile)}: ${attr} -> "${value}" (case mismatch: ${path.relative(PROJECT_ROOT, resolved)} vs ${path.relative(PROJECT_ROOT, actualPath)})`,
    );
  }
}

function checkAnchorId(fromFile, href, ids, errors) {
  if (!href) return;
  const trimmed = href.trim();
  if (!trimmed.startsWith("#")) return;
  if (trimmed === "#") return;

  const targetId = trimmed.slice(1);
  if (!ids.has(targetId)) {
    errors.push(`${path.relative(PROJECT_ROOT, fromFile)}: href -> "${href}" (id no encontrado: #${targetId})`);
  }
}

function parseSrcset(value) {
  return value
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function validateHtmlFile(filePath, errors) {
  const html = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const ids = new Set(
    Array.from(document.querySelectorAll("[id]"))
      .map((node) => node.getAttribute("id"))
      .filter(Boolean),
  );

  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    checkAnchorId(filePath, href, ids, errors);
    checkFileExists(filePath, "href", href, errors);
  }

  for (const node of document.querySelectorAll("img[src], script[src], iframe[src], source[src], video[src], audio[src]")) {
    const src = node.getAttribute("src");
    checkFileExists(filePath, "src", src, errors);
  }

  for (const node of document.querySelectorAll("video[poster]")) {
    const poster = node.getAttribute("poster");
    checkFileExists(filePath, "poster", poster, errors);
  }

  for (const node of document.querySelectorAll("link[href]")) {
    const href = node.getAttribute("href");
    checkFileExists(filePath, "href", href, errors);
  }

  for (const node of document.querySelectorAll("[srcset]")) {
    const srcset = node.getAttribute("srcset");
    for (const url of parseSrcset(srcset)) {
      checkFileExists(filePath, "srcset", url, errors);
    }
  }
}

function validateCssUrls(errors) {
  const cssFiles = walkFiles(PROJECT_ROOT, (file) => file.endsWith(".css"));
  const urlRegex = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

  for (const cssFile of cssFiles) {
    const content = fs.readFileSync(cssFile, "utf8");
    let match;
    while ((match = urlRegex.exec(content))) {
      const raw = (match[2] || "").trim();
      if (!raw || isExternalUrl(raw)) continue;
      if (raw.startsWith("#")) continue;

      const resolved = resolveLocalPath(cssFile, raw);
      if (!resolved) continue;
      if (!fs.existsSync(resolved)) {
        errors.push(`${path.relative(PROJECT_ROOT, cssFile)}: url() -> "${raw}" (no existe: ${path.relative(PROJECT_ROOT, resolved)})`);
      }
    }
  }
}

function looksLikeLocalResourcePath(value) {
  const raw = stripQueryAndHash(value);
  if (!raw) return false;
  if (isExternalUrl(raw)) return false;
  if (raw.trim().startsWith("#")) return false;

  // Solo paths que claramente apuntan a archivos estáticos.
  return /^(?:\/|\.{1,2}\/|assets\/|data\/|qr\/).+\.(?:svg|png|jpe?g|webp|gif|ico|json|mp4|webm|mp3|wav|ogg)$/i.test(raw.trim());
}

function resolveJsonResourcePath(fromJsonFile, target) {
  const raw = stripQueryAndHash(target);
  if (!raw) return null;

  // En JSON tratamos `assets/...` como relativo a la raíz del proyecto/sitio.
  if (raw.startsWith("/")) return path.join(PROJECT_ROOT, raw.replace(/^\//, ""));
  if (raw.startsWith("./") || raw.startsWith("../")) return path.resolve(path.dirname(fromJsonFile), raw);
  return path.join(PROJECT_ROOT, raw);
}

function walkJsonValues(value, visitor, keyPath = "") {
  if (typeof value === "string") {
    visitor(value, keyPath);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => walkJsonValues(item, visitor, `${keyPath}[${idx}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      const nextPath = keyPath ? `${keyPath}.${key}` : key;
      walkJsonValues(child, visitor, nextPath);
    }
  }
}

function validateJsonResources(errors) {
  const dataDir = path.join(PROJECT_ROOT, "data");
  if (!fs.existsSync(dataDir)) return;

  const jsonFiles = walkFiles(dataDir, (file) => file.endsWith(".json"));
  for (const jsonFile of jsonFiles) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    } catch (err) {
      errors.push(`${path.relative(PROJECT_ROOT, jsonFile)}: JSON inválido (${err.message || String(err)})`);
      continue;
    }

    walkJsonValues(parsed, (rawValue, keyPath) => {
      if (!looksLikeLocalResourcePath(rawValue)) return;

      const resolved = resolveJsonResourcePath(jsonFile, rawValue);
      if (!resolved) return;
      if (!fs.existsSync(resolved)) {
        errors.push(
          `${path.relative(PROJECT_ROOT, jsonFile)}: ${keyPath} -> "${rawValue}" (no existe: ${path.relative(PROJECT_ROOT, resolved)})`,
        );
      }
    });
  }
}

function main() {
  const errors = [];

  const htmlFiles = walkFiles(PROJECT_ROOT, (file) => file.endsWith(".html"));
  for (const htmlFile of htmlFiles) validateHtmlFile(htmlFile, errors);
  validateCssUrls(errors);
  validateJsonResources(errors);

  if (errors.length) {
    console.error("✗ Links/recursos rotos detectados:");
    for (const err of errors) console.error(`- ${err}`);
    process.exit(1);
  }

  const rootLabel = rootArg ? `root=${rootArg}` : "root=repo";
  console.log(`✓ Links/recursos OK (${htmlFiles.length} HTML, CSS url() verificado, JSON recursos verificados, ${rootLabel})`);
}

main();
