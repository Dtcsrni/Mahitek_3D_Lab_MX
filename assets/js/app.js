// ===== Configuration =====
const CONFIG = {
  PRICE_MARKUP: 1.0,   // Ajusta si requieres recargo adicional
  PRICE_STEP: 10,      // Redondea al múltiplo de 10 MXN más cercano
  WHATSAPP_NUMBER: '52XXXXXXXXXX',
  PLACEHOLDER_IMAGE: 'assets/img/placeholder-catalog.svg',
  DATA_PATHS: {
    productsBase: 'data/products_base.json',
    promos: 'data/promos.json',
    social: 'data/social.json',
    faq: 'data/faq.json'
  }
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollObserver = null;

// ===== Price Calculation =====
function calculateSalePrice(basePrice, markup = CONFIG.PRICE_MARKUP, step = CONFIG.PRICE_STEP) {
  const price = basePrice * markup;
  return Math.round(price / step) * step;
}

// ===== Data Loading =====
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return null;
  }
}

// ===== Motion Helpers =====
function setupHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const toggleState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  toggleState();
  window.addEventListener('scroll', toggleState, { passive: true });
}

function setupScrollReveal() {
  const animatedNodes = document.querySelectorAll('[data-animate]');
  if (!animatedNodes.length) return;

  if (prefersReducedMotion.matches) {
    animatedNodes.forEach(node => node.classList.add('is-visible'));
    return;
  }

  scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  animatedNodes.forEach(node => scrollObserver.observe(node));
}

