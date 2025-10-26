#!/usr/bin/env node
/**
 * Validación semántica de HTML usando JSDOM
 * - Verifica presencia de meta y estructura crítica
 * - Valida que todos los <li> tengan padre UL/OL
 * - Verifica que apple-touch-icon esté dentro de <head>
 *
 * Exit codes:
 * 0 OK, 1 errores
 */
const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error(`✗ ${msg}`);
  errors++;
}
function ok(msg) {
  console.log(`✓ ${msg}`);
}

let errors = 0;
const htmlPath = path.resolve(process.cwd(), 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('✗ index.html no encontrado');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
if (process.env.DEBUG_HTML === '1') {
  console.log('---[HEAD OF HTML]---');
  console.log(html.slice(0, 600));
  console.log('--------------------');
}
// 1) DOCTYPE
const hasDoctype = /^\s*<!doctype\s+html>/i.test(html);
ok(hasDoctype ? 'DOCTYPE presente' : '');
if (!hasDoctype) fail('Falta DOCTYPE html');

// 2) Charset
const metaCharset = /<meta\s+charset\s*=\s*"?utf-8"?/i.test(html);
if (!metaCharset) {
  fail("Falta <meta charset='UTF-8'> en <head>");
} else {
  ok('Charset UTF-8 correcto');
}

// 3) Viewport
const viewport = /<meta\s+name=\"viewport\"[^>]*>/i.exec(html)?.[0] || '';
if (!viewport) {
  fail('Falta meta viewport');
} else {
  const content = /content=\"([^\"]*)\"/i.exec(viewport)?.[1] || '';
  if (!/width\s*=\s*device-width/i.test(content)) fail('Viewport sin width=device-width');
  else ok('Viewport correcto');
}

// 4) Title
const title = /<title>\s*[^<]+<\/title>/i.test(html);
if (!title) fail('Falta <title> con contenido');
else ok('Title presente');

// 4b) Meta description
const metaDesc = /<meta\s+name=["']description["'][^>]*content=["'][^"']{50,}["']/i.test(html);
if (!metaDesc) fail('Falta <meta name="description"> con contenido (mín 50 chars)');
else ok('Meta description presente');

// 5) apple-touch-icon dentro de head
const headEndIdx = html.search(/<\/head>/i);
const headHtml = headEndIdx > -1 ? html.slice(0, headEndIdx) : '';
if (headHtml) {
  if (/rel=["']apple-touch-icon["']/i.test(headHtml)) ok('apple-touch-icon en <head>');
}

// 5b) Manifest.json link
if (/<link[^>]+rel=["']manifest["']/i.test(headHtml)) ok('Manifest PWA presente');
else fail('Falta <link rel="manifest"> para PWA');

// 5c) Theme color
if (/<meta[^>]+name=["']theme-color["']/i.test(headHtml)) ok('Theme color presente');

// 6) <li> con padre UL/OL
const tokens = [...html.matchAll(/<\/?(ul|ol|li)(\s|>)/gi)];
let stack = [];
let orphanLis = 0;
for (const m of tokens) {
  const tag = m[1].toLowerCase();
  const closing = m[0].startsWith('</');
  if (tag === 'ul' || tag === 'ol') {
    if (!closing) stack.push(tag);
    else stack.pop();
  } else if (tag === 'li') {
    if (!stack.length || !['ul', 'ol'].includes(stack[stack.length - 1])) orphanLis++;
  }
}
if (orphanLis > 0) fail(`Se encontraron ${orphanLis} <li> fuera de <ul>/<ol>`);
else ok('Estructura de listas correcta');

// 7) Links a recursos locales (CSS/JS) existen
const resourceHrefs = [];
for (const m of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)) {
  resourceHrefs.push(m[1]);
}
for (const m of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
  resourceHrefs.push(m[1]);
}

const normalize = p => p.replace(/\?v=\d+/g, '');
for (const ref of resourceHrefs) {
  if (/^https?:\/\//i.test(ref)) continue; // externos
  const p = path.resolve(process.cwd(), normalize(ref));
  if (!fs.existsSync(p)) fail(`Recurso no encontrado: ${ref}`);
}

if (errors > 0) {
  console.error(`\n✗ Validación HTML falló: ${errors} error(es)`);
  process.exit(1);
}
console.log('\n✓ Validación HTML OK');
process.exit(0);
