/*
 Genera archivos JSON compatibles con shields.io endpoint para mostrar los
 puntajes de Lighthouse en badges dinámicos.

 Crea los archivos en docs/badges/:
  - lh-performance.json
  - lh-accessibility.json
  - lh-best-practices.json
  - lh-seo.json
*/

const fs = require('fs');
const path = require('path');

const LH_DIR = path.resolve('.lighthouseci');
const OUT_DIR = path.resolve('docs/badges');

function pickColor(score) {
  if (score >= 90) return 'brightgreen';
  if (score >= 80) return 'green';
  if (score >= 70) return 'yellowgreen';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

function latestLhrJson() {
  if (!fs.existsSync(LH_DIR)) {
    throw new Error(`No existe el directorio ${LH_DIR}. Asegúrate de ejecutar Lighthouse antes.`);
  }
  const files = fs
    .readdirSync(LH_DIR)
    .filter(f => f.toLowerCase().endsWith('.json'))
    .map(f => ({
      file: f,
      mtime: fs.statSync(path.join(LH_DIR, f)).mtimeMs
    }))
    // Excluir archivos que no son reportes (por ejemplo, manifest.json)
    .filter(f => !/manifest\.json/i.test(f.file));

  if (files.length === 0) {
    throw new Error('No se encontraron archivos .json de Lighthouse en .lighthouseci');
  }
  files.sort((a, b) => b.mtime - a.mtime);
  return path.join(LH_DIR, files[0].file);
}

function writeBadge(label, score) {
  const rounded = Math.round(score);
  const color = pickColor(rounded);
  const data = {
    schemaVersion: 1,
    label,
    message: `${rounded}`,
    color
  };
  const map = {
    performance: 'lh-performance.json',
    accessibility: 'lh-accessibility.json',
    'best-practices': 'lh-best-practices.json',
    seo: 'lh-seo.json'
  };
  const file = map[label];
  if (!file) return;
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data));
}

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const lhrPath = latestLhrJson();
  const lhr = JSON.parse(fs.readFileSync(lhrPath, 'utf8'));
  const categories = lhr.categories || {};

  const perf = (categories.performance?.score || 0) * 100;
  const acc = (categories.accessibility?.score || 0) * 100;
  const bp = (categories['best-practices']?.score || 0) * 100;
  const seo = (categories.seo?.score || 0) * 100;

  writeBadge('performance', perf);
  writeBadge('accessibility', acc);
  writeBadge('best-practices', bp);
  writeBadge('seo', seo);

  console.log('Badges generados en docs/badges');
}

main();
