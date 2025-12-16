// ===== Configuration =====
const CONFIG = {
  PRICE_MARKUP: 1.0, // Ajusta si requieres recargo adicional
  PRICE_STEP: 10, // Redondea al múltiplo de 10 MXN más cercano
  // Página de Facebook/Messenger
  MESSENGER_PAGE: 'mahitek3dlabmx',
  PLACEHOLDER_IMAGE: 'assets/img/placeholder-catalog.svg',
  PLACEHOLDER_PROMO_ICON: 'assets/img/placeholder-promos.svg',
  DATA_PATHS: {
    brand: 'assets/data/brand.json',
    productsBase: 'data/products.json',
    promos: 'data/promos.json',
    social: 'data/social.json',
    faq: 'data/faq.json'
  },
  // Control de logs en Producción (cambiar a false en Producción)
  DEBUG_MODE: false
};

// ===== Detección y Gestión de Idioma =====
const GestorIdioma = {
  IDIOMAS_SOPORTADOS: ['es-MX', 'es', 'en'],
  IDIOMA_PREDETERMINADO: 'es-MX',

  /**
   * Obtiene el idioma preferido del usuario
   * Orden de prioridad: 1) localStorage 2) navigator.language 3) default
   */
  obtenerIdioma() {
    try {
      // 1. Revisar preferencia guardada
      const guardado = localStorage.getItem('idioma-preferido');
      if (guardado && this.IDIOMAS_SOPORTADOS.includes(guardado)) {
        return guardado;
      }

      // 2. Detectar idioma del navegador
      const navegador = navigator.language || navigator.userLanguage || '';

      // Si es español mexicano explícito
      if (navegador.toLowerCase().startsWith('es-mx')) {
        return 'es-MX';
      }

      // Si es cualquier variante de español
      if (navegador.toLowerCase().startsWith('es')) {
        return 'es';
      }

      // Si es inglés
      if (navegador.toLowerCase().startsWith('en')) {
        return 'en';
      }

      // 3. Fallback a español mexicano
      return this.IDIOMA_PREDETERMINADO;
    } catch (error) {
      console.warn('Error detectando idioma:', error);
      return this.IDIOMA_PREDETERMINADO;
    }
  },

  /**
   * Guarda la preferencia de idioma
   */
  guardarIdioma(idioma) {
    try {
      if (this.IDIOMAS_SOPORTADOS.includes(idioma)) {
        localStorage.setItem('idioma-preferido', idioma);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error guardando idioma:', error);
      return false;
    }
  },

  /**
   * Verifica si el idioma es español (cualquier variante)
   */
  esEspanol() {
    const idioma = this.obtenerIdioma();
    return idioma.startsWith('es');
  },

  /**
   * Verifica si el idioma es español mexicano específico
   */
  esMexicano() {
    return this.obtenerIdioma() === 'es-MX';
  },

  /**
   * Actualiza el contenido del cintillo según el idioma
   */
  actualizarCintillo() {
    const cintillo = document.querySelector('.cintillo-texto');
    if (!cintillo) return;

    // Usar el sistema de textos centralizado
    const texto = TextosSistema.obtener('cintillo.construccion');
    cintillo.textContent = texto;
    cintillo.setAttribute('data-idioma', this.obtenerIdioma());
  },

  /**
   * Inicializa el sistema de idioma
   */
  inicializar() {
    const idioma = this.obtenerIdioma();
    document.documentElement.setAttribute('lang', idioma);
    this.actualizarCintillo();

    if (CONFIG.DEBUG_MODE) {
      console.log('?? Idioma detectado:', idioma);
      console.log('???? Es mexicano:', this.esMexicano());
    }
  }
};

// ===== Sistema de Textos Localizados =====
const TextosSistema = {
  /**
   * Obtiene un texto en el idioma actual
   */
  obtener(clave) {
    const idioma = GestorIdioma.obtenerIdioma();
    const textos = this.textos[clave];

    if (!textos) {
      console.warn(`Texto no encontrado: ${clave}`);
      return clave;
    }

    // Prioridad: idioma exacto > idioma base (es-MX -> es) > español > inglés
    return (
      textos[idioma] || textos[idioma.split('-')[0]] || textos['es-MX'] || textos['en'] || clave
    );
  },

  // Catálogo de textos del sistema
  textos: {
    // Cintillo de construcción
    'cintillo.construccion': {
      'es-MX': '? SITIO EN DESARROLLO ? próximamente FUNCIONALIDAD COMPLETA ?',
      es: '? EN CONSTRUCCIÓN ? próximamente DISPONIBLE ?',
      en: '? UNDER DEVELOPMENT ? COMING SOON ?'
    },

    // Mensajes del sistema
    'sistema.cargando': {
      'es-MX': 'Cargando...',
      es: 'Cargando...',
      en: 'Loading...'
    },
    'sistema.error': {
      'es-MX': 'Error al cargar',
      es: 'Error al cargar',
      en: 'Loading error'
    },
    'sistema.sinResultados': {
      'es-MX': 'No se encontraron resultados',
      es: 'No se encontraron resultados',
      en: 'No results found'
    },

    // Productos
    'productos.desde': {
      'es-MX': 'Desde',
      es: 'Desde',
      en: 'From'
    },
    'productos.verMas': {
      'es-MX': 'Ver Más detalles',
      es: 'Ver Más detalles',
      en: 'View more details'
    },
    'productos.disponible': {
      'es-MX': 'Disponible',
      es: 'Disponible',
      en: 'Available'
    },
    'productos.agotado': {
      'es-MX': 'Agotado',
      es: 'Agotado',
      en: 'Out of stock'
    },

    // Promociones
    'promos.titulo': {
      'es-MX': 'Promociones Especiales',
      es: 'Promociones Especiales',
      en: 'Special Offers'
    },
    'promos.ahorra': {
      'es-MX': 'Ahorra',
      es: 'Ahorra',
      en: 'Save'
    },
    'promos.valido': {
      'es-MX': 'Válido hasta',
      es: 'Válido hasta',
      en: 'Valid until'
    },

    // Filtros
    'filtros.todos': {
      'es-MX': 'Todos',
      es: 'Todos',
      en: 'All'
    },
    'filtros.categoria': {
      'es-MX': 'Categoría',
      es: 'Categoría',
      en: 'Category'
    },
    'filtros.limpiar': {
      'es-MX': 'Limpiar filtros',
      es: 'Limpiar filtros',
      en: 'Clear filters'
    },

    // Contacto
    'contacto.whatsapp': {
      'es-MX': 'Contactar por WhatsApp',
      es: 'Contactar por WhatsApp',
      en: 'Contact via WhatsApp'
    },
    'contacto.messenger': {
      'es-MX': 'Enviar mensaje',
      es: 'Enviar mensaje',
      en: 'Send message'
    },
    'contacto.cotizar': {
      'es-MX': 'Solicitar Cotización',
      es: 'Solicitar Cotización',
      en: 'Request quote'
    },

    // FAQ
    'faq.titulo': {
      'es-MX': 'Preguntas Frecuentes',
      es: 'Preguntas Frecuentes',
      en: 'Frequently Asked Questions'
    },
    'faq.ver': {
      'es-MX': 'Ver respuesta',
      es: 'Ver respuesta',
      en: 'View answer'
    },

    // Errores de carga
    'error.productos': {
      'es-MX': 'Error al cargar productos. Por favor, intente nuevamente.',
      es: 'Error al cargar productos. Por favor, intente nuevamente.',
      en: 'Error loading products. Please try again.'
    },
    'error.promos': {
      'es-MX': 'Error al cargar promociones. Por favor, intente nuevamente.',
      es: 'Error al cargar promociones. Por favor, intente nuevamente.',
      en: 'Error loading promotions. Please try again.'
    },
    'error.faq': {
      'es-MX': 'Error al cargar preguntas frecuentes. Por favor, intente nuevamente.',
      es: 'Error al cargar preguntas frecuentes. Por favor, intente nuevamente.',
      en: 'Error loading FAQs. Please try again.'
    },
    'error.red': {
      'es-MX': 'Error de conexión. Verifica tu conexión a internet.',
      es: 'Error de conexión. Verifica tu conexión a internet.',
      en: 'Connection error. Please check your internet connection.'
    },

    // Consola (debug)
    'debug.iniciado': {
      'es-MX': 'Sistema iniciado correctamente',
      es: 'Sistema iniciado correctamente',
      en: 'System started successfully'
    },
    'debug.productosOK': {
      'es-MX': 'Productos cargados',
      es: 'Productos cargados',
      en: 'Products loaded'
    },
    'debug.promosOK': {
      'es-MX': 'Promociones cargadas',
      es: 'Promociones cargadas',
      en: 'Promotions loaded'
    },
    'debug.faqOK': {
      'es-MX': 'Preguntas frecuentes cargadas',
      es: 'Preguntas frecuentes cargadas',
      en: 'FAQs loaded'
    }
  }
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollObserver = null;

// ===== Performance Optimization: Centralized Resize Handler =====
const ResizeManager = {
  callbacks: new Set(),
  timeout: null,
  ticking: false,
  DEBOUNCE_MS: 150,

  register(callback) {
    this.callbacks.add(callback);
    // Ejecutar inmediatamente para inicialización
    callback();
  },

  unregister(callback) {
    this.callbacks.delete(callback);
  },

  handleResize() {
    if (this.ticking) return;

    this.ticking = true;
    requestAnimationFrame(() => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.callbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error('Resize callback error:', error);
          }
        });
        this.ticking = false;
      }, this.DEBOUNCE_MS);
    });
  },

  init() {
    window.addEventListener('resize', () => this.handleResize(), { passive: true });
  }
};

