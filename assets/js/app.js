import CONFIG, { ConfigUtils } from './modules/config.js';
import ResizeManager from './modules/resize-manager.js';
import { initLanguage, TextosSistema } from './modules/i18n.js';
import { setupAnalytics, logEvent } from './modules/analytics.js';
import { initViewport } from './modules/viewport.js';
import { initNav } from './modules/nav.js';
import { initHeaderScroll } from './modules/header-scroll.js';
import { initScrollReveal } from './modules/scroll-reveal.js';
import { initButtonActions } from './modules/button-actions.js';
import { initEmailLinks } from './modules/email.js';
import { initNewsletter } from './modules/newsletter.js';
import { initCatalog, filterProducts, getProducts, calculateSalePrice } from './modules/catalog.js';
import { initLazySections } from './modules/lazy-load.js';
import { initPromoTicker } from './modules/promo-ticker.js';
import { initUrlState } from './modules/url-state.js';
import { addHealthReport, flushHealthReports } from './modules/health-report.js';
import { runSystemChecks } from './modules/system-checks.js';
import { initOrganizationSchema } from './modules/schema.js';
import { initTimelapseVideo } from './modules/timelapse-video.js';

ResizeManager.init();

const DEFERRED_STYLES = [
  'assets/css/styles.css?v=20260102',
  'assets/css/modules/animations.css?v=20251026'
];

const loadDeferredStyles = () => {
  if (typeof document === 'undefined') return;
  const head = document.head;
  DEFERRED_STYLES.forEach(href => {
    if (document.querySelector(`link[data-deferred-style="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-deferred-style', href);
    head.appendChild(link);
  });
};

const runWhenIdle = (cb, timeout = 1600) => {
  if (typeof window === 'undefined') {
    cb();
    return;
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => cb(), { timeout });
  } else {
    window.setTimeout(cb, timeout);
  }
};

const applyPerfHints = () => {
  if (typeof document === 'undefined') return;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData =
    typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData;

  if (prefersReducedMotion || saveData) {
    document.documentElement.classList.add('perf-lite');
  }
};

const loadSocialLinks = async () => {
  const { initSocialLinks } = await import('./modules/social.js');
  return initSocialLinks();
};

const loadPromos = async onEvent => {
  const { initPromos } = await import('./modules/promos.js');
  return initPromos({ onEvent });
};

const loadFAQ = async () => {
  const { initFAQ } = await import('./modules/faq.js');
  return initFAQ();
};

const initDeferredModules = async () => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData =
    typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData;
  const hasSvgTargets =
    typeof document !== 'undefined' && document.querySelector('[data-svg], .svg-3d');

  const { initHeroCounters } = await import('./modules/hero-counters.js');

  initHeroCounters();

  if (!prefersReducedMotion && !saveData) {
    const narrativeModule = await import('./modules/scroll-narrative.js');
    narrativeModule.initScrollNarrative();
    if (hasSvgTargets) {
      const svgModule = await import('./modules/svg-animations.js');
      svgModule.initSVGAnimations();
    }
  }
};

loadDeferredStyles();
applyPerfHints();

async function initApp() {
  initLanguage();
  initViewport();
  setupAnalytics();
  initNav({ onEvent: logEvent });
  initButtonActions();
  initTimelapseVideo();
  initPromoTicker();
  initHeaderScroll();
  initScrollReveal();
  initEmailLinks();
  initNewsletter();
  await initOrganizationSchema();

  await initCatalog({ onEvent: logEvent });

  initLazySections({
    onPromos: () => loadPromos(logEvent),
    onFaq: () => loadFAQ()
  });

  initUrlState();
  runWhenIdle(() => {
    initDeferredModules().catch(() => {
      /* no-op */
    });
    loadSocialLinks().catch(() => {
      /* no-op */
    });
  });

  document.documentElement.classList.add('js-modules-ready');
  addHealthReport('dom', runSystemChecks());

  if (CONFIG.DEBUG_MODE) {
    ConfigUtils.log(TextosSistema.obtener('debug.iniciado'));
    ConfigUtils.log(`${TextosSistema.obtener('debug.productosOK')}: ${getProducts().length}`);
    ConfigUtils.log(
      `Margen de precio: ${CONFIG.PRICE_MARKUP} (${(CONFIG.PRICE_MARKUP - 1) * 100}%)`
    );
    ConfigUtils.log(`Redondeo: $${CONFIG.PRICE_STEP} MXN`);
  }

  flushHealthReports();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.MahitekLab = {
  config: CONFIG,
  calculateSalePrice,
  products: () => getProducts(),
  filterProducts
};
