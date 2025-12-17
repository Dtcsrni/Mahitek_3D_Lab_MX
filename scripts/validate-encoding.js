#!/usr/bin/env node
/**
 * Validación rápida de encoding para evitar "mojibake" visible en UI.
 * Objetivo (AI-001): asegurar que strings en runtime estén en UTF-8 correcto.
 *
 * Verifica un conjunto pequeño de archivos críticos (sin build obligatorio).
 *
 * Exit codes:
 * 0 OK, 1 errores
 */
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

const FILES = [
  "index.html",
  "assets/js/app.js",
  "assets/js/boot.js",
  "data/faq.json",
  "package.json",
].map((p) => path.join(repoRoot, p));

const SUSPECT_CHARS = [
  "\uFFFD", // replacement char
  "\u00A8", // ¨
  "\u00A2", // ¢
  "\u00A3", // £
  "\u00A4", // ¤
  "\u201A", // ‚
  "\u00C2", // Â
  "\u00C3", // Ã
  "\u00BD", // ½
  "\u00CF", // Ï
  "\u00F9", // ù
  "\u0153", // œ
];

const SUSPECT_STRINGS = [
  "V¨lido",
  "Categor¨a",
  "preparaci¨n",
  "Producci¢n",
  "Gesti¢n",
  "Detecci¢n",
  "espa¤ol",
  "ingl‚s",
  "pr¢ximamente",
  "Vùlido",
  "Categorùa",
  "preparaciùn",
  "Producci½n",
  "Gesti½n",
  "Detecci½n",
  "V\u00A0lido",
  "Categor\u00A1a",
  "preparaci\u00A2n",
];

function posToLineCol(text, pos) {
  const before = text.slice(0, pos);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

function formatSnippet(text, pos) {
  const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
  const lineEndIdx = text.indexOf("\n", pos);
  const lineEnd = lineEndIdx === -1 ? text.length : lineEndIdx;
  const line = text.slice(lineStart, lineEnd);
  return line.length > 240 ? `${line.slice(0, 240)}…` : line;
}

let errors = 0;

for (const filePath of FILES) {
  const rel = path.relative(repoRoot, filePath);
  if (!fs.existsSync(filePath)) continue;

  const text = fs.readFileSync(filePath, "utf8");

  for (const needle of SUSPECT_STRINGS) {
    let idx = 0;
    while (true) {
      const pos = text.indexOf(needle, idx);
      if (pos === -1) break;
      const { line, col } = posToLineCol(text, pos);
      console.error(
        `✗ Encoding sospechoso: ${rel}:${line}:${col} contiene ${JSON.stringify(needle)}`,
      );
      console.error(`  ${formatSnippet(text, pos)}`);
      errors++;
      idx = pos + Math.max(1, needle.length);
    }
  }

  for (const ch of SUSPECT_CHARS) {
    let idx = 0;
    while (true) {
      const pos = text.indexOf(ch, idx);
      if (pos === -1) break;
      const { line, col } = posToLineCol(text, pos);
      const code = `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
      console.error(`✗ Encoding sospechoso: ${rel}:${line}:${col} contiene ${code}`);
      console.error(`  ${formatSnippet(text, pos)}`);
      errors++;
      idx = pos + 1;
    }
  }
}

if (errors > 0) {
  console.error(`\n✗ Validación de encoding falló (${errors} hallazgos)`);
  process.exit(1);
}

console.log("✓ Encoding OK (archivos críticos sin mojibake)");
