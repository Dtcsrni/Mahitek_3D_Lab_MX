#!/usr/bin/env node
/**
 * Regenera la sección autogenerada de `ANALISIS_SISTEMA.md`.
 * - Produce inventario y fingerprint (sha256) del "sistema" (archivos significativos).
 * - No requiere build; funciona en Node >= 18.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "ANALISIS_SISTEMA.md");

const AUTO_START = "<!-- AUTO-GENERATED:START -->";
const AUTO_END = "<!-- AUTO-GENERATED:END -->";

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "public",
  ".dev",
  ".vscode",
  ".tasks",
]);

const FINGERPRINT_GLOBS = [
  "index.html",
  "manifest.json",
  "robots.txt",
  "sitemap.xml",
  "package.json",
  "package-lock.json",
  "assets/css",
  "assets/js",
  "assets/data",
  "data",
  ".github/workflows",
  "scripts",
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
  filtered.sort((a, b) =>
    toPosix(path.relative(repoRoot, a)).localeCompare(
      toPosix(path.relative(repoRoot, b)),
    ),
  );
  return filtered;
}

function sha256Fingerprint(filePaths) {
  const hash = crypto.createHash("sha256");
  for (const abs of filePaths) {
    const rel = toPosix(path.relative(repoRoot, abs));
    hash.update(rel);
    hash.update("\0");
    hash.update(fs.readFileSync(abs));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function countByExtension(files) {
  const counts = new Map();
  for (const abs of files) {
    const rel = path.relative(repoRoot, abs);
    if (!rel) continue;
    const ext = path.extname(abs).toLowerCase() || "(sin-ext)";
    counts.set(ext, (counts.get(ext) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function renderAutoSection({ fingerprint, fingerprintFiles, allFiles }) {
  const nowIso = new Date().toISOString();
  const byExt = countByExtension(allFiles);

  const htmlFiles = allFiles
    .map((p) => toPosix(path.relative(repoRoot, p)))
    .filter((p) => p.toLowerCase().endsWith(".html"))
    .filter((p) => !p.startsWith("node_modules/") && !p.startsWith("public/"))
    .sort();

  const workflows = allFiles
    .map((p) => toPosix(path.relative(repoRoot, p)))
    .filter((p) => p.startsWith(".github/workflows/"))
    .sort();

  const pkg = readJsonSafe(path.join(repoRoot, "package.json"));
  const npmScripts = pkg?.scripts ? Object.keys(pkg.scripts).sort() : [];

  const lines = [];
  lines.push(`Generado: ${nowIso}`);
  lines.push(`Fingerprint: sha256:${fingerprint}`);
  lines.push(`Archivos hasheados: ${fingerprintFiles.length}`);
  lines.push("");
  lines.push("Criterio del fingerprint (cambios “significativos”):");
  lines.push("- Root: `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`, `package.json`, `package-lock.json`");
  lines.push("- `assets/js/**/*.js`, `assets/css/**/*.css`");
  lines.push("- `assets/data/**/*.json`, `data/**/*.json`");
  lines.push("- `.github/workflows/**/*.{yml,yaml}`");
  lines.push("- `scripts/**/*.{js,ps1,sh,bat}`");
  lines.push("");
  lines.push("Inventario (excluye .git/node_modules/public):");
  lines.push("");
  lines.push("| Ext | Conteo |");
  lines.push("| --- | -----: |");
  for (const [ext, count] of byExt) {
    lines.push(`| \`${ext}\` | ${count} |`);
  }
  lines.push("");
  lines.push(`HTML detectados (${htmlFiles.length}):`);
  for (const f of htmlFiles) lines.push(`- ${f}`);
  lines.push("");
  lines.push(`Workflows (${workflows.length}):`);
  for (const wf of workflows) lines.push(`- ${wf}`);
  lines.push("");
  lines.push(`Scripts npm (${npmScripts.length}):`);
  for (const s of npmScripts) lines.push(`- \`${s}\``);

  return lines.join("\n");
}

function upsertAutoBlock(markdown, newBlock) {
  if (markdown.includes(AUTO_START) && markdown.includes(AUTO_END)) {
    const start = markdown.indexOf(AUTO_START);
    const end = markdown.indexOf(AUTO_END);
    if (end < start) throw new Error("Markers inválidos en ANALISIS_SISTEMA.md");
    const before = markdown.slice(0, start + AUTO_START.length);
    const after = markdown.slice(end);
    return `${before}\n\n${newBlock}\n\n${after}`;
  }

  const suffix = `\n\n${AUTO_START}\n\n${newBlock}\n\n${AUTO_END}\n`;
  return markdown.trimEnd() + suffix;
}

function extractStoredFingerprint(markdown) {
  if (!markdown.includes(AUTO_START) || !markdown.includes(AUTO_END)) return null;
  const match = markdown.match(/Fingerprint:\s*sha256:([a-f0-9]{64})/i);
  return match?.[1] || null;
}

function main() {
  const allFiles = walkFiles(repoRoot).filter((p) => {
    const rel = toPosix(path.relative(repoRoot, p));
    const top = rel.split("/")[0];
    if (IGNORE_DIRS.has(top)) return false;
    return fs.statSync(p).isFile();
  });

  const fingerprintFiles = listFilesFromTargets(FINGERPRINT_GLOBS).filter(
    (abs) => {
      const rel = toPosix(path.relative(repoRoot, abs));
      if (rel.startsWith("public/")) return false;
      if (rel.startsWith("node_modules/")) return false;
      return isSignificantFile(rel);
    },
  );

  const fingerprint = sha256Fingerprint(fingerprintFiles);

  const existing = fs.existsSync(outputPath)
    ? fs.readFileSync(outputPath, "utf8")
    : "# Análisis del Sistema\n";

  const stored = extractStoredFingerprint(existing);
  const hasAutoBlock = existing.includes(AUTO_START) && existing.includes(AUTO_END);
  if (stored && stored === fingerprint && hasAutoBlock) {
    console.log(`✓ ANALISIS_SISTEMA.md ya está actualizado (fingerprint ${fingerprint.slice(0, 12)}…)`);
    return;
  }

  const autoSection = renderAutoSection({
    fingerprint,
    fingerprintFiles,
    allFiles,
  });

  const updated = upsertAutoBlock(existing, autoSection);
  fs.writeFileSync(outputPath, updated, "utf8");
  console.log(`✓ ANALISIS_SISTEMA.md actualizado (fingerprint ${fingerprint.slice(0, 12)}…)`);
}

main();
