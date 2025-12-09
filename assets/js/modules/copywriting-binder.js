/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COPYWRITING BINDER
 * ═══════════════════════════════════════════════════════════════════════════
 * Helper para enlazar copywriting.json a elementos del DOM de forma declarativa.
 * Usa atributos data-copy para indicar qué texto cargar.
 *
 * @module CopywritingBinder
 * @version 1.0.0
 * @author Mahitek 3D Lab
 * ═══════════════════════════════════════════════════════════════════════════
 */

import DataManager from './data-manager.js';
import { CONFIG } from './config.js';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const SELECTORS = {
  // Selector principal para elementos con copy
  copy: '[data-copy]',

  // Selector para elementos con copy en atributo (placeholder, aria-label, etc.)
  copyAttr: '[data-copy-attr]'
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function log(message, data = null) {
  if (CONFIG.DEBUG_MODE) {
    if (data) {
      console.log(`[CopyBinder] ${message}`, data);
    } else {
      console.log(`[CopyBinder] ${message}`);
    }
  }
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Procesar plantillas simples con variables
 * Ejemplo: "Hola {nombre}" con { nombre: "Juan" } → "Hola Juan"
 */
function processTemplate(template, vars = {}) {
  if (!template || typeof template !== 'string') return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (key in vars) {
      return escapeHTML(vars[key]);
    }
    return match;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BINDING DE TEXTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Aplicar copywriting a un elemento
 * @param {HTMLElement} element - Elemento a actualizar
 * @param {Object} copyData - Datos de copywriting completos
 */
function bindElement(element, copyData) {
  const copyKey = element.getAttribute('data-copy');
  if (!copyKey) return;

  // Obtener valor desde copyData usando la ruta (ej: "hero.title")
  const keys = copyKey.split('.');
  let value = copyData;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      log(`⚠ Copy no encontrado: ${copyKey}`);
      return;
    }
  }

  // Si el valor no es string, no procesar
  if (typeof value !== 'string') {
    log(`⚠ Copy no es string: ${copyKey}`, { value });
    return;
  }

  // Procesar variables si existen (data-copy-vars)
  const varsAttr = element.getAttribute('data-copy-vars');
  if (varsAttr) {
    try {
      const vars = JSON.parse(varsAttr);
      value = processTemplate(value, vars);
    } catch (error) {
      console.error(`[CopyBinder] Error parseando vars en ${copyKey}:`, error);
    }
  }

  // Determinar cómo aplicar el texto
  const mode = element.getAttribute('data-copy-mode') || 'text';

  switch (mode) {
    case 'html':
      // SECURITY: Solo usar si el copywriting es confiable (origen interno)
      element.innerHTML = value;
      break;

    case 'text':
    default:
      element.textContent = value;
      break;
  }

  // Marcar como enlazado
  element.setAttribute('data-copy-bound', 'true');
  log(`✓ Copy aplicado: ${copyKey}`);
}

/**
 * Aplicar copywriting a atributos
 * @param {HTMLElement} element - Elemento a actualizar
 * @param {Object} copyData - Datos de copywriting
 */
function bindAttribute(element, copyData) {
  const copyKey = element.getAttribute('data-copy-attr');
  const attrName = element.getAttribute('data-copy-attr-name');

  if (!copyKey || !attrName) return;

  // Obtener valor
  const keys = copyKey.split('.');
  let value = copyData;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      log(`⚠ Copy attr no encontrado: ${copyKey}`);
      return;
    }
  }

  if (typeof value !== 'string') return;

  // Procesar variables
  const varsAttr = element.getAttribute('data-copy-vars');
  if (varsAttr) {
    try {
      const vars = JSON.parse(varsAttr);
      value = processTemplate(value, vars);
    } catch (error) {
      console.error(`[CopyBinder] Error parseando vars en ${copyKey}:`, error);
    }
  }

  // Aplicar al atributo
  element.setAttribute(attrName, value);
  element.setAttribute('data-copy-attr-bound', 'true');
  log(`✓ Copy attr aplicado: ${copyKey} → ${attrName}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Enlazar copywriting a todos los elementos con data-copy
 * @param {HTMLElement} [root=document] - Elemento raíz donde buscar
 */
export async function bindCopywriting(root = document) {
  try {
    log('Cargando copywriting...');
    const copyData = await DataManager.loadData('copywriting');

    if (!copyData) {
      console.warn('[CopyBinder] No se pudo cargar copywriting.json');
      return;
    }

    // Enlazar elementos con data-copy
    const elements = root.querySelectorAll(SELECTORS.copy);
    log(`Enlazando ${elements.length} elementos con data-copy`);

    elements.forEach(el => bindElement(el, copyData));

    // Enlazar atributos con data-copy-attr
    const attrElements = root.querySelectorAll(SELECTORS.copyAttr);
    log(`Enlazando ${attrElements.length} atributos con data-copy-attr`);

    attrElements.forEach(el => bindAttribute(el, copyData));

    log('✓ Copywriting enlazado');
  } catch (error) {
    console.error('[CopyBinder] Error enlazando copywriting:', error);
  }
}

/**
 * Re-enlazar copywriting (útil para contenido dinámico)
 * @param {HTMLElement} root - Elemento raíz
 */
export async function rebindCopywriting(root) {
  // Limpiar marcas de bound
  const bound = root.querySelectorAll('[data-copy-bound]');
  bound.forEach(el => el.removeAttribute('data-copy-bound'));

  const attrBound = root.querySelectorAll('[data-copy-attr-bound]');
  attrBound.forEach(el => el.removeAttribute('data-copy-attr-bound'));

  // Re-enlazar
  await bindCopywriting(root);
}

/**
 * Obtener un texto de copywriting directamente
 * @param {string} key - Clave del copywriting
 * @param {Object} [vars] - Variables para interpolación
 * @returns {Promise<string>}
 */
export async function getCopy(key, vars = null) {
  const value = await DataManager.getCopywriting(key);

  if (vars && typeof value === 'string') {
    return processTemplate(value, vars);
  }

  return value;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  bindCopywriting,
  rebindCopywriting,
  getCopy
};

