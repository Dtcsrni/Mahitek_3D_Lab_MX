#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const repoRoot = path.resolve(__dirname, "..");
const rootArg = getArg("--root") || "public";
const shouldBuild = process.argv.includes("--build");
const rootDir = path.resolve(repoRoot, rootArg);

const errors = [];

function fail(msg) {
  errors.push(msg);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function ensureExists(relPath, label, severity) {
  const abs = path.join(rootDir, relPath);
  if (!fs.existsSync(abs)) {
    fail(`[${severity}] missing ${label || relPath}`);
    return null;
  }
  return abs;
}

function ensureMinSize(absPath, relPath, minBytes, severity) {
  const size = fs.statSync(absPath).size;
  if (size < minBytes) {
    fail(`[${severity}] ${relPath} is too small (${size} bytes)`);
  }
}

function validateHtmlBasics(absPath, relPath, severity, opts = {}) {
  const html = readText(absPath);
  const hasDoctype = /^\s*<!doctype\s+html>/i.test(html);
  if (!hasDoctype) fail(`[${severity}] ${relPath} missing DOCTYPE html`);

  const hasCharset = /<meta\s+charset\s*=\s*"?utf-8"?/i.test(html);
  if (!hasCharset) fail(`[${severity}] ${relPath} missing meta charset=utf-8`);

  const viewport = /<meta\s+name=["']viewport["'][^>]*>/i.exec(html)?.[0] || "";
  if (!viewport) {
    fail(`[${severity}] ${relPath} missing meta viewport`);
  } else {
    const content = /content=["']([^"']*)["']/i.exec(viewport)?.[1] || "";
    if (!/width\s*=\s*device-width/i.test(content)) {
      fail(`[${severity}] ${relPath} viewport missing width=device-width`);
    }
  }

  const hasTitle = /<title>\s*[^<]+<\/title>/i.test(html);
  if (!hasTitle) fail(`[${severity}] ${relPath} missing <title>`);

  if (opts.requireDescription) {
    const hasDesc = /<meta\s+name=["']description["'][^>]*content=["'][^"']{50,}["']/i.test(html);
    if (!hasDesc) fail(`[${severity}] ${relPath} missing meta description (min 50 chars)`);
  }
}

function validateJson(absPath, relPath, severity) {
  try {
    JSON.parse(readText(absPath));
  } catch (err) {
    fail(`[${severity}] ${relPath} invalid JSON (${err.message || String(err)})`);
  }
}

function validateSitemap(absPath, relPath, severity) {
  const xml = readText(absPath);
  if (!/^<\?xml/i.test(xml)) {
    fail(`[${severity}] ${relPath} missing XML declaration`);
  }
  if (!/<(urlset|sitemapindex)[\s>]/i.test(xml)) {
    fail(`[${severity}] ${relPath} missing <urlset> or <sitemapindex>`);
  }
  if (!/<loc>https?:\/\/[^<]+<\/loc>/i.test(xml)) {
    fail(`[${severity}] ${relPath} missing <loc> entries`);
  }
}

function validateRobots(absPath, relPath, severity) {
  const text = readText(absPath).trim();
  if (!text) fail(`[${severity}] ${relPath} is empty`);
}

function validateCname(absPath, relPath, severity) {
  const text = readText(absPath).trim();
  if (!text) {
    fail(`[${severity}] ${relPath} is empty`);
    return;
  }
  if (!/^[a-z0-9.-]+$/i.test(text)) {
    fail(`[${severity}] ${relPath} has invalid domain format`);
  }
}

function walkFiles(dir, predicate) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, predicate));
      continue;
    }
    if (predicate(fullPath)) results.push(fullPath);
  }
  return results;
}

function validateJsonDir(relDir, severity) {
  const absDir = ensureExists(relDir, relDir, severity);
  if (!absDir) return;
  const jsonFiles = walkFiles(absDir, (file) => file.endsWith(".json"));
  if (!jsonFiles.length) {
    fail(`[${severity}] ${relDir} has no JSON files`);
    return;
  }
  for (const jsonFile of jsonFiles) {
    const rel = path.relative(rootDir, jsonFile);
    validateJson(jsonFile, rel, severity);
  }
}

function validateSet(items, severity) {
  for (const item of items) {
    const abs = ensureExists(item.rel, item.label, severity);
    if (!abs) continue;
    if (item.minBytes) ensureMinSize(abs, item.rel, item.minBytes, severity);
    switch (item.type) {
      case "html":
        validateHtmlBasics(abs, item.rel, severity, item.rules || {});
        break;
      case "json":
        validateJson(abs, item.rel, severity);
        break;
      case "sitemap":
        validateSitemap(abs, item.rel, severity);
        break;
      case "robots":
        validateRobots(abs, item.rel, severity);
        break;
      case "cname":
        validateCname(abs, item.rel, severity);
        break;
      case "text":
      default:
        break;
    }
  }
}

function main() {
  if (shouldBuild) {
    execSync("node scripts/build-public.js", { stdio: "inherit", cwd: repoRoot });
  }

  if (!fs.existsSync(rootDir)) {
    fail(`[critical] root not found: ${path.relative(repoRoot, rootDir)}`);
  }

  const critical = [
    { rel: "index.html", type: "html", rules: { requireDescription: true } },
    { rel: "admin/index.html", type: "html" },
    { rel: "assets/css/styles.css", type: "text", minBytes: 50 },
    { rel: "assets/js/app.js", type: "text", minBytes: 50 },
    { rel: "manifest.json", type: "json" },
    { rel: "robots.txt", type: "robots" },
    { rel: "sitemap.xml", type: "sitemap" },
    { rel: "CNAME", type: "cname" },
  ];

  const semicritical = [
    { rel: "admin/app.js", type: "text", minBytes: 20 },
    { rel: "admin/styles.css", type: "text", minBytes: 20 },
    { rel: "qr/index.html", type: "html" },
    { rel: "qr/qr.js", type: "text", minBytes: 20 },
    { rel: "assets/css/modules/animations.css", type: "text", minBytes: 10 },
  ];

  validateSet(critical, "critical");
  validateSet(semicritical, "semicritical");
  validateJsonDir("data", "semicritical");
  validateJsonDir(path.join("assets", "data"), "semicritical");

  if (errors.length) {
    console.error("x Public validation failed:");
    for (const err of errors) console.error(`- ${err}`);
    process.exit(1);
  }

  console.log("ok Public validation passed (critical and semicritical)");
}

main();
