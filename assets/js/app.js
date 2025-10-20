const STORAGE_KEYS = {
  context: 'mahitek_ctx_v1',
  experiments: 'mahitek_exp_bucket_v1'
};

const WHATSAPP_NUMBER = '52XXXXXXXXXX';
let activeExperiments = { assignments: {}, values: {}, enabled: false };
let visitorContext = {};
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function parseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error('JSON parse error', error);
    return fallback;
  }
}

function loadStored(key, fallback) {
  return parseJSON(localStorage.getItem(key), fallback);
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('No storage available', error);
  }
}

function buildContext() {
  const stored = loadStored(STORAGE_KEYS.context, {});
  const params = new URLSearchParams(window.location.search);
  const ctx = { ...stored };

  if (!ctx.utm) ctx.utm = {};

  if (params.has('src')) {
    ctx.src = params.get('src');
  }

  params.forEach((value, key) => {
    if (key.startsWith('utm_')) {
      ctx.utm[key] = value;
    }
  });

  if (!ctx.firstSeenAt) {
    ctx.firstSeenAt = new Date().toISOString();
  }

  saveStored(STORAGE_KEYS.context, ctx);
  return { ctx, params };
}

function setupNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.setAttribute('aria-expanded', String(!expanded));
  });
}

function initReveal() {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((node) => node.classList.add('on'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach((node) => io.observe(node));
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.json();
}

function parseWhatsAppMessage(url) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('text') || '';
  } catch (error) {
    return '';
  }
}

function readForceExperiments(params) {
  if (!params.has('force_exp')) return {};
  const raw = params.get('force_exp') || '';
  const pairs = raw.split(',').map((piece) => piece.trim()).filter(Boolean);
  return pairs.reduce((acc, pair) => {
    const [name, variant] = pair.split(':');
    if (name && variant) acc[name] = variant.toUpperCase();
    return acc;
  }, {});
}

async function setupExperiments(params) {
  const force = readForceExperiments(params);
  const expOff = params.get('exp') === 'off';
  try {
    const config = await loadJSON('/data/experiments.json');
    if (!config.enabled || expOff) {
      activeExperiments = { assignments: {}, values: {}, enabled: false };
      return activeExperiments;
    }

    const stored = loadStored(STORAGE_KEYS.experiments, {});
    const assignments = { ...stored };
    const values = {};

    Object.entries(config.tests || {}).forEach(([testName, testConfig]) => {
      let variant = force[testName];
      if (!variant) {
        if (testConfig.variant && testConfig.variant !== 'auto') {
          variant = String(testConfig.variant).toUpperCase();
        } else if (assignments[testName]) {
          variant = assignments[testName];
        } else {
          variant = Math.random() < 0.5 ? 'A' : 'B';
        }
      }
      assignments[testName] = variant;
      if (testConfig[variant] !== undefined) {
        values[testName] = testConfig[variant];
      }
      window.dataLayer.push({ event: 'exp_assign', test: testName, variant });
    });

    saveStored(STORAGE_KEYS.experiments, assignments);
    activeExperiments = { assignments, values, enabled: true };
    return activeExperiments;
  } catch (error) {
    console.warn('Experiments disabled', error);
    activeExperiments = { assignments: {}, values: {}, enabled: false };
    return activeExperiments;
  }
}

function recordImpression(test) {
  if (!activeExperiments.enabled) return;
  if (!activeExperiments.assignments[test]) return;
  const key = `${test}:${activeExperiments.assignments[test]}`;
  if (recordImpression.cache.has(key)) return;
  recordImpression.cache.add(key);
  window.dataLayer.push({
    event: 'exp_impression',
    test,
    variant: activeExperiments.assignments[test]
  });
}
recordImpression.cache = new Set();

