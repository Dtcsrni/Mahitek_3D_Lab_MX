#!/usr/bin/env node
/**
 * Verifica que `ANALISIS_SISTEMA.md` este actualizado para cambios significativos.
 * Falla si el fingerprint guardado no coincide con el actual.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const repoRoot = path.resolve(__dirname, "..");
const analysisPath = path.join(repoRoot, "ANALISIS_SISTEMA.md");

const AUTO_START = "<!-- AUTO-GENERATED:START -->";
const AUTO_END = "<!-- AUTO-GENERATED:END -->";

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "public",
  ".dev",
  ".vscode",
  ".tasks",
  ".wrangler",
  "logs",
]);

const FINGERPRINT_GLOBS = [
  "index.html",
  "manifest.json",
  "robots.txt",
  "sitemap.xml",
  "package.json",
  "package-lock.json",
  "admin",
  "assets/css",
  "assets/js",
  "assets/data",
  "data",
  ".github/workflows",
  "scripts",
  "workers",
];

function isSignificantFile(relPosix) {
  if (
    relPosix === "index.html" ||
    relPosix === "manifest.json" ||
    relPosix === "robots.txt" ||
    relPosix === "sitemap.xml" ||
    relPosix === "package.json" ||
    relPosix === "package-lock.json"
  ) {
    return true;
  }

  if (relPosix.startsWith("assets/js/")) return relPosix.endsWith(".js");
  if (relPosix.startsWith("assets/css/")) return relPosix.endsWith(".css");
  if (relPosix.startsWith("assets/data/")) return relPosix.endsWith(".json");
  if (relPosix.startsWith("data/")) return relPosix.endsWith(".json");

  if (relPosix.startsWith(".github/workflows/")) {
    return relPosix.endsWith(".yml") || relPosix.endsWith(".yaml");
  }

  if (relPosix.startsWith("scripts/")) {
    return (
      relPosix.endsWith(".js") ||
      relPosix.endsWith(".ps1") ||
      relPosix.endsWith(".sh") ||
      relPosix.endsWith(".bat")
    );
  }

  if (relPosix.startsWith("admin/")) {
    if (relPosix === "admin/_headers") return true;
    return relPosix.endsWith(".html") || relPosix.endsWith(".css") || relPosix.endsWith(".js");
  }

  if (relPosix.startsWith("workers/")) {
    return (
      relPosix.endsWith(".js") ||
      relPosix.endsWith(".toml") ||
      relPosix.endsWith(".md") ||
      relPosix.endsWith(".sql")
    );
  }

  return false;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function walkFiles(rootDir) {
  const results = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      results.push(...walkFiles(path.join(rootDir, entry.name)));
      continue;
    }
    results.push(path.join(rootDir, entry.name));
  }
  return results;
}

function listFilesFromTargets(targets) {
  const files = [];
  for (const rel of targets) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      files.push(...walkFiles(abs));
    } else {
      files.push(abs);
    }
  }
  const filtered = files.filter((p) => fs.statSync(p).isFile());
  filtered.sort((a, b) => {
    const ra = toPosix(path.relative(repoRoot, a));
    const rb = toPosix(path.relative(repoRoot, b));
    if (ra < rb) return -1;
    if (ra > rb) return 1;
    return 0;
  });
  return filtered;
}

function readCanonicalForHash(abs) {
  const raw = fs.readFileSync(abs, "utf8");
  // Normalizar line endings para que el fingerprint sea estable entre Windows (CRLF) y CI (LF).
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function sha256Fingerprint(filePaths) {
  const hash = crypto.createHash("sha256");
  for (const abs of filePaths) {
    const rel = toPosix(path.relative(repoRoot, abs));
    hash.update(rel);
    hash.update("\0");
    hash.update(readCanonicalForHash(abs));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function extractStoredFingerprint(markdown) {
  if (!markdown.includes(AUTO_START) || !markdown.includes(AUTO_END)) return null;
  const match = markdown.match(/Fingerprint:\s*sha256:([a-f0-9]{64})/i);
  return match?.[1] || null;
}

function main() {
  if (!fs.existsSync(analysisPath)) {
    console.error("X Falta `ANALISIS_SISTEMA.md`");
    console.error("  Ejecuta: npm run docs:update");
    process.exit(1);
  }

  const md = fs.readFileSync(analysisPath, "utf8");
  const stored = extractStoredFingerprint(md);
  if (!stored) {
    console.error("X `ANALISIS_SISTEMA.md` no tiene fingerprint autogenerado");
    console.error("  Ejecuta: npm run docs:update");
    process.exit(1);
  }

  const fingerprintFiles = listFilesFromTargets(FINGERPRINT_GLOBS).filter((abs) => {
    const rel = toPosix(path.relative(repoRoot, abs));
    if (rel.startsWith("public/")) return false;
    if (rel.startsWith("node_modules/")) return false;
    return isSignificantFile(rel);
  });
  const current = sha256Fingerprint(fingerprintFiles);

  if (current !== stored) {
    console.error("X `ANALISIS_SISTEMA.md` esta desactualizado para cambios significativos");
    console.error(`  Guardado:  ${stored}`);
    console.error(`  Actual:    ${current}`);
    console.error("");
    console.error("  Ejecuta: npm run docs:update");
    process.exit(1);
  }

  console.log("V ANALISIS_SISTEMA.md actualizado (fingerprint OK)");
}

main();