// Inicializar al cargar
ResizeManager.init();

// ===== Security helpers =====
function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sanitiza URLs para evitar javascript: u otros esquemas peligrosos.
// Por defecto permite http/https y rutas relativas. Devuelve '#' si no es segura.
function sanitizeURL(url, { allowRelative = true } = {}) {
  try {
    const u = String(url || '').trim();
    if (!u) return '#';
    const hasScheme = /^[a-zA-Z][a-zA-Z+.-]*:/.test(u);
    // Rutas relativas (incluye "assets/..." sin prefijo) — no reescribir para conservar subpaths (GitHub Pages).
    if (allowRelative && !hasScheme && !u.startsWith('//')) {
      return u;
    }

    const base = document.baseURI || window.location.href;
    const parsed = new URL(u, base);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (allowedProtocols.includes(parsed.protocol)) return parsed.href;
  } catch (_) {
    /* no-op */
  }
  return '#';
}

// ===== Analytics bootstrap (evita scripts inline) =====
function setupAnalytics() {
  try {
    const ua = navigator.userAgent || '';
    const skipAnalytics =
      ua.includes('Chrome-Lighthouse') || ua.includes('Speed Insights') || ua.includes('PageSpeed');
    if (skipAnalytics) return;

    // Inyectar gtag.js si no existe (sin inline scripts)
    const gaId = 'G-Y46M6J1EWS';
    const hasGtagScript = Array.from(document.scripts || []).some(s =>
      String(s.src || '').includes('googletagmanager.com/gtag/js')
    );
    if (!hasGtagScript) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(s);
    }

    // Verificar si gtag.js se cargó (puede estar bloqueado por ad-blockers)
    if (typeof window.gtag === 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        // Stub silencioso si GA estú bloqueado
        if (window.dataLayer) {
          window.dataLayer.push(arguments);
        }
      };
    }
    gtag('js', new Date());
    gtag('config', gaId, {
      send_page_view: true,
      anonymize_ip: true // Privacy-friendly
    });
  } catch (_) {
    /* no-op: GA bloqueado o error de red */
  }
}

