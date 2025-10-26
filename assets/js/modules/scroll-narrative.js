/**
 * Sistema de narrativa progresiva basada en scroll
 * Crea una experiencia storytelling mientras el usuario navega
 * @module scroll-narrative
 * @version 2.0.0
 */

import { CONFIG, ConfigUtils } from './config.js';

/**
 * Gestor de narrativa con scroll
 */
export class ScrollNarrative {
  constructor() {
    this.currentSection = null;
    this.sections = new Map();
    this.observers = new Map();
    this.progressBar = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa el sistema de narrativa
   */
  init() {
    if (this.isInitialized) {
      ConfigUtils.warn('ScrollNarrative ya fue inicializado');
      return;
    }

    ConfigUtils.log('Inicializando narrativa con scroll...');

    // Crear barra de progreso
    this.createProgressBar();

    // Registrar todas las secciones
    this.registerSections();

    // Configurar Intersection Observers
    this.setupObservers();

    // Escuchar eventos de scroll para progreso
    this.setupScrollProgress();

    // Animar entrada inicial del hero
    this.animateHero();

    this.isInitialized = true;
    ConfigUtils.log('Narrativa con scroll inicializada ✓');
  }

  /**
   * Crea la barra de progreso de lectura
   */
  createProgressBar() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'reading-progress';
    this.progressBar.setAttribute('role', 'progressbar');
    this.progressBar.setAttribute('aria-label', 'Progreso de lectura');
    this.progressBar.setAttribute('aria-valuemin', '0');
    this.progressBar.setAttribute('aria-valuemax', '100');
    this.progressBar.setAttribute('aria-valuenow', '0');

    const progressFill = document.createElement('div');
    progressFill.className = 'reading-progress__fill';
    this.progressBar.appendChild(progressFill);

    document.body.appendChild(this.progressBar);
  }

  /**
   * Registra todas las secciones narrativas
   */
  registerSections() {
    CONFIG.NARRATIVE.SECTIONS.forEach(sectionConfig => {
      const element = document.getElementById(sectionConfig.id);
      if (element) {
        this.sections.set(sectionConfig.id, {
          element,
          config: sectionConfig,
          isVisible: false,
          hasBeenSeen: false,
          animations: []
        });

        // Agregar atributos de datos para CSS
        element.dataset.narrative = sectionConfig.narrative;
        element.dataset.theme = sectionConfig.theme;
      } else {
        ConfigUtils.warn(`Sección no encontrada: ${sectionConfig.id}`);
      }
    });
  }

  /**
   * Configura Intersection Observers para cada sección
   */
  setupObservers() {
    // Observer principal para secciones
    const sectionObserver = new IntersectionObserver(
      entries => this.handleSectionIntersection(entries),
      {
        threshold: CONFIG.ANIMATIONS.SCROLL_THRESHOLD,
        rootMargin: CONFIG.ANIMATIONS.SCROLL_ROOT_MARGIN
      }
    );

    // Observer para elementos animables dentro de secciones
    const elementObserver = new IntersectionObserver(
      entries => this.handleElementIntersection(entries),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -5% 0px'
      }
    );

    // Observar cada sección
    this.sections.forEach((section, id) => {
      sectionObserver.observe(section.element);

      // Observar elementos animables dentro de la sección
      const animatableElements = section.element.querySelectorAll('[data-animate]');
      animatableElements.forEach(el => {
        elementObserver.observe(el);
        section.animations.push(el);
      });
    });

