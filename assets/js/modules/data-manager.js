/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA MANAGER MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * Gestión centralizada de carga, caché y actualización de datos JSON.
 * Maneja copywriting, productos, promociones y otros datos dinámicos.
 *
 * @module DataManager
 * @version 2.0.0
 * @author Mahitek 3D Lab
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CONFIG } from './config.js';

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO Y CACHE
// ═══════════════════════════════════════════════════════════════════════════

const cache = new Map();
const loadingPromises = new Map();
const subscribers = new Map();

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

const ENDPOINTS = {
  copywriting: 'data/copywriting.json',
  products: 'data/products.json',
  productsBase: 'data/products.json',
  promos: 'data/promos.json',
  faq: 'data/faq.json',
  social: 'data/social.json',
  brand: 'assets/data/brand.json'
};

// Tiempo de caché en milisegundos (5 minutos por defecto)
const CACHE_DURATION = 5 * 60 * 1000;

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS INTERNOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validar si un dato en caché sigue siendo válido
 */
function isCacheValid(cacheEntry) {
  if (!cacheEntry || !cacheEntry.timestamp) return false;
  const age = Date.now() - cacheEntry.timestamp;
  return age < CACHE_DURATION;
}

/**
 * Logger condicional según modo debug
 */
function log(message, data = null) {
  if (CONFIG.DEBUG_MODE) {
    if (data) {
      console.log(`[DataManager] ${message}`, data);
    } else {
      console.log(`[DataManager] ${message}`);
    }
  }
}

/**
 * Notificar a suscriptores de cambios en datos
 */
function notifySubscribers(dataType, data) {
  const subs = subscribers.get(dataType) || [];
  subs.forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error(`[DataManager] Error en subscriber de ${dataType}:`, error);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE: CARGA DE DATOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cargar datos JSON con caché inteligente y manejo de errores
 * @param {string} dataType - Tipo de datos a cargar (key de ENDPOINTS)
 * @param {Object} options - Opciones de carga
 * @returns {Promise<any>} Datos cargados o null si falla
 */
export async function loadData(dataType, { forceRefresh = false, timeout = 10000 } = {}) {
  // Validar que el endpoint existe
  const endpoint = ENDPOINTS[dataType];
  if (!endpoint) {
    console.error(`[DataManager] Tipo de datos desconocido: ${dataType}`);
    return null;
  }

  // Si no forzamos refresh y tenemos caché válido, devolverlo
  if (!forceRefresh) {
    const cached = cache.get(dataType);
    if (cached && isCacheValid(cached)) {
      log(`Cache hit: ${dataType}`);
      return cached.data;
    }
  }

  // Si ya hay una carga en progreso para este tipo, reutilizarla
  if (loadingPromises.has(dataType)) {
    log(`Carga en progreso: ${dataType}, reutilizando promise`);
    return loadingPromises.get(dataType);
  }

  // Crear nueva promesa de carga
  const loadPromise = (async () => {
    try {
      log(`Cargando: ${endpoint}`);

      // Crear controller para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Cache-Control': forceRefresh ? 'no-cache' : 'default'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Guardar en caché
      cache.set(dataType, {
        data,
        timestamp: Date.now()
      });

      log(`✓ Cargado: ${dataType}`, { items: Array.isArray(data) ? data.length : 'object' });

      // Notificar suscriptores
      notifySubscribers(dataType, data);

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`[DataManager] Timeout cargando ${dataType}`);
      } else {
        console.error(`[DataManager] Error cargando ${dataType}:`, error);
      }

      // Intentar devolver caché expirado si existe
      const expired = cache.get(dataType);
      if (expired && expired.data) {
        log(`Usando caché expirado para ${dataType} por error de red`);
        return expired.data;
      }

      return null;
    } finally {
      // Limpiar promesa de carga
      loadingPromises.delete(dataType);
    }
  })();

  // Guardar promesa de carga
  loadingPromises.set(dataType, loadPromise);

  return loadPromise;
}

/**
 * Cargar múltiples tipos de datos en paralelo
 * @param {string[]} dataTypes - Array de tipos de datos a cargar
 * @returns {Promise<Object>} Objeto con resultados indexados por tipo
 */
export async function loadMultiple(dataTypes) {
  const promises = dataTypes.map(type => loadData(type).then(data => ({ type, data })));

  const results = await Promise.all(promises);

  return results.reduce((acc, { type, data }) => {
    acc[type] = data;
    return acc;
  }, {});
}

// ═══════════════════════════════════════════════════════════════════════════
// SUSCRIPCIONES Y REACTIVITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Suscribirse a cambios en un tipo de datos
 * @param {string} dataType - Tipo de datos
 * @param {Function} callback - Callback a ejecutar cuando cambien los datos
 * @returns {Function} Función para desuscribirse
 */