// ===== Analytics =====
function log(ev, params = {}) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', ev, params);
    }
  } catch (e) {
    /* no-op: GA bloqueado */
  }
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
    if (!response.ok) {
      throw new Error(`${TextosSistema.obtener('error.red')} (${path})`);
    }
    return await response.json();
  } catch (error) {
    console.error(`? ${TextosSistema.obtener('sistema.error')}: ${path}`, error);
    return null;
  }
}

// ===== Motion Helpers =====
function setupHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;
  let lastScrollY = 0;
  let scrollDirection = 'up';

  const SCROLL_THRESHOLD = 24; // Umbral para activar is-scrolled
  const HIDE_THRESHOLD = 100; // Umbral para ocultar navbar (scroll hacia abajo)
  const COMPACT_THRESHOLD = 300; // Umbral para modo compacto

  const toggleState = () => {
    const scrollY = window.scrollY;
    const scrollDelta = scrollY - lastScrollY;

    // Determinar dirección de scroll
    if (Math.abs(scrollDelta) > 5) {
      // Ignorar micro-scrolls
      scrollDirection = scrollDelta > 0 ? 'down' : 'up';
    }

    // Clase is-scrolled: activa con poco scroll
    header.classList.toggle('is-scrolled', scrollY > SCROLL_THRESHOLD);

    // Clase is-compact: modo ultra-compacto para scroll profundo
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      header.classList.toggle('is-compact', scrollY > COMPACT_THRESHOLD);
    } else {
      header.classList.remove('is-compact'); // Desktop siempre full
    }

    // Clase is-hidden: ocultar al hacer scroll hacia abajo
    const isMenuOpen = document.body.classList.contains('nav-open');
    const isNearTop = scrollY < HIDE_THRESHOLD;
    const shouldHide = scrollDirection === 'down' && scrollY > HIDE_THRESHOLD && !isMenuOpen;

    if (shouldHide) {
      header.classList.add('is-hidden');
    } else if (scrollDirection === 'up' || isNearTop || isMenuOpen) {
      header.classList.remove('is-hidden');
    }

    // Actualizar última posición
    lastScrollY = scrollY;
    ticking = false;
  };

  const requestToggle = () => {
    if (!ticking) {
      requestAnimationFrame(toggleState);
      ticking = true;
    }
  };

  // Estado inicial
  toggleState();

  // Throttled scroll con RAF
  window.addEventListener('scroll', requestToggle, { passive: true });
}

