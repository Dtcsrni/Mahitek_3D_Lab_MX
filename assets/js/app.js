// ===== Configuration =====
const CONFIG = {
  PRICE_MARKUP: 1.0,   // Ajusta si requieres recargo adicional
  PRICE_STEP: 10,      // Redondea al múltiplo de 10 MXN más cercano
  // Página de Facebook/Messenger
  MESSENGER_PAGE: 'mahitek3dlabmx',
  PLACEHOLDER_IMAGE: 'assets/img/placeholder-catalog.svg',
  DATA_PATHS: {
    brand: 'assets/data/brand.json',
    productsBase: 'data/products.json',
    promos: 'data/promos.json',
    social: 'data/social.json',
    faq: 'data/faq.json'
  }
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollObserver = null;

// ===== Analytics =====
function log(ev, params = {}) {
  try { gtag('event', ev, params); } catch (e) { /* no-op */ }
}

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

  // Filter active products (no price calculation needed, prices are final)
  allProducts = productsBase
    .filter(p => p.estado === 'activo');

  displayedProducts = [...allProducts];
  renderProducts();
  populateCategoryFilter();
}

function renderProducts() {
  const carousel = document.getElementById('product-carousel');
  if (!carousel) return;

  if (displayedProducts.length === 0) {
    carousel.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-catalog.svg" alt="Sin coincidencias en el catálogo" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>No se encontraron productos con los filtros seleccionados. Ajusta los filtros o cuéntanos qué estás buscando.</p>
      </div>
    `;
    registerAnimatedElements(carousel);
    initCarousel();
    return;
  }

  carousel.innerHTML = displayedProducts.map((product, index) => {
    const delay = Math.min(index, 5) * 80;
    
    // Usar emoji como imagen animada
    const emojiDisplay = product.imagen && !product.imagen.startsWith('/') && !product.imagen.includes('.') 
      ? `<div class="product-emoji">${product.imagen}</div>`
      : `<img src="${product.imagen}" alt="${product.nombre}" onerror="this.onerror=null;this.src='${CONFIG.PLACEHOLDER_IMAGE}';" />`;

    // Construir detalles del producto
    const detailsData = [
      { label: 'Material', value: product.material },
      { label: 'Incluye', value: product.incluye },
      { label: 'Variantes', value: product.variantes }
    ].filter(item => item.value);

    const detailMarkup = detailsData.length
      ? `
        <dl class="product-details">
          ${detailsData.map(detail => `
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

    // Sugerencias de negocio
    const sugerenciasMarkup = product.sugerencias
      ? `<p class="product-suggestions">💡 <strong>Sugerencias:</strong> ${product.sugerencias}</p>`
      : '';

    // Analytics: vista de item al render
    log('view_item', {
      item_id: product.id,
      item_name: product.nombre,
      price: product.precio_mxn,
      item_category: product.categoria
    });

    return `
    <article class="card glass product-card" role="listitem" data-animate="fade-up" style="--animate-delay: ${delay}ms;">
      <div class="product-media">
        ${emojiDisplay}
      </div>
      <div class="product-meta">
        <span class="product-sku">${product.id}</span>
        ${product.categoria ? `<span class="product-line">${product.categoria}</span>` : ''}
      </div>
  <h3 class="product-name">${product.nombre}</h3>
  <p class="product-price">${product.precio_rango_mxn ? `$${product.precio_rango_mxn} MXN` : `$${product.precio_mxn} MXN`}</p>
  <p class="product-price-note">Rango por personalización, tamaño/grosor, acabados, herrajes/adhesivos, urgencia y tirada.</p>
      <p class="product-description">${product.descripcion || ''}</p>
      ${detailMarkup}
      ${tagsMarkup}
      ${sugerenciasMarkup}
      <a href="${buildMessengerURL(`product:${encodeURIComponent(product.id || '')}|${encodeURIComponent(product.nombre)}`)}" 
         class="btn btn-primary product-cta" 
         target="_blank" 
         rel="noopener" 
         data-sku="${product.id}" 
         data-name="${product.nombre}">
        Consultar disponibilidad en Messenger
      </a>
    </article>
  `;
  }).join('');

  registerAnimatedElements(carousel);
  initCatalogCarousel(displayedProducts.length);

  // Log de interacción: add_to_cart en CTA
  carousel.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.product-cta');
    if (!btn) return;
    log('add_to_cart', {
      item_id: btn.getAttribute('data-sku') || '',
      item_name: btn.getAttribute('data-name') || ''
    });
  }, { once: true });
}

// ===== Carrusel de Catálogo =====
function initCatalogCarousel(totalProducts) {
  const track = document.getElementById('product-carousel');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsContainer = document.getElementById('catalog-dots');
  
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;
  
  let currentIndex = 0;
  let itemsPerView = 1;
  
  // Calcular items por vista según viewport
  function updateItemsPerView() {
    if (window.innerWidth >= 1024) {
      itemsPerView = 3;
    } else if (window.innerWidth >= 768) {
      itemsPerView = 2;
    } else {
      itemsPerView = 1;
    }
  }
  
  // Calcular total de páginas
  function getTotalPages() {
    return Math.ceil(totalProducts / itemsPerView);
  }
  
  // Actualizar posición del track
  function updateTrack() {
    const offset = -currentIndex * (100 / itemsPerView);
    track.style.transform = `translateX(${offset}%)`;
    updateButtons();
    updateDots();
  }
  
  // Actualizar estado de botones
  function updateButtons() {
    const totalPages = getTotalPages();
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalPages - 1;
  }
  
  // Crear y actualizar dots
  function createDots() {
    const totalPages = getTotalPages();
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Ir a página ${i + 1}`);
      if (i === currentIndex) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateTrack();
        log('catalog_carousel_navigation', { method: 'dot', index: currentIndex });
      });
      
      dotsContainer.appendChild(dot);
    }
  }
  
  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }
  
  // Event listeners para botones
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateTrack();
      log('catalog_carousel_navigation', { method: 'button', direction: 'prev', index: currentIndex });
    }
  });
  
  nextBtn.addEventListener('click', () => {
    const totalPages = getTotalPages();
    if (currentIndex < totalPages - 1) {
      currentIndex++;
      updateTrack();
      log('catalog_carousel_navigation', { method: 'button', direction: 'next', index: currentIndex });
    }
  });
  
  // Soporte táctil para swipe
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next
        nextBtn.click();
      } else {
        // Swipe right - prev
        prevBtn.click();
      }
      log('catalog_carousel_navigation', { method: 'swipe', direction: diff > 0 ? 'next' : 'prev' });
    }
  }
  
  // Actualizar en resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const oldItemsPerView = itemsPerView;
      updateItemsPerView();
      
      if (oldItemsPerView !== itemsPerView) {
        currentIndex = 0;
        createDots();
        updateTrack();
      }
    }, 250);
  });
  
  // Inicializar
  updateItemsPerView();
  createDots();
  updateTrack();
  log('catalog_carousel_init', { items: totalProducts, itemsPerView });
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
  (product.id || '').toLowerCase().includes(searchTerm) ||
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
    if (promo.estado && promo.estado === 'inactivo') return false;
    if (!promo.desde || !promo.hasta) return promo.estado === 'activo';
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
    const delay = Math.min(index, 5) * 70;
    const destacadoClass = promo.destacado ? 'promo-destacado' : '';
    const animClass = promo.animacion ? `promo-anim-${promo.animacion}` : '';
    const accentColor = promo.color_acento || '#6366F1';
    
    // Construir precio visual
    let precioHTML = '';
    if (promo.precio_regular) {
      const unitario = promo.precio_unitario 
        ? `<span class="promo-unitario">$${promo.precio_unitario.toFixed(2)} c/u</span>` 
        : '';
      precioHTML = `
        <div class="promo-precio">
          <span class="promo-precio-total">$${promo.precio_regular}</span>
          ${unitario}
        </div>
      `;
    } else if (promo.precio_especial) {
      precioHTML = `
        <div class="promo-precio">
          <span class="promo-precio-especial">$${promo.precio_especial}</span>
        </div>
      `;
    } else if (promo.monto_minimo) {
      precioHTML = `
        <div class="promo-minimo">
          <span>Mínimo: $${promo.monto_minimo}</span>
        </div>
      `;
    }

    // Badge
    const badgeHTML = promo.badge 
      ? `<span class="promo-badge" style="--badge-color: ${accentColor}">${promo.badge}</span>` 
      : '';

    // Beneficios
    const beneficiosHTML = promo.beneficios && promo.beneficios.length > 0
      ? `
        <ul class="promo-beneficios">
          ${promo.beneficios.map(b => `<li>✓ ${b}</li>`).join('')}
        </ul>
      `
      : '';

    // Fechas o permanente
    let validezHTML = '';
    if (promo.tipo === 'permanente') {
      validezHTML = '<p class="promo-validez">⏰ Promoción permanente</p>';
    } else if (promo.desde && promo.hasta) {
      validezHTML = `<p class="promo-validez">📅 Válido ${formatDate(promo.desde)} – ${formatDate(promo.hasta)}</p>`;
    }

    // CTA
    const ctaHTML = promo.cta_url 
      ? `
        <a href="${promo.cta_url}" 
           class="btn btn-primary promo-cta" 
           target="_blank" 
           rel="noopener" 
           data-promo-id="${promo.id}" 
           data-promo-name="${promo.titulo}"
           style="--btn-accent: ${accentColor}">
          ${promo.cta_text || 'Más info'}
        </a>
      `
      : `
        <button class="btn btn-primary promo-cta-contact" 
                data-promo-id="${promo.id}" 
                data-promo-name="${promo.titulo}"
                style="--btn-accent: ${accentColor}">
          Consultar por WhatsApp
        </button>
      `;

    return `
    <article class="card glass promo-card ${destacadoClass} ${animClass}" 
             data-animate="fade-up" 
             data-promo-tipo="${promo.tipo}"
             style="--animate-delay: ${delay}ms; --promo-accent: ${accentColor};">
      <div class="promo-header">
        <span class="promo-icono" aria-hidden="true">${promo.icono || '🎁'}</span>
        ${badgeHTML}
      </div>
      <h3 class="promo-titulo">${promo.titulo}</h3>
      <p class="promo-subtitulo">${promo.subtitulo || promo.descripcion || ''}</p>
      ${precioHTML}
      ${beneficiosHTML}
      ${validezHTML}
      ${ctaHTML}
    </article>
  `;
  }).join('');

  registerAnimatedElements(container);
  
  // Inicializar carrusel
  initPromosCarousel(activePromos.length);

  // Analytics para CTAs externas
  container.addEventListener('click', (ev) => {
    const a = ev.target.closest('.promo-cta');
    if (!a) return;
    log('select_promotion', {
      promotion_id: a.getAttribute('data-promo-id') || '',
      promotion_name: a.getAttribute('data-promo-name') || ''
    });
  });

  // CTAs de contacto interno
  container.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.promo-cta-contact');
    if (!btn) return;
    const promoName = btn.getAttribute('data-promo-name') || 'Promoción';
    const message = encodeURIComponent(`Hola, quiero consultar sobre: ${promoName}`);
    window.open(`https://wa.me/52XXXXXXXXXX?text=${message}`, '_blank', 'noopener');
    log('contact_promo', {
      promotion_id: btn.getAttribute('data-promo-id') || '',
      promotion_name: promoName
    });
  });
}

