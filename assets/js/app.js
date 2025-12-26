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
import { initFAQ } from './modules/faq.js';
import { initUrlState } from './modules/url-state.js';
import { initHeroCounters } from './modules/hero-counters.js';
import { initScrollNarrative } from './modules/scroll-narrative.js';
import { initSVGAnimations } from './modules/svg-animations.js';
import { addHealthReport, flushHealthReports } from './modules/health-report.js';
import { runSystemChecks } from './modules/system-checks.js';
import { initOrganizationSchema } from './modules/schema.js';

ResizeManager.init();

async function initApp() {
  initLanguage();
  initViewport();
  setupAnalytics();
  initNav({ onEvent: logEvent });
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
  initHeroCounters();
  initScrollNarrative();
  initSVGAnimations();

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
