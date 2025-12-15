/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const PROJECT_ROOT = path.resolve(__dirname, "..");

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".dev",
  ".vscode",
  ".tasks",
  "dist",
  "build",
  "public",
]);

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

function main() {
  const errors = [];

  const htmlFiles = walkFiles(PROJECT_ROOT, (file) => file.endsWith(".html"));
  for (const htmlFile of htmlFiles) validateHtmlFile(htmlFile, errors);
  validateCssUrls(errors);

  if (errors.length) {
    console.error("✗ Links/recursos rotos detectados:");
    for (const err of errors) console.error(`- ${err}`);
    process.exit(1);
  }

  console.log(`✓ Links/recursos OK (${htmlFiles.length} HTML, CSS url() verificado)`);
}

main();