function recordConversion(target) {
  if (!activeExperiments.enabled) return;
  Object.entries(activeExperiments.assignments).forEach(([test, variant]) => {
    window.dataLayer.push({ event: 'exp_conversion', test, variant, target });
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
}

function composeUtm(overrides = {}) {
  const contextUtm = visitorContext.utm || {};
  const base = {
    utm_source: contextUtm.utm_source || visitorContext.src || 'landing',
    utm_medium: contextUtm.utm_medium || (visitorContext.src ? 'qr' : 'site'),
    utm_campaign: contextUtm.utm_campaign || 'principal',
    utm_content: contextUtm.utm_content || 'landing'
  };
  return { ...base, ...overrides };
}

function buildWhatsAppMessage(intent, extra = {}) {
  if (extra.customMessage) return extra.customMessage;
  const utmCampaign = visitorContext.utm?.utm_campaign;
  const preferB2B = intent === 'b2b' || utmCampaign === 'b2b';
  const preferQR = intent === 'qr' || (!preferB2B && (visitorContext.src === 'qr' || ['sticker', 'lona', 'flyer'].includes(visitorContext.utm?.utm_source)));
  let message = 'Hola, me interesa una pieza.';
  if (preferB2B) {
    message = 'Hola, soy de una tienda o marca. Quiero una tirada corta.';
  } else if (preferQR) {
    message = 'Hola, vengo del QR. Quiero información del catálogo.';
  }
  if (extra.productName) {
    message += ` Referencia: ${extra.productName}.`;
  }
  return message;
}

function buildWhatsAppUrl(intent, extra = {}) {
  const url = new URL(`https://wa.me/${WHATSAPP_NUMBER}`);
  const overrides = {};
  if (intent === 'b2b' && !visitorContext.utm?.utm_campaign) {
    overrides.utm_campaign = 'b2b';
  }
  if (intent === 'qr' && !visitorContext.utm?.utm_medium) {
    overrides.utm_medium = 'qr';
  }
  if (extra.campaign) {
    overrides.utm_campaign = extra.campaign;
  }
  const utmParams = composeUtm(overrides);
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  if (visitorContext.src) {
    url.searchParams.set('src', visitorContext.src);
  }
  url.searchParams.set('text', buildWhatsAppMessage(intent, extra));
  return url.toString();
}

function decorateWhatsAppLinks() {
  document.querySelectorAll('[data-whatsapp-intent]').forEach((anchor) => {
    const intent = anchor.dataset.whatsappIntent || 'general';
    const productName = anchor.dataset.whatsappProductName;
    const customMessage = anchor.dataset.whatsappMessage;
    const campaign = anchor.dataset.whatsappCampaign;
    anchor.href = buildWhatsAppUrl(intent, { productName, customMessage, campaign });
  });
}

function setupCTAAnalytics() {
  document.addEventListener('click', (event) => {
    const node = event.target.closest('[data-track-cta]');
    if (!node) return;
    const id = node.dataset.trackCta;
    const target = node.dataset.action || node.getAttribute('href');
    window.dataLayer.push({ event: 'cta_click', id, target });
    if (node.dataset.whatsappIntent) {
      const overrides = {};
      if (node.dataset.whatsappCampaign) overrides.utm_campaign = node.dataset.whatsappCampaign;
      if (node.dataset.whatsappIntent === 'promo') overrides.utm_medium = 'promo';
      const params = { ...composeUtm(overrides), src: visitorContext.src || null };
      window.dataLayer.push({ event: 'whatsapp_click', params });
      recordConversion('whatsapp_click');
    }
  });
}

function updateHeroCopy() {
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  if (!heroTitle || !heroSubtitle) return;
  const test = activeExperiments.values.hero_copy;
  if (test && test.title && test.subtitle) {
    heroTitle.textContent = test.title;
    heroSubtitle.textContent = test.subtitle;
    recordImpression('hero_copy');
  }
}

function updateHeroCTA() {
  const actions = document.querySelectorAll('.hero-action');
  if (!actions.length) return;
  const variant = activeExperiments.values.cta_primary || 'catalogo';
  actions.forEach((anchor) => {
    const action = anchor.dataset.action;
    if (action === variant) {
      anchor.classList.remove('ghost');
    } else {
      anchor.classList.add('ghost');
    }
  });
  recordImpression('cta_primary');
}

function updateProductLayout() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const variant = activeExperiments.values.product_grid_layout;
  if (variant) {
    grid.dataset.layout = variant;
    recordImpression('product_grid_layout');
  }
}

function updateQRBannerCopy() {
  const message = document.getElementById('qr-banner-message');
  if (!message) return;
  const variant = activeExperiments.values.qr_banner_copy;
  if (variant) {
    message.textContent = variant;
  }
}

function shouldShowQRBanner() {
  if (visitorContext.src === 'qr') return true;
  const source = visitorContext.utm?.utm_source;
  return ['sticker', 'lona', 'flyer'].includes(source);
}

function showQRBanner() {
  const banner = document.getElementById('qr-banner');
  if (!banner || !shouldShowQRBanner()) return;
  banner.hidden = false;
  updateQRBannerCopy();
  recordImpression('qr_banner_copy');
  window.dataLayer.push({
    event: 'qr_entry',
    src: visitorContext.src || visitorContext.utm?.utm_source,
    utm: visitorContext.utm
  });
  const closeButton = banner.querySelector('.banner-close');
  const hide = () => {
    banner.hidden = true;
    closeButton?.removeEventListener('click', hide);
  };
  closeButton?.addEventListener('click', hide);
  setTimeout(hide, 8000);
}

function createSocialAnchor(name, url, placement) {
  const anchor = document.createElement('a');
  anchor.className = 'social-link';
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener';
  anchor.dataset.trackCta = `${placement}_${name}`;
  anchor.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  return anchor;
}

function decorateSocialLinks(containerId, social, placement) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.textContent = '';
  Object.entries(social).forEach(([name, url]) => {
    if (!url) return;
    const link = new URL(url);
    const base = composeUtm();
    const utm = { ...base, utm_medium: placement, utm_content: `${placement}_${name}` };
    Object.entries(utm).forEach(([key, value]) => link.searchParams.set(key, value));
    container.appendChild(createSocialAnchor(name, link.toString(), placement));
  });
}

