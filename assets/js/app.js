import CONFIG, { ConfigUtils } from './modules/config.js';
import ResizeManager from './modules/resize-manager.js';
import { initLanguage, TextosSistema } from './modules/i18n.js';
import { setupAnalytics, logEvent } from './modules/analytics.js';
import { initViewport } from './modules/viewport.js';
import { initNav } from './modules/nav.js';
import { initHeaderScroll } from './modules/header-scroll.js';
import { initScrollReveal } from './modules/scroll-reveal.js';
import { initEmailLinks } from './modules/email.js';
import { initNewsletter } from './modules/newsletter.js';
import { initSocialLinks } from './modules/social.js';
import { initCatalog, filterProducts, getProducts, calculateSalePrice } from './modules/catalog.js';
import { initLazySections } from './modules/lazy-load.js';
import { initPromos } from './modules/promos.js';
import { initPromoTicker } from './modules/promo-ticker.js';
import { initFAQ } from './modules/faq.js';
import { initUrlState } from './modules/url-state.js';
import { addHealthReport, flushHealthReports } from './modules/health-report.js';
import { runSystemChecks } from './modules/system-checks.js';
import { initOrganizationSchema } from './modules/schema.js';

ResizeManager.init();

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

const initDeferredModules = async () => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData =
    typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData;

  const { initHeroCounters } = await import('./modules/hero-counters.js');

  initHeroCounters();

  if (!prefersReducedMotion && !saveData) {
    const [narrativeModule, svgModule] = await Promise.all([
      import('./modules/scroll-narrative.js'),
      import('./modules/svg-animations.js')
    ]);
    narrativeModule.initScrollNarrative();
    svgModule.initSVGAnimations();
  }
};

async function initApp() {
  initLanguage();
  initViewport();
  setupAnalytics();
  initNav({ onEvent: logEvent });
  initPromoTicker();
  initHeaderScroll();
  initScrollReveal();
  initEmailLinks();
  initNewsletter();
  await initOrganizationSchema();

  await Promise.all([initCatalog({ onEvent: logEvent }), initSocialLinks()]);

  initLazySections({
    onPromos: () => initPromos({ onEvent: logEvent }),
    onFaq: () => initFAQ()
  });

  initUrlState();
  runWhenIdle(() => {
    initDeferredModules().catch(() => {
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
