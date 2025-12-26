/**
 * Cargador de JSON con cache en memoria y validaciones básicas.
 */

import { ConfigUtils } from './config.js';

const cache = new Map();

function normalizePath(path) {
  return String(path || '').trim();
}

export async function loadJSON(path, { timeoutMs = 8000, validator } = {}) {
  const safePath = normalizePath(path);
  if (!safePath) return null;

  if (cache.has(safePath)) {
    return cache.get(safePath);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(safePath, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`http_${response.status}`);
    }
    const data = await response.json();
    if (typeof validator === 'function') {
      validator(data);
    }
    cache.set(safePath, data);
    return data;
  } catch (error) {
    ConfigUtils.warn('Error cargando JSON:', safePath, error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function clearDataCache() {
  cache.clear();
}
