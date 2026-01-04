#!/usr/bin/env node
/**
 * Genera la carpeta `public/` para deploy a GitHub Pages.
 * Objetivo: publicar solo el sitio (no scripts/tests/docs).
 *
 * Uso:
 *   node scripts/build-public.js
 */

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "public");

const COPY_TARGETS = [
  "index.html",
  "aviso-privacidad.html",
  "assets",
  "data",
  "manifest.json",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  "qr",
  "admin",
];

function rmDirSafe(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function copyRecursive(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (srcPath) => {
      const base = path.basename(srcPath).toLowerCase();
      if (base === "desktop.ini") return false;
      if (base === "thumbs.db") return false;
      if (base === ".ds_store") return false;
      return true;
    },
  });
}

function main() {
  rmDirSafe(outDir);
  fs.mkdirSync(outDir, { recursive: true });

  const copied = [];
  for (const rel of COPY_TARGETS) {
    const src = path.join(repoRoot, rel);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(outDir, rel);
    copyRecursive(src, dest);
    copied.push(rel);
  }

  // Evita comportamiento Jekyll si en el futuro se agregan rutas con underscore.
  fs.writeFileSync(path.join(outDir, ".nojekyll"), "", "utf8");

  console.log(`✓ public/ generado (${copied.length} targets): ${copied.join(", ")}`);
}

main();