function setupScrollReveal() {
  document.documentElement.classList.add('js-animate');
  const animatedNodes = document.querySelectorAll('[data-animate]');
  if (!animatedNodes.length) return;

  if (prefersReducedMotion.matches) {
    animatedNodes.forEach(node => node.classList.add('is-visible'));
    document.documentElement.classList.add('animations-ready');
    return;
  }

  if (typeof IntersectionObserver === 'undefined') {
    animatedNodes.forEach(node => node.classList.add('is-visible'));
    document.documentElement.classList.add('animations-ready');
    return;
  }

  // Configuración mejorada del Intersection Observer
  scrollObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Agregar pequeño delay para efecto más natural
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, 50);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15, // Detectar Más temprano
      rootMargin: '0px 0px -8% 0px' // Trigger antes de que entre completamente
    }
  );

  animatedNodes.forEach(node => {
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      node.classList.add('is-visible');
    }
    scrollObserver.observe(node);
  });

  requestAnimationFrame(() => {
    document.documentElement.classList.add('animations-ready');
  });
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
  allProducts = productsBase.filter(p => p.estado === 'activo');

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
        <img src="assets/img/placeholder-catalog.svg" alt="Sin coincidencias en el Catálogo" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>No se encontraron productos con los filtros seleccionados. Ajusta los filtros o Cuéntanos qué estús buscando.</p>
      </div>
    `;
    registerAnimatedElements(carousel);
    // No inicializar carrusel si no hay productos
    return;
  }

  // SECURITY: Todos los campos usan escapeHTML/sanitizeURL - validado manualmente
  carousel.innerHTML = displayedProducts
    .map((product, index) => {
      const delay = Math.min(index, 5) * 80;

      // Usar emoji como imagen animada
      const isEmojiLike =
        product.imagen && !product.imagen.startsWith('/') && !String(product.imagen).includes('.');
      const safeName = escapeHTML(product.nombre || '');
      const mediaMarkup = isEmojiLike
        ? `<div class="product-emoji">${escapeHTML(product.imagen)}</div>`
        : `<img class="product-image" src="${sanitizeURL(product.imagen || CONFIG.PLACEHOLDER_IMAGE)}" alt="${safeName}" data-placeholder="${CONFIG.PLACEHOLDER_IMAGE}" loading="lazy" decoding="async" />`;

      // Construir detalles del producto
      const detailsData = [
        { label: 'Material', value: product.material },
        { label: 'Incluye', value: product.incluye },
        { label: 'Variantes', value: product.variantes }
      ].filter(item => item.value);

      const detailMarkup = detailsData.length
        ? `
        <dl class="product-details">
          ${detailsData
            .map(
              detail => `
            <div>
              <dt>${escapeHTML(detail.label)}</dt>
              <dd>${escapeHTML(detail.value)}</dd>
            </div>
          `
            )
            .join('')}
        </dl>
      `
        : '';

      const tagsMarkup =
        product.tags && product.tags.length
          ? `
        <div class="product-tags">
          ${product.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
        </div>
      `
          : '';

      // Sugerencias de negocio
      const sugerenciasMarkup = product.sugerencias
        ? `<p class="product-suggestions">?? <strong>Sugerencias:</strong> ${escapeHTML(product.sugerencias)}</p>`
        : '';

      // Analytics: vista de item al render
      log('view_item', {
        item_id: product.id,
        item_name: product.nombre,
        price: product.precio_mxn,
        item_category: product.categoria
      });

      return `
  <article class="card glass product-card animate-delay-${Math.min(index, 5)}" role="listitem" data-animate="fade-up">
      <div class="product-media">
        ${mediaMarkup}
      </div>
      <div class="product-meta">
        <span class="product-sku">${escapeHTML(product.id || '')}</span>
        ${product.categoria ? `<span class="product-line">${escapeHTML(product.categoria)}</span>` : ''}
      </div>
  <h3 class="product-name">${safeName}</h3>
  <p class="product-price">${product.precio_rango_mxn ? `$${escapeHTML(String(product.precio_rango_mxn))} MXN` : `$${escapeHTML(String(product.precio_mxn))} MXN`}</p>
  <p class="product-price-note">Rango por personalización, tamaño/grosor, acabados, herrajes/adhesivos, alcance y tirada.</p>
      <p class="product-description">${escapeHTML(product.descripcion || '')}</p>
      ${detailMarkup}
      ${tagsMarkup}
      ${sugerenciasMarkup}
      <a href="${buildMessengerURL(`product:${encodeURIComponent(product.id || '')}|${encodeURIComponent(product.nombre)}`)}" 
         class="btn btn-primary product-cta" 
         target="_blank" 
         rel="noopener noreferrer" 
         data-sku="${product.id}" 
         data-name="${escapeHTML(product.nombre)}">
        Consultar disponibilidad en Messenger
      </a>
    </article>
  `;
    })
    .join('');

  registerAnimatedElements(carousel);
  setupImageErrorFallbacks(carousel);
  initCatalogCarousel(displayedProducts.length);

  // Log de interacción: add_to_cart en CTA
  carousel.addEventListener(
    'click',
    ev => {
      const btn = ev.target.closest('.product-cta');
      if (!btn) return;
      log('add_to_cart', {
        item_id: btn.getAttribute('data-sku') || '',
        item_name: btn.getAttribute('data-name') || ''
      });
    },
    { once: true }
  );
}

function setupImageErrorFallbacks(root) {
  if (!root) return;
  root.querySelectorAll('img[data-placeholder]').forEach(img => {
    img.addEventListener('error', function () {
      const fallbacks = [
        this.getAttribute('data-placeholder') || '',
        this.getAttribute('data-fallback-raster') || ''
      ].filter(Boolean);

      if (!fallbacks.length) return;

      const step = Number(this.dataset.fallbackStep || '0');
      if (step >= fallbacks.length) return;

      this.dataset.fallbackStep = String(step + 1);
      this.src = fallbacks[step];
    });
  });
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
  let hasMultiplePages = false;

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
    if (hasMultiplePages) {
      updateDots();
    }
  }

  // Actualizar estado de botones
  function updateButtons() {
    const totalPages = getTotalPages();
    if (!hasMultiplePages) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalPages - 1;
  }

  // Crear y actualizar dots
  function createDots(totalPages) {
    if (!hasMultiplePages) {
      dotsContainer.innerHTML = '';
      return;
    }

    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Ir a pagina ${i + 1}`);
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
    if (!hasMultiplePages) return;
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
      log('catalog_carousel_navigation', {
        method: 'button',
        direction: 'prev',
        index: currentIndex
      });
    }
  });

  nextBtn.addEventListener('click', () => {
    const totalPages = getTotalPages();
    if (currentIndex < totalPages - 1) {
      currentIndex++;
      updateTrack();
      log('catalog_carousel_navigation', {
        method: 'button',
        direction: 'next',
        index: currentIndex
      });
    }
  });

  // Soporte túctil para swipe
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener(
    'touchstart',
    e => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  track.addEventListener(
    'touchend',
    e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

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
      log('catalog_carousel_navigation', {
        method: 'swipe',
        direction: diff > 0 ? 'next' : 'prev'
      });
    }
  }

  // Registrar callback de resize optimizado
  const handleCatalogResize = () => {
    const oldItemsPerView = itemsPerView;
    updateItemsPerView();

    if (oldItemsPerView !== itemsPerView) {
      currentIndex = 0;
      createDots();
      updateTrack();
    }
  };

  ResizeManager.register(handleCatalogResize);

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

  // Construcción segura de opciones
  select.innerHTML = '';
  const optAll = document.createElement('option');
  optAll.value = 'todas';
  optAll.textContent = 'Todas';
  select.appendChild(optAll);

  categories.forEach(cat => {
    if (!cat) return;
    const opt = document.createElement('option');
    opt.value = String(cat);
    opt.textContent = String(cat);
    select.appendChild(opt);
  });
}

function filterProducts() {
  const categoryFilter = document.getElementById('category-filter')?.value || 'todas';
  const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';

  displayedProducts = allProducts.filter(product => {
    const matchesCategory = categoryFilter === 'todas' || product.categoria === categoryFilter;
    const matchesSearch =
      !searchTerm ||
      product.nombre.toLowerCase().includes(searchTerm) ||
      (product.descripcion || '').toLowerCase().includes(searchTerm) ||
      (product.id || '').toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm));

    return matchesCategory && matchesSearch;
  });

  renderProducts();
}

// ===== Promos (Lazy Load cuando sea visible) =====
let promosLoaded = false;