export function subscribe(dataType, callback) {
  if (!subscribers.has(dataType)) {
    subscribers.set(dataType, []);
  }

  subscribers.get(dataType).push(callback);
  log(`Nuevo subscriber para ${dataType}`);

  // Devolver función de desuscripción
  return () => {
    const subs = subscribers.get(dataType) || [];
    const index = subs.indexOf(callback);
    if (index > -1) {
      subs.splice(index, 1);
      log(`Subscriber removido de ${dataType}`);
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS ESPECÍFICOS DE DOMINIO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtener copywriting por clave con fallback
 * @param {string} key - Clave del texto (ej: 'hero.title')
 * @returns {Promise<string>} Texto o clave si no existe
 */
export async function getCopywriting(key) {
  const data = await loadData('copywriting');
  if (!data) return key;

  const keys = key.split('.');
  let value = data;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      log(`⚠ Copywriting no encontrado: ${key}`);
      return key;
    }
  }

  return value;
}

/**
 * Obtener productos activos filtrados
 * @param {Object} filters - Filtros a aplicar
 * @returns {Promise<Array>} Array de productos filtrados
 */
export async function getProducts({ category = null, search = null, activeOnly = true } = {}) {
  const data = await loadData('products');
  if (!data || !Array.isArray(data)) return [];

  let products = data;

  // Filtrar solo activos
  if (activeOnly) {
    products = products.filter(p => p.estado === 'activo');
  }

  // Filtrar por categoría
  if (category && category !== 'todas') {
    products = products.filter(p => p.categoria === category);
  }

  // Filtrar por búsqueda
  if (search && search.trim()) {
    const term = search.toLowerCase().trim();
    products = products.filter(p => {
      return (
        p.nombre?.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term) ||
        p.id?.toLowerCase().includes(term) ||
        p.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    });
  }

  return products;
}

/**
 * Obtener promociones activas según fechas
 * @returns {Promise<Array>} Array de promociones activas
 */
export async function getActivePromos() {
  const data = await loadData('promos');
  if (!data || !Array.isArray(data)) return [];

  const now = new Date();

  return data.filter(promo => {
    // Si está marcado como inactivo, excluir
    if (promo.estado && promo.estado === 'inactivo') return false;

    // Si es permanente o no tiene fechas, incluir si está activo
    if (!promo.desde || !promo.hasta) {
      return promo.estado === 'activo';
    }

    // Validar rango de fechas
    const start = new Date(promo.desde);
    const end = new Date(promo.hasta);
    return now >= start && now <= end;
  });
}

/**
 * Obtener FAQ con opción de filtrar destacadas
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<Array>} Array de FAQs
 */
export async function getFAQ({ featuredOnly = false, category = null } = {}) {
  const data = await loadData('faq');
  if (!data || !Array.isArray(data)) return [];

  let faqs = data;

  if (featuredOnly) {
    faqs = faqs.filter(f => f.destacada);
  }

  if (category) {
    faqs = faqs.filter(f => f.categoria === category);
  }

  return faqs;
}

/**
 * Obtener configuración de marca
 * @returns {Promise<Object>} Datos de marca o null
 */
export async function getBrand() {
  return loadData('brand');
}

/**
 * Obtener links de redes sociales
 * @returns {Promise<Object>} Links de social o null
 */
export async function getSocial() {
  // Intentar primero desde brand
  const brand = await loadData('brand');
  if (brand && brand.social) return brand.social;

  // Fallback a archivo separado
  return loadData('social');
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Limpiar caché completo o de un tipo específico
 * @param {string} [dataType] - Tipo específico a limpiar, o null para todo
 */
export function clearCache(dataType = null) {
  if (dataType) {
    cache.delete(dataType);
    log(`Cache limpiado: ${dataType}`);
  } else {
    cache.clear();
    log('Cache completamente limpiado');
  }
}

/**
 * Obtener estadísticas del caché
 * @returns {Object} Estadísticas
 */
export function getCacheStats() {
  const stats = {
    totalEntries: cache.size,
    valid: 0,
    expired: 0,
    entries: []
  };

  cache.forEach((entry, key) => {
    const valid = isCacheValid(entry);
    const age = Date.now() - entry.timestamp;

    stats.entries.push({
      key,
      valid,
      age: Math.round(age / 1000), // segundos
      size: JSON.stringify(entry.data).length
    });

    if (valid) stats.valid++;
    else stats.expired++;
  });

  return stats;
}

/**
 * Precarga de datos críticos para el render inicial
 * @returns {Promise<void>}
 */
export async function preloadCritical() {
  log('Precargando datos críticos...');

  const critical = ['copywriting', 'products', 'brand', 'social'];

  try {
    await loadMultiple(critical);
    log('✓ Datos críticos precargados');
  } catch (error) {
    console.error('[DataManager] Error en precarga crítica:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializar DataManager
 */
export function init() {
  log('DataManager inicializado');

  // Limpiar caché expirado cada 10 minutos
  setInterval(
    () => {
      let cleaned = 0;
      cache.forEach((entry, key) => {
        if (!isCacheValid(entry)) {
          cache.delete(key);
          cleaned++;
        }
      });
      if (cleaned > 0) {
        log(`Limpieza automática: ${cleaned} entradas expiradas removidas`);
      }
    },
    10 * 60 * 1000
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Core
  loadData,
  loadMultiple,
  subscribe,

  // Domain-specific
  getCopywriting,
  getProducts,
  getActivePromos,
  getFAQ,
  getBrand,
  getSocial,

  // Cache management
  clearCache,
  getCacheStats,
  preloadCritical,

  // Init
  init
};