function updateOrgSchema(social) {
  const script = document.getElementById('org-schema');
  if (!script) return;
  try {
    const schema = JSON.parse(script.textContent || '{}');
    schema.sameAs = Object.values(social).filter(Boolean);
    script.textContent = JSON.stringify(schema, null, 2);
  } catch (error) {
    console.warn('No se pudo actualizar schema', error);
  }
}

function productCard(product) {
  const card = document.createElement('article');
  card.className = 'card product-card reveal';
  card.dataset.productId = product.id;
  card.dataset.tags = (product.tags || []).join(' ').toLowerCase();
  const picture = document.createElement('img');
  picture.src = product.imagen;
  picture.loading = 'lazy';
  picture.alt = `Producto ${product.nombre}`;
  card.appendChild(picture);

  const title = document.createElement('h3');
  title.textContent = product.nombre;
  card.appendChild(title);

  const price = document.createElement('p');
  price.className = 'product-meta';
  price.textContent = formatCurrency(product.precio_mxn);
  card.appendChild(price);

  const material = document.createElement('p');
  material.className = 'product-meta';
  material.textContent = `Material: ${product.material}`;
  card.appendChild(material);

  const story = document.createElement('p');
  story.textContent = product.historia;
  card.appendChild(story);

  const coda = document.createElement('p');
  coda.className = 'product-meta';
  coda.textContent = `Coda: ${product.coda}`;
  card.appendChild(coda);

  if (Array.isArray(product.tags) && product.tags.length) {
    const tags = document.createElement('div');
    tags.className = 'product-tags';
    product.tags.forEach((tag) => {
      const chip = document.createElement('span');
      chip.textContent = `#${tag}`;
      tags.appendChild(chip);
    });
    card.appendChild(tags);
  }

  const action = document.createElement('a');
  action.className = 'btn ghost';
  action.dataset.whatsappIntent = 'product';
  action.dataset.whatsappProductName = product.nombre;
  action.dataset.trackCta = `product_${product.id}`;
  action.href = buildWhatsAppUrl('product', { productName: product.nombre });
  action.target = '_blank';
  action.rel = 'noopener';
  action.textContent = 'Solicitar pieza';
  card.appendChild(action);

  return card;
}

function observeProductViews(cards) {
  if (!('IntersectionObserver' in window)) return;
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.dataset.productId;
        if (!seen.has(id)) {
          seen.add(id);
          window.dataLayer.push({ event: 'product_view', id });
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  cards.forEach((card) => io.observe(card));
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  const filter = document.getElementById('category-filter');
  const search = document.getElementById('search-input');
  if (!grid || !filter || !search) return;

  grid.textContent = '';
  const activeProducts = products.filter((product) => product.estado === 'activo');

  const categories = Array.from(new Set(activeProducts.map((item) => item.categoria)));
  categories.sort();
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    filter.appendChild(option);
  });

  const cards = activeProducts.map((product) => {
    const card = productCard(product);
    grid.appendChild(card);
    return card;
  });

  observeProductViews(cards);
  window.dataLayer.push({ event: 'catalog_view', count: activeProducts.length });

  function applyFilters() {
    const categoryValue = filter.value;
    const searchValue = search.value.trim().toLowerCase();
    cards.forEach((card, index) => {
      const product = activeProducts[index];
      const matchesCategory = categoryValue === 'todas' || product.categoria === categoryValue;
      const matchesSearch = !searchValue || product.nombre.toLowerCase().includes(searchValue) || card.dataset.tags.includes(searchValue);
      card.hidden = !(matchesCategory && matchesSearch);
    });
  }

  filter.addEventListener('change', applyFilters);
  search.addEventListener('input', applyFilters);
}

