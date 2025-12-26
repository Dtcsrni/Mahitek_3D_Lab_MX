/**
 * Configuración centralizada de la aplicación
 * @module config
 * @version 2.0.0
 */

export const CONFIG = {
  // Versión de la aplicación
  VERSION: '2.0.0',

  // Control de logs en producción
  DEBUG_MODE: false,

  // Precios y márgenes
  PRICE_MARKUP: 1.0,
  PRICE_STEP: 10,

  // Redes sociales
  MESSENGER_PAGE: 'mahitek3dlabmx',

  // Imágenes
  PLACEHOLDER_IMAGE: 'assets/img/placeholder-catalog.svg',

  // Rutas de datos JSON
  DATA_PATHS: {
    brand: 'assets/data/brand.json',
    productsBase: 'data/products.json',
    promos: 'data/promos.json',
    social: 'data/social.json',
    faq: 'data/faq.json'
  },

  // Configuración de animaciones
  ANIMATIONS: {
    // Duración base de transiciones
    DURATION_FAST: 200,
    DURATION_NORMAL: 300,
    DURATION_SLOW: 600,

    // Easing functions
    EASE_DEFAULT: 'cubic-bezier(0.22, 1, 0.36, 1)',
    EASE_BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    EASE_SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Intersection Observer thresholds
    SCROLL_THRESHOLD: 0.15,
    SCROLL_ROOT_MARGIN: '-10% 0px',

    // Delays para animaciones en cascada
    CASCADE_DELAY: 100
  },

  // Configuración de narrativa scroll
  NARRATIVE: {
    // Secciones en orden narrativo
    SECTIONS: [
      { id: 'inicio', name: 'Hero', theme: 'dark', narrative: 'hook' },
      { id: 'servicios', name: 'Cómo trabajamos', theme: 'accent-teal', narrative: 'how-it-works' },
      { id: 'catalogo', name: 'Catálogo', theme: 'dark', narrative: 'catalog' },
      { id: 'promos', name: 'Promociones', theme: 'accent-purple', narrative: 'urgency' },
      { id: 'proceso', name: 'Proceso', theme: 'accent-teal', narrative: 'how-it-works' },
      { id: 'faq', name: 'FAQ', theme: 'dark', narrative: 'objections' },
      { id: 'contacto', name: 'Contacto', theme: 'accent-teal', narrative: 'cta' }
    ],

    // Estados de narrativa
    STATES: {
      hook: 'Captura atención',
      'pain-points': 'Identifica problema',
      benefits: 'Presenta solución',
      'how-it-works': 'Explica proceso',
      'use-cases': 'Muestra aplicaciones',
      catalog: 'Presenta ofertas',
      urgency: 'Crea FOMO',
      objections: 'Resuelve dudas',
      cta: 'Impulsa acción'
    }
  },

  // Configuración de performance
  PERFORMANCE: {
    // Lazy loading
    LAZY_LOAD_MARGIN: '200px',
    LAZY_LOAD_THRESHOLD: 0.01,

    // Debounce/Throttle
    RESIZE_DEBOUNCE: 150,
    SCROLL_THROTTLE: 16, // ~60fps

    // Preload crítico
    CRITICAL_IMAGES: ['assets/img/logo-color.svg'],

    // Code splitting
    DEFER_NON_CRITICAL: true,

    // Web Vitals targets
    TARGETS: {
      LCP: 2500, // ms
      FID: 100, // ms
      CLS: 0.1 // score
    }
  },

  // Configuración de accesibilidad
  A11Y: {
    // Reducir motion si el usuario lo prefiere
    RESPECT_PREFERS_REDUCED_MOTION: true,

    // Contraste mínimo WCAG AAA
    MIN_CONTRAST_RATIO: 7.0,

    // Touch targets mínimos (Apple HIG / Material)
    MIN_TOUCH_TARGET: 44, // px

    // Skip links
    SKIP_LINKS_ENABLED: true,

    // ARIA labels requeridos
    REQUIRE_ARIA_LABELS: true
  },

  // Configuración de idiomas
  LANG: {
    DEFAULT: 'es-MX',
    SUPPORTED: ['es-MX', 'es', 'en'],
    FALLBACK: 'es'
  }
};

/**
 * Utilidades de configuración
 */
export const ConfigUtils = {
  /**
   * Verifica si estamos en modo debug
   */
  isDebug() {
    return CONFIG.DEBUG_MODE;
  },

  /**
   * Log condicional (solo en debug)
   */
  log(...args) {
    if (this.isDebug()) {
      console.log('[Mahitek]', ...args);
    }
  },

  /**
   * Warn condicional (solo en debug)
   */
  warn(...args) {
    if (this.isDebug()) {
      console.warn('[Mahitek]', ...args);
    }
  },

  /**
   * Error siempre se muestra
   */
  error(...args) {
    console.error('[Mahitek]', ...args);
  },

  /**
   * Obtiene la sección narrativa por ID
   */
  getNarrativeSection(sectionId) {
    return CONFIG.NARRATIVE.SECTIONS.find(s => s.id === sectionId);
  },

  /**
   * Obtiene todas las secciones en orden narrativo
   */
  getNarrativeSections() {
    return CONFIG.NARRATIVE.SECTIONS;
  },

  /**
   * Verifica si las animaciones están habilitadas
   */
  shouldAnimate() {
    if (!CONFIG.A11Y.RESPECT_PREFERS_REDUCED_MOTION) {
      return true;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !prefersReducedMotion;
  },

  /**
   * Obtiene duración de animación ajustada por preferencias del usuario
   */
  getAnimationDuration(duration = CONFIG.ANIMATIONS.DURATION_NORMAL) {
    return this.shouldAnimate() ? duration : 0;
  },

  /**
   * Formatea precio en pesos mexicanos
   */
  formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price);
  }
};

export default CONFIG;
