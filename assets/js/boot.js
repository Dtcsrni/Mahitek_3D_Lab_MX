// Bootstrapping de módulos ES6 sin romper app.js legacy
// Este archivo se carga como type="module" y orquesta las inicializaciones

import { initScrollNarrative } from './modules/scroll-narrative.js';
import { initSVGAnimations } from './modules/svg-animations.js';
import CONFIG, { ConfigUtils } from './modules/config.js';

// Inicialización segura tras carga del DOM
const onReady = () => {
  try {
    // Inicializar narrativa con scroll
    initScrollNarrative();

    // Inicializar biblioteca de SVG animados
    initSVGAnimations();

    // Bandera visual en body para estilos condicionales si se requiere
    document.documentElement.classList.add('js-modules-ready');

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