function renderPromos(promos) {
  const slider = document.getElementById('promo-slider');
  const dots = document.getElementById('promo-dots');
  const drawerBody = document.getElementById('promo-drawer-body');
  if (!slider || !dots || !drawerBody) return;

  slider.textContent = '';
  dots.textContent = '';
  drawerBody.textContent = '';

  const slides = promos.map((promo, index) => {
    const slide = document.createElement('article');
    slide.className = 'promo-slide';
    slide.setAttribute('role', 'listitem');

    const title = document.createElement('h3');
    title.textContent = promo.titulo;
    slide.appendChild(title);

    const message = document.createElement('p');
    message.textContent = promo.mensaje;
    slide.appendChild(message);

    if (promo.desde && promo.hasta) {
      const windowText = document.createElement('p');
      windowText.className = 'product-meta';
      windowText.textContent = `Disponible del ${promo.desde} al ${promo.hasta}`;
      slide.appendChild(windowText);
    }

    const cta = document.createElement('a');
    cta.className = 'btn ghost';
    cta.dataset.whatsappIntent = 'promo';
    cta.dataset.trackCta = `promo_${promo.id}`;
    const message = parseWhatsAppMessage(promo.cta_url);
    if (message) cta.dataset.whatsappMessage = message;
    cta.dataset.whatsappCampaign = promo.id;
    cta.target = '_blank';
    cta.rel = 'noopener';
    cta.textContent = promo.cta_text;
    slide.appendChild(cta);

    slider.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'promo-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir a la promoción ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index));
    dots.appendChild(dot);

    const drawerItem = slide.cloneNode(true);
    drawerBody.appendChild(drawerItem);

    return slide;
  });

  if (!slides.length) return;

  let current = 0;
  function showSlide(position) {
    current = position;
    slides.forEach((slide, idx) => {
      slide.hidden = idx !== position;
    });
    dots.querySelectorAll('.promo-dot').forEach((dot, idx) => {
      dot.setAttribute('aria-selected', idx === position ? 'true' : 'false');
    });
  }

  showSlide(0);

  if (!prefersReducedMotion && slides.length > 1) {
    setInterval(() => {
      const next = (current + 1) % slides.length;
      showSlide(next);
    }, 6000);
  }

  decorateWhatsAppLinks();
}

function initPromoDrawer(promos) {
  const drawer = document.getElementById('promo-drawer');
  const closeElements = drawer?.querySelectorAll('[data-close-promo]');
  if (!drawer) return;

  const openDrawer = () => {
    drawer.setAttribute('aria-hidden', 'false');
  };

  const closeDrawer = () => {
    drawer.setAttribute('aria-hidden', 'true');
  };

  closeElements?.forEach((element) => element.addEventListener('click', closeDrawer));

  const params = new URLSearchParams(window.location.search);
  const promoId = params.get('promo');
  if (promoId && promos.some((promo) => promo.id === promoId)) {
    openDrawer();
  } else if (activeExperiments.values.promo_drawer_default && promos.length) {
    openDrawer();
    recordImpression('promo_drawer_default');
  }
}

function renderFAQ(faqItems) {
  const container = document.getElementById('faq-list');
  if (!container) return;
  container.textContent = '';
  faqItems.forEach((item, index) => {
    const details = document.createElement('details');
    if (index === 0) details.setAttribute('open', 'open');
    const summary = document.createElement('summary');
    summary.textContent = item.q;
    const answer = document.createElement('p');
    answer.textContent = item.a;
    details.appendChild(summary);
    details.appendChild(answer);
    container.appendChild(details);
  });
}

function injectProductSchema(products) {
  const body = document.body;
  products.forEach((product) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.nombre,
      description: product.historia,
      image: `${window.location.origin}${product.imagen}`,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'MXN',
        price: product.precio_mxn,
        availability: 'https://schema.org/InStock'
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    body.appendChild(script);
  });
}

async function bootstrap() {
  setupNav();
  initReveal();
  const { ctx, params } = buildContext();
  visitorContext = ctx;
  await setupExperiments(params);
  updateHeroCopy();
  updateHeroCTA();
  updateProductLayout();
  decorateWhatsAppLinks();
  setupCTAAnalytics();
  showQRBanner();

  try {
    const [social, products, promos, faq] = await Promise.all([
      loadJSON('/data/social.json'),
      loadJSON('/data/products.json'),
      loadJSON('/data/promos.json'),
      loadJSON('/data/faq.json')
    ]);

    decorateSocialLinks('community-links', social, 'comunidad');
    decorateSocialLinks('footer-social', social, 'footer');
    updateOrgSchema(social);

    renderProducts(products);
    decorateWhatsAppLinks();
    injectProductSchema(products);

    renderPromos(promos);
    decorateWhatsAppLinks();
    initPromoDrawer(promos);

    renderFAQ(faq);
  } catch (error) {
    console.error('Error al cargar datos', error);
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
