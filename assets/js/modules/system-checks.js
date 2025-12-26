/**
 * Verificaciones ligeras de sistema y módulos.
 */

import { ConfigUtils } from './config.js';
import { collectIssues } from './validation.js';

const CHECKS = [
  {
    name: 'catalogo',
    selectors: ['#product-carousel', '#category-filter', '#search-input']
  },
  {
    name: 'promos',
    selectors: ['#promos', '#promos-container', '#promos-dots']
  },
  {
    name: 'faq',
    selectors: ['#faq', '#faq-list', '#faq-search', '#faq-category']
  },
  {
    name: 'newsletter',
    selectors: ['form.newsletter', '#newsletter-status']
  },
  {
    name: 'navegacion',
    selectors: ['.nav-toggle', '.nav-menu']
  }
];

export function runSystemChecks() {
  const bag = collectIssues('dom');
  const summary = {
    modulos: CHECKS.length,
    selectores: 0,
    faltantes: 0
  };

  CHECKS.forEach(check => {
    let missing = 0;
    check.selectors.forEach(selector => {
      summary.selectores += 1;
      if (!document.querySelector(selector)) {
        missing += 1;
        summary.faltantes += 1;
        bag.warn(`Falta elemento requerido en ${check.name}: ${selector}`);
      }
    });

    const ok = check.selectors.length - missing;
    summary[check.name] = `${ok}/${check.selectors.length}`;
  });

  const report = bag.summary(summary);
  if (report.errors.length || report.warnings.length) {
    ConfigUtils.warn('Verificación del sistema', report);
  } else {
    ConfigUtils.log('Verificación del sistema: sin hallazgos.');
  }

  return report;
}