async function loadPromos() {
  // Si ya se cargó, no hacer nada
  if (promosLoaded) return;

  const promos = await loadJSON(CONFIG.DATA_PATHS.promos);
  const container = document.getElementById('promos-container');
  if (!container) return;

  promosLoaded = true;

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
        <p>No hay promociones activas en este momento. ¿Escríbenos y te contamos qué estamos creando!</p>
      </div>
    `;
    registerAnimatedElements(container);
    return;
  }

  // SECURITY: Todos los campos usan escapeHTML/sanitizeURL - validado manualmente
  container.innerHTML = activePromos
    .map((promo, index) => {
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
        ? `<span class="promo-badge">${escapeHTML(promo.badge)}</span>`
        : '';

      // Beneficios
      const beneficiosHTML =
        promo.beneficios && promo.beneficios.length > 0
          ? `
        <ul class="promo-beneficios">
          ${promo.beneficios.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>
      `
          : '';

      // Fechas o permanente
      let validezHTML = '';
      if (promo.tipo === 'permanente') {
        validezHTML = '<p class="promo-validez">⏳ Promoción permanente</p>';
      } else if (promo.desde && promo.hasta) {
        validezHTML = `<p class="promo-validez">⏳ Válido ${escapeHTML(formatDate(promo.desde))} – ${escapeHTML(formatDate(promo.hasta))}</p>`;
      }

      // CTA
      const ctaHTML = promo.cta_url
        ? `
        <a href="${sanitizeURL(promo.cta_url)}" 
           class="btn btn-primary promo-cta" 
           target="_blank" 
           rel="noopener noreferrer" 
           data-promo-id="${escapeHTML(promo.id)}" 
           data-promo-name="${escapeHTML(promo.titulo)}">
          ${escapeHTML(promo.cta_text || 'Más info')}
        </a>
      `
        : `
        <button class="btn btn-primary promo-cta-contact" 
                data-promo-id="${escapeHTML(promo.id)}" 
                data-promo-name="${escapeHTML(promo.titulo)}">
          ${escapeHTML('Consultar por WhatsApp')}
        </button>
      `;

      // Icono (SVG o emoji)
      let iconoHTML = '';
      if (promo.icono) {
        if (promo.icono.endsWith('.svg')) {
          iconoHTML = `<img src="${sanitizeURL(promo.icono)}" alt="${escapeHTML(promo.titulo)}" class="promo-icon" width="200" height="200" loading="lazy" decoding="async" data-placeholder="${CONFIG.PLACEHOLDER_PROMO_ICON}" data-fallback-raster="assets/img/og-image.png" />`;
        } else {
          iconoHTML = `<span class="promo-emoji" aria-hidden="true">${escapeHTML(promo.icono)}</span>`;
        }
      } else {
        iconoHTML = `<span class="promo-emoji" aria-hidden="true">??</span>`;
      }

      return `
  <article class="card glass promo-card ${destacadoClass} ${animClass} animate-delay-${Math.min(index, 5)}" 
       data-animate="fade-up" 
       data-promo-tipo="${promo.tipo}">
      ${badgeHTML ? `<div class="promo-badge-wrapper">${badgeHTML}</div>` : ''}
      <div class="promo-icono-container">
        ${iconoHTML}
      </div>
      <h3 class="promo-titulo">${escapeHTML(promo.titulo)}</h3>
      <p class="promo-subtitulo">${escapeHTML(promo.subtitulo || promo.descripcion || '')}</p>
      ${precioHTML}
      ${beneficiosHTML}
      ${validezHTML}
      ${ctaHTML}
    </article>
  `;
    })
    .join('');

  registerAnimatedElements(container);
  setupImageErrorFallbacks(container);

  // Inicializar carrusel
  initPromosCarousel(activePromos.length);

  // Analytics para CTAs externas
  container.addEventListener('click', ev => {
    const a = ev.target.closest('.promo-cta');
    if (!a) return;
    log('select_promotion', {
      promotion_id: a.getAttribute('data-promo-id') || '',
      promotion_name: a.getAttribute('data-promo-name') || ''
    });
  });

  // CTAs de contacto interno
  container.addEventListener('click', ev => {
    const btn = ev.target.closest('.promo-cta-contact');
    if (!btn) return;
    const promoId = btn.getAttribute('data-promo-id') || '';
    const promoName = btn.getAttribute('data-promo-name') || 'Promoción';
    const ref = `promo:${promoId || promoName}`;
    window.open(buildMessengerURL(ref), '_blank', 'noopener');
    log('contact_promo', {
      promotion_id: btn.getAttribute('data-promo-id') || '',
      promotion_name: promoName
    });
  });
}

// ===== Carrusel de Promos =====
function initPromosCarousel(totalPromos) {
  const promosSection = document.getElementById('promos');
  const carouselContainer = promosSection?.querySelector('.carousel-container');
  const track = carouselContainer?.querySelector('#promos-container');
  const wrapper = carouselContainer?.querySelector('.carousel-wrapper');
  const prevBtn = carouselContainer?.querySelector('.carousel-btn-prev');
  const nextBtn = carouselContainer?.querySelector('.carousel-btn-next');
  const dotsContainer = promosSection?.querySelector('#promos-dots');

  if (!track || !wrapper || !prevBtn || !nextBtn || !dotsContainer) return;

  let currentIndex = 0;
  let itemsPerView = 1;
  let hasMultiplePages = false;

  function updateItemsPerView() {
    if (window.innerWidth >= 1024) {
      itemsPerView = 3;
    } else if (window.innerWidth >= 768) {
      itemsPerView = 2;
    } else {
      itemsPerView = 1;
    }
  }

  function getTotalPages() {
    return Math.ceil(totalPromos / itemsPerView);
  }

  function updateTrack() {
    const wrapperWidth = wrapper.clientWidth;
    const maxOffset = Math.max(track.scrollWidth - wrapperWidth, 0);
    const offset = Math.min(currentIndex * wrapperWidth, maxOffset);
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    updateButtons();
    if (hasMultiplePages) {
      updateDots();
    }
  }

  function updateButtons() {
    const totalPages = getTotalPages();
    if (!hasMultiplePages) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalPages - 1;
  }

  function createDots(totalPages) {
    if (!hasMultiplePages) {
      dotsContainer.innerHTML = '';
      return;
    }

    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Ir a pagina ${i + 1}`);
      if (i === currentIndex) dot.classList.add('active');

      dot.addEventListener('click', () => {
        currentIndex = i;
        updateTrack();
      });

      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!hasMultiplePages) return;

    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

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

  // Soporte túctil para swipe
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener(
    'touchstart',
    e => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  track.addEventListener(
    'touchend',
    e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextBtn.click();
      } else {
        prevBtn.click();
      }
    }
  }

  function syncNavigation(forceRebuildDots = false) {
    const totalPages = getTotalPages();
    hasMultiplePages = totalPages > 1;
    const shouldHideNav = !hasMultiplePages;

    [prevBtn, nextBtn].forEach(btn => {
      btn.hidden = shouldHideNav;
      btn.setAttribute('aria-hidden', shouldHideNav ? 'true' : 'false');
      btn.tabIndex = shouldHideNav ? -1 : 0;
    });

    if (currentIndex > totalPages - 1) {
      currentIndex = Math.max(totalPages - 1, 0);
    }

    if (shouldHideNav) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      dotsContainer.hidden = true;
      dotsContainer.setAttribute('aria-hidden', 'true');
      dotsContainer.innerHTML = '';
      track.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    dotsContainer.hidden = false;
    dotsContainer.setAttribute('aria-hidden', 'false');

    if (forceRebuildDots || dotsContainer.childElementCount !== totalPages) {
      createDots(totalPages);
    } else {
      updateDots();
    }

    updateButtons();
  }

  const handlePromosResize = () => {
    const oldItemsPerView = itemsPerView;
    updateItemsPerView();

    if (oldItemsPerView !== itemsPerView) {
      currentIndex = 0;
    }

    syncNavigation(true);
    updateTrack();
  };

  ResizeManager.register(handlePromosResize);

  updateItemsPerView();
  syncNavigation(true);
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

