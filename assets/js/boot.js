// Bootstrapping de módulos ES6 sin romper app.js legacy
// Este archivo se carga como type="module" y orquesta las inicializaciones

import { initScrollNarrative } from './modules/scroll-narrative.js';
import { initSVGAnimations } from './modules/svg-animations.js';
import DataManager from './modules/data-manager.js';
import CopyBinder from './modules/copywriting-binder.js';
import UIComponents from './modules/ui-components.js';
import CONFIG, { ConfigUtils } from './modules/config.js';

// Inicialización segura tras carga del DOM
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
