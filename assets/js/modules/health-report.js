/**
 * Registro de health checks para módulos y sistema.
 */

import { ConfigUtils } from './config.js';

const reports = new Map();

export function addHealthReport(scope, report = {}) {
  if (!scope) return;
  const summary = report && typeof report.summary === 'object' ? report.summary : {};
  const errors = Array.isArray(report?.errors) ? report.errors : [];
  const warnings = Array.isArray(report?.warnings) ? report.warnings : [];

  reports.set(scope, {
    summary,
    errors,
    warnings,
    updatedAt: new Date().toISOString()
  });
}

export function getHealthReports() {
  return Array.from(reports.entries());
}

export function flushHealthReports({ force = false } = {}) {
  const entries = getHealthReports();
  if (!entries.length) return;

  const hasIssues = entries.some(
    ([, report]) => report.errors.length > 0 || report.warnings.length > 0
  );
  if (!force && !ConfigUtils.isDebug() && !hasIssues) return;

  const title = hasIssues ? 'Mahitek Health Check (con alertas)' : 'Mahitek Health Check';
  console.groupCollapsed(title);
  entries.forEach(([scope, report]) => {
    const summaryParts = Object.entries(report.summary || {}).map(
      ([key, value]) => `${key}: ${value}`
    );
    if (report.errors.length) summaryParts.push(`errores: ${report.errors.length}`);
    if (report.warnings.length) summaryParts.push(`avisos: ${report.warnings.length}`);
    const header = summaryParts.length ? `[${scope}] ${summaryParts.join(' | ')}` : `[${scope}]`;
    console.info(header);
    report.errors.forEach(msg => console.error(`  - ${msg}`));
    report.warnings.forEach(msg => console.warn(`  - ${msg}`));
  });
  console.groupEnd();
}