function registerAnimatedElements(root) {
  if (!root || !(root instanceof Element)) return;

  if (prefersReducedMotion.matches) {
    if (root.matches('[data-animate]')) {
      root.classList.add('is-visible');
    }
    root.querySelectorAll('[data-animate]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  if (!scrollObserver) return;

  const candidates = [];

  if (root.matches('[data-animate]') && !root.classList.contains('is-visible')) {
    candidates.push(root);
  }

  root.querySelectorAll('[data-animate]').forEach(el => {
    if (!el.classList.contains('is-visible')) {
      candidates.push(el);
    }
  });

  candidates.forEach(el => scrollObserver.observe(el));
}

// ===== Products =====
let allProducts = [];
let displayedProducts = [];

async function loadProducts() {
  const productsBase = await loadJSON(CONFIG.DATA_PATHS.productsBase);
  if (!productsBase) return;

  // Calculate sale prices
  allProducts = productsBase
    .filter(p => p.estado === 'activo')
    .map(product => ({
      ...product,
      precio_venta_mxn: calculateSalePrice(product.precio_base_mxn)
    }));

  displayedProducts = [...allProducts];
  renderProducts();
  populateCategoryFilter();
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  if (displayedProducts.length === 0) {
    grid.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-catalog.svg" alt="Sin coincidencias en el catálogo" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>No se encontraron productos con los filtros seleccionados. Ajusta los filtros o cuéntanos qué estás buscando.</p>
      </div>
    `;
    registerAnimatedElements(grid);
    return;
  }

  grid.innerHTML = displayedProducts.map((product, index) => {
    const delay = Math.min(index, 5) * 80;
    const imageSrc = (product.imagen || '').replace(/^\//, '') || CONFIG.PLACEHOLDER_IMAGE;
    const details = [
      { label: 'Material', value: product.material || product.material_preferente },
      { label: 'Tamano', value: product.tamano },
      { label: 'Colores', value: product.colores },
      { label: 'Herraje', value: product.herraje },
      { label: 'Personalizacion', value: product.personalizacion },
      { label: 'Montaje', value: product.montaje },
      { label: 'Angulo', value: product.angulo },
      { label: 'Carga', value: product.carga },
      { label: 'Fijacion', value: product.fijacion },
      { label: 'Entrega', value: product.tiempo_entrega }
    ].filter(item => item.value);

    const detailMarkup = details.length
      ? `
        <dl class="product-details">
          ${details.map(detail => `
            <div>
              <dt>${detail.label}</dt>
              <dd>${detail.value}</dd>
            </div>
          `).join('')}
        </dl>
      `
      : '';

    const tagsMarkup = product.tags && product.tags.length
      ? `
        <div class="product-tags">
          ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      `
      : '';

    return `
    <article class="card glass product-card" role="listitem" data-animate="fade-up" style="--animate-delay: ${delay}ms;">
      <div class="product-media">
        <img src="${imageSrc}" alt="${product.nombre}" onerror="this.onerror=null;this.src='${CONFIG.PLACEHOLDER_IMAGE}';" />
      </div>
      <div class="product-meta">
        <span class="product-sku">SKU: ${product.sku}</span>
        ${product.linea ? `<span class="product-line">${product.linea}</span>` : ''}
      </div>
      <h3 class="product-name">${product.nombre}</h3>
      <p class="product-price">$${product.precio_venta_mxn} MXN</p>
      <p class="product-price-note">Precio publico por pieza. Personalizacion basica incluida donde aplica.</p>
      <p class="product-description">${product.descripcion || ''}</p>
      ${detailMarkup}
      ${tagsMarkup}
      <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola, me interesa: ${encodeURIComponent(product.nombre)}" 
         class="btn btn-primary product-cta" 
         target="_blank" 
         rel="noopener">
        Consultar disponibilidad
      </a>
    </article>
  `;
  }).join('');

  registerAnimatedElements(grid);
}

function populateCategoryFilter() {
  const select = document.getElementById('category-filter');
  if (!select) return;

  const categories = [...new Set(allProducts.map(p => p.categoria))];
  
  select.innerHTML = '<option value="todas">Todas</option>' + 
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function filterProducts() {
  const categoryFilter = document.getElementById('category-filter')?.value || 'todas';
  const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';

  displayedProducts = allProducts.filter(product => {
    const matchesCategory = categoryFilter === 'todas' || product.categoria === categoryFilter;
    const matchesSearch = !searchTerm || 
      product.nombre.toLowerCase().includes(searchTerm) ||
  (product.descripcion || '').toLowerCase().includes(searchTerm) ||
  (product.sku || '').toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
    
    return matchesCategory && matchesSearch;
  });

  renderProducts();
}

// ===== Promos =====
async function loadPromos() {
  const promos = await loadJSON(CONFIG.DATA_PATHS.promos);
  const container = document.getElementById('promos-container');
  if (!container) return;

  if (!promos || promos.length === 0) {
    container.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-promos.svg" alt="Promociones en preparación" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>Estamos preparando nuevas promociones. Escríbenos y recibe un adelanto personalizado.</p>
      </div>
    `;
    registerAnimatedElements(container);
    return;
  }

  const now = new Date();
  const activePromos = promos.filter(promo => {
    const start = new Date(promo.desde);
    const end = new Date(promo.hasta);
    return now >= start && now <= end;
  });

  if (activePromos.length === 0) {
    container.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-promos.svg" alt="Promociones en preparación" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>No hay promociones activas en este momento. ¡Escríbenos y te contamos qué estamos creando!</p>
      </div>
    `;
    registerAnimatedElements(container);
    return;
  }

  container.innerHTML = activePromos.map((promo, index) => {
    const delay = Math.min(index, 4) * 90;
    return `
    <article class="card glass promo-card" data-animate="fade-up" style="--animate-delay: ${delay}ms;">
      <h3>${promo.titulo}</h3>
      <p>${promo.mensaje}</p>
      <p class="promo-dates">📅 Válido del ${formatDate(promo.desde)} al ${formatDate(promo.hasta)}</p>
      <a href="${promo.cta_url}" class="btn btn-primary" target="_blank" rel="noopener">
        ${promo.cta_text}
      </a>
    </article>
  `;
  }).join('');

  registerAnimatedElements(container);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== FAQ =====
async function loadFAQ() {
  const faqData = await loadJSON(CONFIG.DATA_PATHS.faq);
  const container = document.getElementById('faq-list');
  if (!container) return;

  if (!faqData || faqData.length === 0) {
    container.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-faq.svg" alt="Preguntas frecuentes en preparación" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>Aún estamos documentando las preguntas frecuentes. Escríbenos por WhatsApp y resolvemos tu caso.</p>
      </div>
    `;
    registerAnimatedElements(container);
    return;
  }

  container.innerHTML = faqData.map((item, index) => {
    const delay = Math.min(index, 5) * 70;
    return `
    <details class="faq-item" data-animate="fade-up" style="--animate-delay: ${delay}ms;">
      <summary>${item.q}</summary>
      <p>${item.a}</p>
    </details>
  `;
  }).join('');

  registerAnimatedElements(container);
}

// ===== Social Links =====
async function loadSocialLinks() {
  const social = await loadJSON(CONFIG.DATA_PATHS.social);
  if (!social) return;

  const container = document.getElementById('social-links');
  if (!container) return;

  const links = [];
  if (social.instagram) links.push({ name: '📷 Instagram', url: social.instagram });
  if (social.facebook) links.push({ name: '👍 Facebook', url: social.facebook });
  if (social.tiktok) links.push({ name: '🎵 TikTok', url: social.tiktok });

  container.innerHTML = links.map(link => `
    <a href="${link.url}" target="_blank" rel="noopener">${link.name}</a>
  `).join('');
}

// ===== Navigation Toggle =====
function setupNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  
  if (!toggle || !menu) return;

  const initialState = menu.classList.contains('active');
  toggle.setAttribute('aria-expanded', String(initialState));
  toggle.setAttribute('aria-label', initialState ? 'Cerrar menú' : 'Abrir menú');

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  // Close menu when clicking on a link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

// ===== Filter Events =====
function setupFilters() {
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }
}

// ===== Initialization =====
async function init() {
  setupNav();
  setupFilters();
  setupHeaderScroll();
  setupScrollReveal();
  
  // Load all data
  await Promise.all([
    loadProducts(),
    loadPromos(),
    loadFAQ(),
    loadSocialLinks()
  ]);

  console.log('✅ Mahitek 3D Lab loaded successfully');
  console.log(`📊 Products loaded: ${allProducts.length}`);
  console.log(`💰 Price markup: ${CONFIG.PRICE_MARKUP} (${(CONFIG.PRICE_MARKUP - 1) * 100}%)`);
  console.log(`🔄 Rounding step: $${CONFIG.PRICE_STEP} MXN`);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
window.MahitekLab = {
  config: CONFIG,
  calculateSalePrice,
  products: () => allProducts,
  filterProducts
};
