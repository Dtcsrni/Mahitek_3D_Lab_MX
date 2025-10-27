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

  // Extraer número del target (ej: "500+" -> 500, "100%" -> 100, "24-72h" -> skip animation)
  const numMatch = target.match(/(\d+)/);
  if (!numMatch) {
    // Si no hay número (ej: "24-72h"), solo mostrar el valor
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

const onReady = () => {
  try {
    initHeroCounters();
  } catch (err) {
    console.error('[Boot] Error inicializando contadores:', err);
  }

  const taskQueue = [
    () => {
      DataManager.init();
    },
    () =>
      DataManager.preloadCritical().catch(err => {
        console.warn('[Boot] Error en precarga:', err);
      }),
    () =>
      CopyBinder.bindCopywriting().catch(err => {
        console.warn('[Boot] Error enlazando copywriting:', err);
      }),
    () => initScrollNarrative(),
    () => initSVGAnimations(),
    () => {
      window.MahitekUI = UIComponents;
      window.MahitekData = DataManager;
      ConfigUtils.log('Boot completado. Versión:', CONFIG.VERSION);
    },
  ];

  const scheduleNext = () => {
    if (taskQueue.length === 0) {
      document.documentElement.classList.add('js-modules-ready');
      return;
    }

    const runTask = () => {
      const task = taskQueue.shift();
      if (!task) return scheduleNext();

      try {
        const result = task();
        if (result && typeof result.then === 'function') {
          result.finally(scheduleNext);
          return;
        }
      } catch (err) {
        console.error('[Boot] Error en tarea diferida:', err);
      }

      scheduleNext();
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(runTask, { timeout: 800 });
    } else {
      window.setTimeout(runTask, 32);
    }
  };

  window.setTimeout(scheduleNext, 150);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady, { once: true });
} else {
  onReady();
}
