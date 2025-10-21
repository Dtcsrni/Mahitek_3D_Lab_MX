// ===== Configuration =====
const CONFIG = {
  PRICE_MARKUP: 1.30,  // 30% markup
  PRICE_STEP: 10,      // Round to nearest 10 MXN
  WHATSAPP_NUMBER: '52XXXXXXXXXX',
  DATA_PATHS: {
    productsBase: '/data/products_base.json',
    promos: '/data/promos.json',
    social: '/data/social.json',
    faq: '/data/faq.json'
  }
};

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
      <div class="card glass">
        <p>No se encontraron productos con los filtros seleccionados.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = displayedProducts.map(product => `
    <article class="card glass product-card">
      <img src="${product.imagen}" alt="${product.nombre}" />
      <h3 class="product-name">${product.nombre}</h3>
      <p class="product-price">$${product.precio_venta_mxn} MXN</p>
      <p class="product-price-note">💡 Precio base: $${product.precio_base_mxn} + 30%</p>
      <p class="product-historia">${product.historia}</p>
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
        <strong>Material:</strong> ${product.material_preferente}
      </p>
      ${product.coda ? `<p style="font-size: 0.875rem; font-style: italic; color: var(--text-secondary);">"${product.coda}"</p>` : ''}
      ${product.tags ? `
        <div class="product-tags">
          ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
      <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola, me interesa: ${encodeURIComponent(product.nombre)}" 
         class="btn btn-primary" 
         style="margin-top: 1rem; width: 100%;"
         target="_blank" 
         rel="noopener">
        Consultar disponibilidad
      </a>
    </article>
  `).join('');
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
      product.historia.toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
    
    return matchesCategory && matchesSearch;
  });

  renderProducts();
}

// ===== Promos =====
async function loadPromos() {
  const promos = await loadJSON(CONFIG.DATA_PATHS.promos);
  if (!promos || promos.length === 0) return;

  const container = document.getElementById('promos-container');
  if (!container) return;

  const now = new Date();
  const activePromos = promos.filter(promo => {
    const start = new Date(promo.desde);
    const end = new Date(promo.hasta);
    return now >= start && now <= end;
  });

  if (activePromos.length === 0) {
    container.innerHTML = `
      <div class="card glass">
        <p>No hay promociones activas en este momento. ¡Regresa pronto!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = activePromos.map(promo => `
    <article class="card glass promo-card">
      <h3>${promo.titulo}</h3>
      <p>${promo.mensaje}</p>
      <p class="promo-dates">📅 Válido del ${formatDate(promo.desde)} al ${formatDate(promo.hasta)}</p>
      <a href="${promo.cta_url}" class="btn btn-primary" target="_blank" rel="noopener">
        ${promo.cta_text}
      </a>
    </article>
  `).join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== FAQ =====
async function loadFAQ() {
  const faqData = await loadJSON(CONFIG.DATA_PATHS.faq);
  if (!faqData) return;

  const container = document.getElementById('faq-list');
  if (!container) return;

  container.innerHTML = faqData.map(item => `
    <details class="faq-item">
      <summary>${item.q}</summary>
      <p>${item.a}</p>
    </details>
  `).join('');
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

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  // Close menu when clicking on a link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
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