    this.observers.set('sections', sectionObserver);
    this.observers.set('elements', elementObserver);
  }

  /**
   * Maneja la intersección de secciones
   */
  handleSectionIntersection(entries) {
    entries.forEach(entry => {
      const sectionId = entry.target.id;
      const section = this.sections.get(sectionId);

      if (!section) return;

      if (entry.isIntersecting) {
        // Sección visible
        section.isVisible = true;

        if (!section.hasBeenSeen) {
          section.hasBeenSeen = true;
          this.onSectionFirstView(section);
        }

        this.onSectionEnter(section);
      } else {
        // Sección no visible
        section.isVisible = false;
        this.onSectionLeave(section);
      }
    });

    // Actualizar sección actual
    this.updateCurrentSection();
  }

  /**
   * Maneja la intersección de elementos individuales
   */
  handleElementIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animationType = element.dataset.animate;
        const delay = parseInt(element.dataset.delay || '0');

        // Aplicar animación con delay si existe clase animate-delay-*
        setTimeout(() => {
          element.classList.add('animated');
          this.applyAnimation(element, animationType);
        }, delay);

        // Dejar de observar si es animación única
        if (!element.dataset.animateRepeat) {
          this.observers.get('elements').unobserve(element);
        }
      } else {
        // Si tiene repeat, remover clase para re-animar
        if (entry.target.dataset.animateRepeat) {
          entry.target.classList.remove('animated');
        }
      }
    });
  }

  /**
   * Aplica animación específica a un elemento
   */
  applyAnimation(element, type) {
    const animations = {
      'fade-up': () => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      },
      'fade-down': () => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      },
      'fade-left': () => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      },
      'fade-right': () => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      },
      'scale-up': () => {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
      },
      'flip-in': () => {
        element.style.opacity = '1';
        element.style.transform = 'rotateY(0deg)';
      }
    };

    const animation = animations[type];
    if (animation && ConfigUtils.shouldAnimate()) {
      animation();
    } else {
      // Sin animación, solo mostrar
      element.style.opacity = '1';
    }
  }

  /**
   * Primera vez que se ve una sección
   */
  onSectionFirstView(section) {
    ConfigUtils.log(
      `Primera vista de sección: ${section.config.name} (${section.config.narrative})`
    );

    // Emitir evento personalizado
    const event = new CustomEvent('narrative:section-first-view', {
      detail: {
        sectionId: section.config.id,
        narrative: section.config.narrative,
        theme: section.config.theme
      }
    });
    document.dispatchEvent(event);

    // Aplicar efectos específicos según narrativa
    this.applyNarrativeEffects(section);
  }

  /**
   * Cuando se entra a una sección
   */
  onSectionEnter(section) {
    section.element.classList.add('section--active');

    // Emitir evento
    const event = new CustomEvent('narrative:section-enter', {
      detail: { sectionId: section.config.id }
    });
    document.dispatchEvent(event);
  }

  /**
   * Cuando se sale de una sección
   */
  onSectionLeave(section) {
    section.element.classList.remove('section--active');

    // Emitir evento
    const event = new CustomEvent('narrative:section-leave', {
      detail: { sectionId: section.config.id }
    });
    document.dispatchEvent(event);
  }

  /**
   * Aplica efectos narrativos específicos
   */
  applyNarrativeEffects(section) {
    const effects = {
      hook: () => {
        // Hero: efecto dramático
        ConfigUtils.log('Efecto narrativo: Hook dramático');
      },
      'pain-points': () => {
        // Problema: tono urgente
        ConfigUtils.log('Efecto narrativo: Pain points');
      },
      benefits: () => {
        // Solución: tono esperanzador
        ConfigUtils.log('Efecto narrativo: Beneficios');
      },
      urgency: () => {
        // Promos: FOMO sutil
        ConfigUtils.log('Efecto narrativo: Urgencia/FOMO');
        this.addUrgencyEffects(section);
      }
    };

    const effect = effects[section.config.narrative];
    if (effect) {
      effect();
    }
  }

  /**
   * Agrega efectos de urgencia a promociones
   */
  addUrgencyEffects(section) {
    // Animar badges de descuento con pulse
    const badges = section.element.querySelectorAll('.promo-badge');
    badges.forEach((badge, index) => {
      setTimeout(() => {
        badge.classList.add('badge--pulse');
      }, index * 100);
    });
  }

  /**
   * Actualiza la sección actual visible
   */
  updateCurrentSection() {
    // Encontrar sección más visible
    let maxVisibility = 0;
    let mostVisibleSection = null;

    this.sections.forEach(section => {
      if (section.isVisible) {
        const rect = section.element.getBoundingClientRect();
        const visibility = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleSection = section;
        }
      }
    });

    if (mostVisibleSection && mostVisibleSection !== this.currentSection) {
      this.currentSection = mostVisibleSection;

      // Emitir evento de cambio de sección
      const event = new CustomEvent('narrative:section-change', {
        detail: {
          sectionId: this.currentSection.config.id,
          narrative: this.currentSection.config.narrative
        }
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Configura el progreso de scroll
   */
  setupScrollProgress() {
    let ticking = false;

    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

      const progressFill = this.progressBar.querySelector('.reading-progress__fill');
      progressFill.style.transform = `scaleX(${scrollPercent / 100})`;

      this.progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));

      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateProgress);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /**
   * Anima la entrada del hero
   */
  animateHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Animar elementos del hero en secuencia
    const heroElements = [
      hero.querySelector('.hero-brand'),
      hero.querySelector('.hero-title'),
      hero.querySelector('.hero-subtitle'),
      hero.querySelector('.hero-cta')
    ];

    heroElements.forEach((el, index) => {
      if (el) {
        setTimeout(() => {
          el.classList.add('hero-element--visible');
        }, index * 150);
      }
    });
  }

  /**
   * Destruye el sistema de narrativa
   */
  destroy() {
    // Desconectar observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Remover barra de progreso
    if (this.progressBar) {
      this.progressBar.remove();
    }

    this.sections.clear();
    this.isInitialized = false;
  }
}

// Instancia singleton
let narrativeInstance = null;

/**
 * Inicializa la narrativa con scroll
 */
export function initScrollNarrative() {
  if (!narrativeInstance) {
    narrativeInstance = new ScrollNarrative();
    narrativeInstance.init();
  }
  return narrativeInstance;
}

/**
 * Obtiene la instancia de narrativa
 */
export function getNarrativeInstance() {
  return narrativeInstance;
}

export default ScrollNarrative;
