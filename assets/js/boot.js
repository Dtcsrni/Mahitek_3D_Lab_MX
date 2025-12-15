// Bootstrapping de módulos ES6 sin romper app.js legacy
// Este archivo se carga como type="module" y orquesta las inicializaciones

import { initScrollNarrative } from './modules/scroll-narrative.js';
import { initSVGAnimations } from './modules/svg-animations.js';
import DataManager from './modules/data-manager.js';
import CopyBinder from './modules/copywriting-binder.js';
import UIComponents from './modules/ui-components.js';
import CONFIG, { ConfigUtils } from './modules/config.js';

// ===== CONTADOR ANIMADO PARA STATS =====
function animateCounter(element) {
  const target = element.getAttribute('data-counter');
  if (!target) return;

  // Extraer n¿mero del target (ej: "500+" -> 500, "100%" -> 100, "Plazos acordados" -> omitir animaci¿n)
  const numMatch = target.match(/(\d+)/);
  if (!numMatch) {
    // Si no hay n¿mero (ej: "Plazos acordados"), solo mostrar el valor
    element.textContent = target;
    return;
  }

  const targetNum = parseInt(numMatch[1], 10);
  const suffix = target.replace(numMatch[1], ''); // "+", "%", etc.
  const duration = 2000; // 2 segundos
  const steps = 60;
  const increment = targetNum / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(current + increment, targetNum);
    element.textContent = Math.floor(current) + suffix;

    if (step >= steps) {
      clearInterval(timer);
      element.textContent = target; // Valor final exacto
    }
  }, duration / steps);
}

function initHeroCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  // Intersection Observer para animar solo cuando son visibles
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}

// Inicializaci¿n segura tras carga del DOM
const onReady = async () => {
  try {
    // Inicializar DataManager
    DataManager.init();

    // Precarga de datos críticos (no bloqueante)
    DataManager.preloadCritical().catch(err => {
      console.warn('[Boot] Error en precarga:', err);
    });

    // Enlazar copywriting a elementos con data-copy (no bloqueante)
    CopyBinder.bindCopywriting().catch(err => {
      console.warn('[Boot] Error enlazando copywriting:', err);
    });

    // Inicializar narrativa con scroll
    initScrollNarrative();

    // Inicializar biblioteca de SVG animados
    initSVGAnimations();

    // Inicializar contadores animados del Hero
    initHeroCounters();

    // Bandera visual en body para estilos condicionales si se requiere
    document.documentElement.classList.add('js-modules-ready');

    // Exportar componentes UI a window para acceso desde app.js legacy (opcional)
    window.MahitekUI = UIComponents;
    window.MahitekData = DataManager;

    ConfigUtils.log('Boot completado. Versión:', CONFIG.VERSION);
  } catch (err) {
    console.error('[Boot] Error inicializando módulos:', err);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady, { once: true });
} else {
  onReady();
}
