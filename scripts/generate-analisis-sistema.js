#!/usr/bin/env node
/**
 * Regenera la seccion autogenerada de `ANALISIS_SISTEMA.md`.
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

function readTextSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function listFilesInDir(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((name) => {
      const abs = path.join(dirPath, name);
      if (!fs.statSync(abs).isFile()) return false;
      if (!ext) return true;
      return name.toLowerCase().endsWith(ext);
    })
    .sort();
}

function stripQuery(value) {
  return value.split("?")[0];
}

function extractCssLinks(html) {
  if (!html) return [];
  const matches = [];
  const regex = /href=["']([^"']+\.css[^"']*)["']/gi;
  let match = null;
  while ((match = regex.exec(html))) {
    matches.push(match[1]);
  }
  return matches;
}

function extractModuleImports(jsText) {
  if (!jsText) return [];
  const matches = [];
  const regex = /import\s+(?:[^"']+from\s+)?["']\.\/modules\/([^"']+)["']/gi;
  let match = null;
  while ((match = regex.exec(jsText))) {
    matches.push(match[1]);
  }
  return matches;
}

function extractAssetImageRefs(text) {
  if (!text) return [];
  const matches = [];
  const regex = /assets\/img\/[A-Za-z0-9._-]+/g;
  let match = null;
  while ((match = regex.exec(text))) {
    matches.push(match[0]);
  }
  return matches;
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

  const indexHtml = readTextSafe(path.join(repoRoot, "index.html"));
  const bootJs = readTextSafe(path.join(repoRoot, "assets/js/boot.js"));
  const appJs = readTextSafe(path.join(repoRoot, "assets/js/app.js"));
  const configJs = readTextSafe(path.join(repoRoot, "assets/js/modules/config.js"));
  const workerIndex = readTextSafe(path.join(repoRoot, "workers/mahiteklab-api/src/index.js"));
  const qrJs = readTextSafe(path.join(repoRoot, "qr/qr.js"));

  const cssModules = listFilesInDir(path.join(repoRoot, "assets/css/modules"), ".css");
  const cssLinked = extractCssLinks(indexHtml).map(stripQuery);
  const cssModulesMissing = cssModules.filter(
    (name) => !cssLinked.includes(`assets/css/modules/${name}`),
  );

  const jsModules = listFilesInDir(path.join(repoRoot, "assets/js/modules"), ".js");
  const jsImported = extractModuleImports(bootJs).map(stripQuery);
  const jsModulesMissing = jsModules.filter((name) => !jsImported.includes(name));

  const imageDir = path.join(repoRoot, "assets/img");
  const images = listFilesInDir(imageDir).filter(
    (name) => !name.toLowerCase().endsWith(".ini"),
  );
  const dataFiles = [
    "data/products.json",
    "data/promos.json",
    "data/faq.json",
    "data/social.json",
    "assets/data/brand.json",
  ];
  const products = readJsonSafe(path.join(repoRoot, "data/products.json"));
  const promos = readJsonSafe(path.join(repoRoot, "data/promos.json"));
  const faq = readJsonSafe(path.join(repoRoot, "data/faq.json"));
  const social = readJsonSafe(path.join(repoRoot, "data/social.json"));
  const brand = readJsonSafe(path.join(repoRoot, "assets/data/brand.json"));
  const assetTexts = [
    indexHtml,
    appJs,
    bootJs,
    configJs,
    workerIndex,
    ...dataFiles.map((rel) => readTextSafe(path.join(repoRoot, rel))),
  ];

  const productsArray = Array.isArray(products) ? products : [];
  const promosArray = Array.isArray(promos) ? promos : [];
  const faqArray = Array.isArray(faq) ? faq : [];
  const now = new Date();

  const productsActive = productsArray.filter((item) => item?.estado === "activo").length;
  const productsMissingRequired = productsArray.filter((item) => {
    return !item?.id || !item?.nombre || !item?.categoria || item?.precio_mxn == null;
  });
  const productsPlaceholderImages = productsArray.filter((item) => {
    const val = String(item?.imagen || "").trim();
    return val === "" || val === "??";
  }).length;

  const promosActive = promosArray.filter((item) => {
    if (!item || item.estado !== "activo") return false;
    const desde = item.desde ? new Date(item.desde) : null;
    const hasta = item.hasta ? new Date(item.hasta) : null;
    if (desde && Number.isNaN(desde.getTime())) return false;
    if (hasta && Number.isNaN(hasta.getTime())) return false;
    if (desde && now < desde) return false;
    if (hasta && now > hasta) return false;
    return true;
  }).length;

  const promosMissingIcon = promosArray.filter((item) => {
    const icon = String(item?.icono || "").trim();
    if (!icon) return true;
    if (!icon.startsWith("assets/img/")) return false;
    const iconPath = path.join(repoRoot, icon);
    return !fs.existsSync(iconPath);
  });

  const brandHasSocial = Boolean(
    brand &&
      brand.social &&
      Object.values(brand.social).some((value) => String(value || "").trim()),
  );
  const cssFiles = allFiles.filter((abs) => {
    const rel = toPosix(path.relative(repoRoot, abs));
    return rel.startsWith("assets/css/") && rel.endsWith(".css");
  });
  for (const abs of cssFiles) {
    assetTexts.push(readTextSafe(abs));
  }

  const referencedImages = new Set();
  for (const text of assetTexts) {
    for (const ref of extractAssetImageRefs(text)) {
      referencedImages.add(ref);
    }
  }

  const unusedImages = images.filter(
    (name) => !referencedImages.has(`assets/img/${name}`),
  );

  const systemFiles = allFiles
    .map((abs) => toPosix(path.relative(repoRoot, abs)))
    .filter((rel) => {
      const base = path.basename(rel).toLowerCase();
      return base === "desktop.ini" || base === "thumbs.db" || base === ".ds_store";
    });

  const hasWranglerToml = fs.existsSync(
    path.join(repoRoot, "workers/mahiteklab-api/wrangler.toml"),
  );
  const hasAdminHeaders = fs.existsSync(path.join(repoRoot, "admin/_headers"));
  const hasCname = fs.existsSync(path.join(repoRoot, "CNAME"));

  const apiBaseMatch = appJs.match(/NEWSLETTER_API_BASE:\s*'([^']*)'/);
  const apiBaseValue = apiBaseMatch ? apiBaseMatch[1].trim() : "";
  const turnstileMatch = appJs.match(/NEWSLETTER_TURNSTILE_SITEKEY:\s*'([^']*)'/);
  const turnstileValue = turnstileMatch ? turnstileMatch[1].trim() : "";

  const indexHasStyles = indexHtml.includes("assets/css/styles.css");
  const indexHasAnimations = indexHtml.includes("assets/css/modules/animations.css");
  const indexHasApp = indexHtml.includes("assets/js/app.js");
  const indexHasBoot = indexHtml.includes("assets/js/boot.js");
  const indexHasManifest = indexHtml.includes('rel="manifest"') || indexHtml.includes("rel='manifest'");

  const qrHasPlaceholderGa = qrJs.includes("G-XXXXXXXXXX");

  const hasLicense =
    fs.existsSync(path.join(repoRoot, "LICENSE")) ||
    fs.existsSync(path.join(repoRoot, "LICENSE.md"));

  const lighthouseCiPath = path.join(repoRoot, "lighthouserc.ci.json");
  const lighthouseCiExists = fs.existsSync(lighthouseCiPath);
  const workflowText = workflows
    .map((wf) => readTextSafe(path.join(repoRoot, wf)))
    .join("\n");
  const lighthouseCiUsed = lighthouseCiExists && workflowText.includes("lighthouserc.ci.json");

  const publicDirExists = fs.existsSync(path.join(repoRoot, "public"));

  const lines = [];
  lines.push(`Generado: ${nowIso}`);
  lines.push(`Fingerprint: sha256:${fingerprint}`);
  lines.push(`Archivos hasheados: ${fingerprintFiles.length}`);
  lines.push("");
  lines.push("Criterio del fingerprint (cambios significativos):");
  lines.push("- Root: `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`, `package.json`, `package-lock.json`");
  lines.push("- `assets/js/**/*.js`, `assets/css/**/*.css`");
  lines.push("- `assets/data/**/*.json`, `data/**/*.json`");
  lines.push("- `.github/workflows/**/*.{yml,yaml}`");
  lines.push("- `scripts/**/*.{js,ps1,sh,bat}`");
  lines.push("- `admin/**/*.{html,css,js}` + `admin/_headers`");
  lines.push("- `workers/**/*.{js,toml,md,sql}`");
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

  const diagnostics = [];
  const dataSummary = [];
  if (productsArray.length > 0) {
    dataSummary.push(
      `Productos: ${productsActive}/${productsArray.length} activos (placeholders: ${productsPlaceholderImages})`,
    );
  } else {
    dataSummary.push("Productos: no se pudo leer data/products.json");
  }
  if (promosArray.length > 0) {
    dataSummary.push(`Promos: ${promosActive}/${promosArray.length} activas`);
  } else {
    dataSummary.push("Promos: no se pudo leer data/promos.json");
  }
  if (faqArray.length > 0) {
    dataSummary.push(`FAQ: ${faqArray.length} items`);
  } else {
    dataSummary.push("FAQ: no se pudo leer data/faq.json");
  }
  diagnostics.push(`Datos: ${dataSummary.join(" | ")}`);

  if (!indexHasStyles) {
    diagnostics.push("index.html no referencia assets/css/styles.css.");
  }
  if (!indexHasAnimations) {
    diagnostics.push("index.html no referencia assets/css/modules/animations.css.");
  }
  if (!indexHasApp) {
    diagnostics.push("index.html no referencia assets/js/app.js.");
  }
  if (!indexHasBoot) {
    diagnostics.push("index.html no referencia assets/js/boot.js.");
  }
  if (!indexHasManifest) {
    diagnostics.push("index.html no incluye el manifest.");
  }
  if (cssModulesMissing.length > 0) {
    diagnostics.push(
      `CSS sin referencia en index.html (${cssModulesMissing.length}): ${cssModulesMissing.join(
        ", ",
      )}`,
    );
  }
  if (jsModulesMissing.length > 0) {
    diagnostics.push(
      `Modulos JS sin import en boot.js (${jsModulesMissing.length}): ${jsModulesMissing.join(
        ", ",
      )}`,
    );
  }
  if (unusedImages.length > 0) {
    const preview = unusedImages.slice(0, 12).join(", ");
    const suffix = unusedImages.length > 12 ? ", ..." : "";
    diagnostics.push(
      `Imagenes sin referencia detectada (${unusedImages.length}): ${preview}${suffix}`,
    );
  }
  if (systemFiles.length > 0) {
    const preview = systemFiles.slice(0, 12).join(", ");
    const suffix = systemFiles.length > 12 ? ", ..." : "";
    diagnostics.push(
      `Archivos de sistema detectados (${systemFiles.length}): ${preview}${suffix}`,
    );
  }
  if (productsMissingRequired.length > 0) {
    const preview = productsMissingRequired
      .slice(0, 6)
      .map((item) => item.id || item.nombre || "sin-id")
      .join(", ");
    const suffix = productsMissingRequired.length > 6 ? ", ..." : "";
    diagnostics.push(
      `Productos con campos requeridos incompletos (${productsMissingRequired.length}): ${preview}${suffix}`,
    );
  }
  if (promosMissingIcon.length > 0) {
    const preview = promosMissingIcon
      .slice(0, 6)
      .map((item) => item.id || item.titulo || "sin-id")
      .join(", ");
    const suffix = promosMissingIcon.length > 6 ? ", ..." : "";
    diagnostics.push(
      `Promos con icono faltante o inexistente (${promosMissingIcon.length}): ${preview}${suffix}`,
    );
  }
  if (brandHasSocial && social) {
    diagnostics.push("brand.json incluye social; data/social.json queda como fallback.");
  } else if (!brandHasSocial && social) {
    diagnostics.push("brand.json no incluye social; se usa data/social.json.");
  } else if (!social) {
    diagnostics.push("data/social.json no se pudo leer.");
  }
  if (!apiBaseValue) {
    diagnostics.push("NEWSLETTER_API_BASE no esta configurado en assets/js/app.js.");
  }
  if (!turnstileValue) {
    diagnostics.push("NEWSLETTER_TURNSTILE_SITEKEY vacio (modo sin Turnstile).");
  }
  if (qrHasPlaceholderGa) {
    diagnostics.push("qr/qr.js usa un Measurement ID placeholder (G-XXXXXXXXXX).");
  }
  if (!hasAdminHeaders) {
    diagnostics.push("admin/_headers no existe (CSP/headers no aplicaran en admin).");
  }
  if (!hasWranglerToml) {
    diagnostics.push("workers/mahiteklab-api/wrangler.toml no existe.");
  }
  if (!hasCname) {
    diagnostics.push("CNAME no existe (dominio custom no configurado).");
  }
  if (!hasLicense) {
    diagnostics.push("No se encontro LICENSE en la raiz (README lo referencia).");
  }
  if (lighthouseCiExists && !lighthouseCiUsed) {
    diagnostics.push("lighthouserc.ci.json existe, pero no esta referenciado en workflows.");
  }
  if (publicDirExists) {
    diagnostics.push("public/ existe en disco (salida generada). Verifica que no se versiona.");
  }

  lines.push("");
  lines.push("Diagnostico rapido:");
  if (diagnostics.length === 0) {
    lines.push("- Sin alertas detectadas.");
  } else {
    for (const item of diagnostics) lines.push(`- ${item}`);
  }

  return lines.join("\n");
}

function upsertAutoBlock(markdown, newBlock) {
  if (markdown.includes(AUTO_START) && markdown.includes(AUTO_END)) {
    const start = markdown.indexOf(AUTO_START);
    const end = markdown.indexOf(AUTO_END);
    if (end < start) throw new Error("Markers invalidos en ANALISIS_SISTEMA.md");
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
    : "# Analisis del Sistema\n";

  const stored = extractStoredFingerprint(existing);
  const hasAutoBlock = existing.includes(AUTO_START) && existing.includes(AUTO_END);
  if (stored && stored === fingerprint && hasAutoBlock) {
    console.log(`V ANALISIS_SISTEMA.md ya esta actualizado (fingerprint ${fingerprint.slice(0, 12)}...)`);
    return;
  }

  const autoSection = renderAutoSection({
    fingerprint,
    fingerprintFiles,
    allFiles,
  });

  const updated = upsertAutoBlock(existing, autoSection);
  fs.writeFileSync(outputPath, updated, "utf8");
  console.log(`V ANALISIS_SISTEMA.md actualizado (fingerprint ${fingerprint.slice(0, 12)}...)`);
}

main();