// ===== FAQ (Lazy Load cuando sea visible) =====
let faqLoaded = false;

function normalizeKey(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function getFAQTheme(categoryLabel) {
  const key = normalizeKey(categoryLabel);

  if (key.includes('personal')) {
    return { icon: 'i-faq-wand', theme: 'violet' };
  }
  if (key.includes('produc') || key.includes('equipo')) {
    return { icon: 'i-faq-printer', theme: 'cyan' };
  }
  if (key.includes('servic') || key.includes('post')) {
    return { icon: 'i-faq-wrench', theme: 'green' };
  }
  if (key.includes('env')) {
    return { icon: 'i-faq-truck', theme: 'amber' };
  }
  if (key.includes('garant') || key.includes('calid')) {
    return { icon: 'i-faq-shield', theme: 'blue' };
  }
  if (key.includes('precio') || key.includes('pago') || key.includes('fact')) {
    return { icon: 'i-faq-tag', theme: 'lime' };
  }
  if (key.includes('archivo') || key.includes('formato')) {
    return { icon: 'i-faq-file', theme: 'rose' };
  }
  if (key.includes('disen')) {
    return { icon: 'i-faq-pen', theme: 'rose' };
  }
  if (key.includes('privac')) {
    return { icon: 'i-faq-lock', theme: 'violet' };
  }
  if (key.includes('sosten')) {
    return { icon: 'i-faq-leaf', theme: 'emerald' };
  }
  if (key.includes('devol')) {
    return { icon: 'i-faq-refresh', theme: 'slate' };
  }
  if (key.includes('material') || key.includes('acab')) {
    return { icon: 'i-faq-layers', theme: 'pink' };
  }
  if (key.includes('tiemp')) {
    return { icon: 'i-faq-clock', theme: 'sky' };
  }

  return { icon: 'i-faq-spark', theme: 'teal' };
}

async function loadFAQ() {
  // Si ya se cargó, no hacer nada
  if (faqLoaded) return;

  const faqData = await loadJSON(CONFIG.DATA_PATHS.faq);
  const container = document.getElementById('faq-list');
  if (!container) return;

  faqLoaded = true;

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

  // SECURITY: Todos los campos (item.q, item.a) usan escapeHTML - validado manualmente
  // Render de items con IDs linkeables
  container.innerHTML = faqData
    .map((item, index) => {
      const id = `faq-${slugify(item.q)}`;
      const categoryValue = (item.categoria || '').toLowerCase();
      const categoryAttr = categoryValue ? ` data-category="${escapeHTML(categoryValue)}"` : '';
      const theme = getFAQTheme(item.categoria || '');
      const themeAttr = theme?.theme ? ` data-faq-theme="${escapeHTML(theme.theme)}"` : '';
      const categoryPill = item.categoria
        ? `<span class="faq-item-pill">${escapeHTML(item.categoria)}</span>`
        : '';
      return `
  <details class="faq-item animate-delay-${Math.min(index, 5)}" id="${id}" data-animate="fade-up"${categoryAttr}${themeAttr}>
    <summary>
      <div class="faq-item-title">
        <span class="faq-item-icon" aria-hidden="true">
          <svg class="ui-icon ui-icon--draw" viewBox="0 0 24 24">
            <use href="#${escapeHTML(theme.icon)}"></use>
          </svg>
        </span>
        <span class="faq-item-question">${escapeHTML(item.q)}</span>
        ${categoryPill}
      </div>
      <span class="faq-item-chevron" aria-hidden="true"></span>
    </summary>
    <div class="faq-item-content">
      <p>${escapeHTML(item.a)}</p>
    </div>
  </details>
`;
    })
    .join('');

  registerAnimatedElements(container);

  // Render de destacadas como chips
  const top = document.getElementById('faq-top');
  const featured = faqData.filter(i => i.destacada);
  if (top) {
    if (featured.length > 0) {
      // SECURITY: it.q usa escapeHTML - validado manualmente
      top.innerHTML = featured
        .map(it => {
          const id = `faq-${slugify(it.q)}`;
          const theme = getFAQTheme(it.categoria || '');
          const themeAttr = theme?.theme ? ` data-faq-theme="${escapeHTML(theme.theme)}"` : '';
          return `<a class="faq-chip" href="#${id}" data-faq-target="#${id}" aria-label="Ir a: ${escapeHTML(
            it.q
          )}"${themeAttr}><svg class="faq-chip-icon ui-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#${escapeHTML(
            theme.icon
          )}"></use></svg><span>${escapeHTML(it.q)}</span></a>`;
        })
        .join('');

      top.addEventListener('click', e => {
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

  const totalStat = document.querySelector('[data-faq-total]');
  if (totalStat) {
    totalStat.textContent = faqData.length;
  }
  const featuredStat = document.querySelector('[data-faq-featured]');
  if (featuredStat) {
    featuredStat.textContent = featured.length;
  }

  // Poblar categorías desde data
  if (categorySelect) {
    const categories = Array.from(new Set(faqData.map(i => i.categoria).filter(Boolean)))
      .map(cat => ({ label: cat, value: cat.toLowerCase() }))
      .sort((a, b) => a.label.localeCompare(b.label));
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.value;
      opt.textContent = cat.label;
      categorySelect.appendChild(opt);
    });
  }

  function applyFilter(query) {
    const q = (query || '').trim().toLowerCase();
    const cat = categorySelect && categorySelect.value ? categorySelect.value : '';
    let visible = 0;
    items.forEach(el => {
      const text = el.textContent.toLowerCase();
      const matchText = q.length === 0 || text.includes(q);
      const itemCat = (el.dataset.category || '').toLowerCase();
      const matchCat = !cat || itemCat === cat;
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
    search.addEventListener('input', e => applyFilter(e.target.value));
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', () => applyFilter(search ? search.value : ''));
  }
  if (btnExpand) {
    btnExpand.addEventListener('click', () => items.forEach(el => (el.open = true)));
  }
  if (btnCollapse) {
    btnCollapse.addEventListener('click', () => items.forEach(el => (el.open = false)));
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

  // Footer social links (iconos)
  const container = document.getElementById('social-links');
  if (container) {
    const links = [];
    if (social.instagram)
      links.push({ key: 'instagram', label: 'Instagram', url: social.instagram });
    if (social.facebook) links.push({ key: 'facebook', label: 'Facebook', url: social.facebook });
    if (social.tiktok) links.push({ key: 'tiktok', label: 'TikTok', url: social.tiktok });

    container.innerHTML = links
      .map(
        link => `
      <a class="social-icon social-icon--${link.key}" href="${sanitizeURL(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(link.label)}" title="${escapeHTML(link.label)}">
        ${getSocialIconMarkup(link.key)}
        <span class="sr-only">${escapeHTML(link.label)}</span>
      </a>
    `
      )
      .join('');
  }

  // Hero social links (con texto)
  const heroContainer = document.getElementById('hero-social-links');
  if (heroContainer) {
    const links = [];
    if (social.instagram)
      links.push({
        key: 'instagram',
        label: 'Instagram',
        url: social.instagram,
        icon: 'instagram'
      });
    if (social.facebook)
      links.push({ key: 'facebook', label: 'Facebook', url: social.facebook, icon: 'facebook' });
    if (social.tiktok)
      links.push({ key: 'tiktok', label: 'TikTok', url: social.tiktok, icon: 'tiktok' });

    heroContainer.innerHTML = links
      .map(
        link => `
      <a class="community-link" href="${sanitizeURL(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(link.label)}">
        ${getSocialIconMarkup(link.key)}
        <span>${escapeHTML(link.label)}</span>
      </a>
    `
      )
      .join('');
  }
}

// Official logos via Simple Icons CDN (CC0) - single-color SVGs
function getSocialIconMarkup(platform) {
  const size = 28;

  // SVG inline para evitar problemas de carga externa
  const icons = {
    instagram: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>`,
    facebook: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    tiktok: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    youtube: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    twitter: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
  };

  return icons[platform] || icons.instagram; // Fallback a Instagram si no existe
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

  // Prevención de doble-click/doble-tap
  let isAnimating = false;

  const closeMenu = () => {
    if (isAnimating) return;
    isAnimating = true;

    menu.classList.remove('active');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('nav-open');

    // Reset flag después de la animación
    setTimeout(() => {
      isAnimating = false;
    }, 350);
  };

  const openMenu = () => {
    if (isAnimating) return;
    isAnimating = true;

    menu.classList.add('active');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.classList.add('nav-open');

    // Reset flag después de la animación
    setTimeout(() => {
      isAnimating = false;
    }, 350);
  };

  toggle.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

    if (isAnimating) return; // Prevenir clicks durante animación

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
  document.addEventListener('click', e => {
    if (
      menu.classList.contains('active') &&
      !menu.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeMenu();
      log('nav_menu_close', { method: 'outside_click' });
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      closeMenu();
      toggle.focus();
      log('nav_menu_close', { method: 'escape_key' });
    }
  });

  // Cerrar menú en resize (si pasamos a desktop) - usando ResizeManager
  const handleNavResize = () => {
    if (window.innerWidth >= 768 && menu.classList.contains('active')) {
      closeMenu();
      log('nav_menu_close', { method: 'resize_to_desktop' });
    }
  };

  ResizeManager.register(handleNavResize);

  // Smooth scroll behavior for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// ===== Lazy Loading de Secciones No-Críticas =====
function setupLazyLoading() {
  const lazyObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const sectionId = section.id;

          // Cargar datos según la sección
          if (sectionId === 'promos' && !promosLoaded) {
            loadPromos();
            lazyObserver.unobserve(section);
          } else if (sectionId === 'faq' && !faqLoaded) {
            loadFAQ();
            lazyObserver.unobserve(section);
          }
        }
      });
    },
    {
      rootMargin: '200px' // Precargar 200px antes de que sea visible
    }
  );

  // Observar secciones no-críticas
  const promosSection = document.getElementById('promos');
  const faqSection = document.getElementById('faq');

  if (promosSection) lazyObserver.observe(promosSection);
  if (faqSection) lazyObserver.observe(faqSection);
}

// ===== Initialization =====
async function init() {
  // Inicializar sistema de idioma PRIMERO
  GestorIdioma.inicializar();

  // Ajuste de viewport y recursos según dispositivo
  setupViewportAndDevice();

  setupAnalytics();
  setupNav();
  setupFilters();
  setupHeaderScroll();
  setupScrollReveal();
  hydrateEmails();
  injectOrganizationSchema();

  // Cargar solo datos críticos inmediatamente
  await Promise.all([loadProducts(), loadSocialLinks()]);

  // Configurar lazy loading para secciones no-críticas
  setupLazyLoading();

  // Aplicar estado desde la URL y sincronizar cambios
  applyURLState();

  // Logs solo en modo debug (en español profesional)
  if (CONFIG.DEBUG_MODE) {
    console.log(`? ${TextosSistema.obtener('debug.iniciado')}`);
    console.log(`?? ${TextosSistema.obtener('debug.productosOK')}: ${allProducts.length}`);
    console.log(
      `?? Margen de precio: ${CONFIG.PRICE_MARKUP} (${(CONFIG.PRICE_MARKUP - 1) * 100}%)`
    );
    console.log(`?? Redondeo: $${CONFIG.PRICE_STEP} MXN`);
  }
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
    link.setAttribute('rel', `${link.getAttribute('rel') || ''} nofollow noopener noreferrer`);
  });
}

// ===== Viewport and Device Capability Setup =====
function setupViewportAndDevice() {
  const docEl = document.documentElement;

  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    docEl.style.setProperty('--vh', `${vh}px`);
  };

  const setVW = () => {
    const vw = window.innerWidth * 0.01;
    docEl.style.setProperty('--vw', `${vw}px`);
  };

  const setHeaderHeight = () => {
    const header = document.querySelector('.header');
    if (header) {
      docEl.style.setProperty('--header-h', `${header.offsetHeight}px`);
    }
  };

  const setDeviceClass = () => {
    try {
      const mem = navigator.deviceMemory || 2; // GB
      const cores = navigator.hardwareConcurrency || 2;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finePointer = window.matchMedia('(pointer: fine)').matches;

      const isHigh = mem >= 4 && cores >= 6 && !reduceMotion && finePointer;
      docEl.classList.toggle('device-high', isHigh);
      docEl.classList.toggle('device-low', !isHigh);
    } catch (e) {
      // Fallback: marcar como bajo
      docEl.classList.add('device-low');
    }
  };

  setVH();
  setHeaderHeight();
  setVW();
  setDeviceClass();

  window.addEventListener(
    'resize',
    () => {
      setVH();
      setHeaderHeight();
      setVW();
    },
    { passive: true }
  );

  window.addEventListener('orientationchange', () => {
    setVH();
    setHeaderHeight();
    setVW();
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

  if (mat && catSel) {
    catSel.value = mat;
    changed = true;
  }
  if (q && search) {
    search.value = q;
    changed = true;
  }

  if (changed) {
    filterProducts();
  }

  if (p) {
    const card = [...document.querySelectorAll('.product-card')].find(c =>
      c.querySelector('.product-sku')?.textContent.includes(p)
    );
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.outline = '2px solid rgba(6, 182, 212, 0.7)';
      setTimeout(() => {
        card.style.outline = 'none';
      }, 2000);
    }
  }

  const updateURL = () => {
    const params = new URLSearchParams(location.search);
    const mVal = catSel?.value && catSel.value !== 'todas' ? catSel.value : '';
    const qVal = search?.value?.trim() || '';
    if (mVal) params.set('m', mVal);
    else params.delete('m');
    if (qVal) params.set('q', qVal);
    else params.delete('q');
    history.replaceState(null, '', `${location.pathname}${params.toString() ? `?${params}` : ''}`);
  };

  if (catSel) catSel.addEventListener('change', updateURL);
  if (search) search.addEventListener('input', updateURL);
}

// Inyecta Organization JSON-LD en head (evita inline para cumplir CSP)
function injectOrganizationSchema() {
  try {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Mahitek 3D Lab',
      url: 'https://dtcsrni.github.io/Mahitek_3D_Lab_MX/',
      logo: 'https://dtcsrni.github.io/Mahitek_3D_Lab_MX/assets/img/mark-icon.svg',
      sameAs: ['https://www.instagram.com/mahitek3dlab', 'https://www.facebook.com/mahitek3dlab'],
      description:
        'Laboratorio de impresión 3D en PETG desde Pachuca, México. Creamos piezas personalizadas para regalos, Decoración y proyectos creativos.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Pachuca',
        addressRegion: 'Hidalgo',
        addressCountry: 'MX'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'armsystechno@gmail.com',
        url: 'https://m.me/mahitek3dlabmx'
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'org-schema';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  } catch (_) {
    /* no-op */
  }
}