// ===== Carrusel de Promos =====
function initPromosCarousel(totalPromos) {
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsContainer = document.getElementById('promos-dots');
  
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;
  
  let currentIndex = 0;
  let itemsPerView = 1;
  
  // Calcular items por vista según viewport
  function updateItemsPerView() {
    if (window.innerWidth >= 1024) {
      itemsPerView = 3;
    } else if (window.innerWidth >= 768) {
      itemsPerView = 2;
    } else {
      itemsPerView = 1;
    }
  }
  
  // Calcular total de páginas
  function getTotalPages() {
    return Math.ceil(totalPromos / itemsPerView);
  }
  
  // Actualizar posición del track
  function updateTrack() {
    const offset = -currentIndex * (100 / itemsPerView);
    track.style.transform = `translateX(${offset}%)`;
    updateButtons();
    updateDots();
  }
  
  // Actualizar estado de botones
  function updateButtons() {
    const totalPages = getTotalPages();
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalPages - 1;
  }
  
  // Crear y actualizar dots
  function createDots() {
    const totalPages = getTotalPages();
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Ir a página ${i + 1}`);
      if (i === currentIndex) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateTrack();
      });
      
      dotsContainer.appendChild(dot);
    }
  }
  
  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }
  
  // Event listeners para botones
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateTrack();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    const totalPages = getTotalPages();
    if (currentIndex < totalPages - 1) {
      currentIndex++;
      updateTrack();
    }
  });
  
  // Soporte táctil para swipe
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next
        nextBtn.click();
      } else {
        // Swipe right - prev
        prevBtn.click();
      }
    }
  }
  
  // Actualizar en resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const oldItemsPerView = itemsPerView;
      updateItemsPerView();
      
      if (oldItemsPerView !== itemsPerView) {
        currentIndex = 0;
        createDots();
        updateTrack();
      }
    }, 250);
  });
  
  // Inicializar
  updateItemsPerView();
  createDots();
  updateTrack();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Build Messenger URL with optional ref
function buildMessengerURL(ref) {
  const base = `https://m.me/${CONFIG.MESSENGER_PAGE}`;
  if (!ref) return base;
  return `${base}?ref=${encodeURIComponent(ref)}`;
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
        <p>Aún estamos documentando las preguntas frecuentes. Escríbenos por Messenger y resolvemos tu caso.</p>
      </div>
    `;
    registerAnimatedElements(container);
    return;
  }

  // Render de items con IDs linkeables
  container.innerHTML = faqData.map((item, index) => {
    const delay = Math.min(index, 5) * 70;
    const id = `faq-${slugify(item.q)}`;
    return `
    <details class="faq-item" id="${id}" data-animate="fade-up" style="--animate-delay: ${delay}ms;">
      <summary><span>${item.q}</span></summary>
      <p>${item.a}</p>
    </details>
  `;
  }).join('');

  registerAnimatedElements(container);

  // Render de destacadas como chips
  const top = document.getElementById('faq-top');
  if (top) {
    const featured = faqData.filter(i => i.destacada);
    if (featured.length > 0) {
      top.innerHTML = featured.map(it => {
        const id = `faq-${slugify(it.q)}`;
        return `<a class="faq-chip" href="#${id}" data-faq-target="#${id}" aria-label="Ir a: ${it.q}">⭐ ${it.q}</a>`;
      }).join('');

      top.addEventListener('click', (e) => {
        const a = e.target.closest('a.faq-chip');
        if (!a) return;
        const sel = a.getAttribute('data-faq-target');
        if (!sel) return;
        const target = document.querySelector(sel);
        if (target && target.classList.contains('faq-item')) {
          target.open = true;
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        e.preventDefault();
      });
    }
  }

  // Interacciones: búsqueda y expandir/contraer
  const search = document.getElementById('faq-search');
  const categorySelect = document.getElementById('faq-category');
  const btnExpand = document.getElementById('faq-expand');
  const btnCollapse = document.getElementById('faq-collapse');
  const countEl = document.getElementById('faq-count');
  const items = Array.from(container.querySelectorAll('.faq-item'));

  // Poblar categorías desde data
  if (categorySelect) {
    const categories = Array.from(new Set(faqData.map(i => i.categoria).filter(Boolean))).sort();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categorySelect.appendChild(opt);
    });
  }

  function applyFilter(query) {
    const q = (query || '').trim().toLowerCase();
    const cat = (categorySelect && categorySelect.value) ? categorySelect.value : '';
    let visible = 0;
    items.forEach(el => {
      const text = el.textContent.toLowerCase();
      const matchText = q.length === 0 || text.includes(q);
      const matchCat = !cat || (text.includes(cat) || (el.querySelector('summary span')?.textContent.toLowerCase().includes(cat)));
      const match = matchText && matchCat;
      el.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    if (countEl) {
      const total = items.length;
      countEl.textContent = `Mostrando ${visible} de ${total} preguntas`;
    }
  }

  if (search) {
    search.addEventListener('input', (e) => applyFilter(e.target.value));
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', () => applyFilter(search ? search.value : ''));
  }
  if (btnExpand) {
    btnExpand.addEventListener('click', () => items.forEach(el => el.open = true));
  }
  if (btnCollapse) {
    btnCollapse.addEventListener('click', () => items.forEach(el => el.open = false));
  }

  // Inicializa contador con el total al cargar
  if (countEl) {
    countEl.textContent = `Mostrando ${items.length} de ${items.length} preguntas`;
  }

  // Abre item si URL tiene hash a su ID
  if (location.hash && location.hash.startsWith('#faq-')) {
    const targeted = document.querySelector(location.hash);
    if (targeted && targeted.classList.contains('faq-item')) {
      targeted.open = true;
      targeted.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Inyectar JSON-LD de FAQPage (SEO)
  try {
    injectFAQSchema(faqData);
  } catch (e) {
    console.warn('FAQ schema injection skipped:', e);
  }
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function injectFAQSchema(items) {
  if (!Array.isArray(items) || items.length === 0) return;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(it => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a
      }
    }))
  };
  const json = JSON.stringify(schema);
  let script = document.getElementById('faq-schema');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema';
    document.head.appendChild(script);
  }
  script.textContent = json;
}

// ===== Social Links =====
async function loadSocialLinks() {
  // Preferimos brand.json si existe
  let social = null;
  const brand = await loadJSON(CONFIG.DATA_PATHS.brand);
  if (brand && brand.social) {
    social = brand.social;
  } else {
    social = await loadJSON(CONFIG.DATA_PATHS.social);
  }
  if (!social) return;

  const container = document.getElementById('social-links');
  if (!container) return;

  // Build icon-only, accessible links with larger clickable area
  const links = [];
  if (social.instagram) links.push({ key: 'instagram', label: 'Instagram', url: social.instagram });
  if (social.facebook) links.push({ key: 'facebook', label: 'Facebook', url: social.facebook });
  if (social.tiktok) links.push({ key: 'tiktok', label: 'TikTok', url: social.tiktok });

  container.innerHTML = links.map(link => `
    <a class="social-icon social-icon--${link.key}" href="${link.url}" target="_blank" rel="noopener" aria-label="${link.label}" title="${link.label}">
      ${getSocialIconMarkup(link.key)}
      <span class="sr-only">${link.label}</span>
    </a>
  `).join('');
}

// Oficial logos via Simple Icons CDN (CC0) — single-color SVGs
function getSocialIconMarkup(platform) {
  const color = 'FFFFFF'; // white glyph for contrast on multicolor backgrounds
  const size = 28;
  const base = 'https://cdn.simpleicons.org';
  const map = {
    instagram: `${base}/instagram/${color}`,
    facebook: `${base}/facebook/${color}`,
    tiktok: `${base}/tiktok/${color}`
  };
  const src = map[platform] || `${base}/link/${color}`;
  return `<img src="${src}" width="${size}" height="${size}" alt="" loading="lazy" decoding="async" aria-hidden="true" />`;
}

// ===== Navigation Toggle =====
function setupNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const header = document.querySelector('.header');
  
  if (!toggle || !menu) return;

  const initialState = menu.classList.contains('active');
  toggle.setAttribute('aria-expanded', String(initialState));
  toggle.setAttribute('aria-label', initialState ? 'Cerrar menú' : 'Abrir menú');

  const closeMenu = () => {
    menu.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  };

  const openMenu = () => {
    menu.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('active');
    
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
    
    // Log menu interaction
    log('nav_menu_toggle', { state: isOpen ? 'closed' : 'open' });
  });

  // Close menu when clicking on a link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
      log('nav_link_click', { href: link.getAttribute('href') });
    });
  });

  // Close menu when clicking outside (on overlay area)
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('active') && 
        !menu.contains(e.target) && 
        !toggle.contains(e.target)) {
      closeMenu();
      log('nav_menu_close', { method: 'outside_click' });
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      closeMenu();
      toggle.focus();
      log('nav_menu_close', { method: 'escape_key' });
    }
  });

  // Smooth scroll behavior for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
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
  hydrateEmails();
  
  // Load all data
  await Promise.all([
    loadProducts(),
    loadPromos(),
    loadFAQ(),
    loadSocialLinks()
  ]);

  // Aplicar estado desde la URL y sincronizar cambios
  applyURLState();

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

// ===== Email Obfuscation =====
function hydrateEmails() {
  const links = document.querySelectorAll('.email-link[data-email-user][data-email-domain]');
  links.forEach(link => {
    const user = link.getAttribute('data-email-user');
    const domain = link.getAttribute('data-email-domain');
    if (!user || !domain) return;
    const email = `${user}@${domain}`;
    link.setAttribute('href', `mailto:${email}`);
    // If a custom label provided, keep text; else fill with email
    const label = link.getAttribute('data-email-label');
    if (!link.textContent.trim() || label) {
      link.textContent = label || email;
    }
    // Reduce scraping signals
    link.setAttribute('rel', `${link.getAttribute('rel') || ''} nofollow noopener`);
  });
}

// Export for debugging
window.MahitekLab = {
  config: CONFIG,
  calculateSalePrice,
  products: () => allProducts,
  filterProducts
};

// ===== URL State (opcional) =====
function applyURLState() {
  const sp = new URLSearchParams(location.search);
  const mat = sp.get('m');
  const q = sp.get('q');
  const p = sp.get('p');

  const catSel = document.getElementById('category-filter');
  const search = document.getElementById('search-input');
  let changed = false;

  if (mat && catSel) { catSel.value = mat; changed = true; }
  if (q && search) { search.value = q; changed = true; }

  if (changed) {
    filterProducts();
  }

  if (p) {
    const card = [...document.querySelectorAll('.product-card')]
      .find(c => c.querySelector('.product-sku')?.textContent.includes(p));
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.outline = '2px solid rgba(6, 182, 212, 0.7)';
      setTimeout(() => { card.style.outline = 'none'; }, 2000);
    }
  }

  const updateURL = () => {
    const params = new URLSearchParams(location.search);
    const mVal = catSel?.value && catSel.value !== 'todas' ? catSel.value : '';
    const qVal = search?.value?.trim() || '';
    if (mVal) params.set('m', mVal); else params.delete('m');
    if (qVal) params.set('q', qVal); else params.delete('q');
    history.replaceState(null, '', `${location.pathname}${params.toString() ? `?${params}` : ''}`);
  };

  if (catSel) catSel.addEventListener('change', updateURL);
  if (search) search.addEventListener('input', updateURL);
}
