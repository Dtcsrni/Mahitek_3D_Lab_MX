/**
 * Gestión básica de idioma y textos del sistema.
 */

import CONFIG, { ConfigUtils } from './config.js';

export const TextosSistema = {
  textos: {
    'cintillo.construccion': {
      'es-MX': '⚠️ SITIO EN DESARROLLO · Próximamente funcionalidad completa · ⚠️',
      es: '⚠️ EN CONSTRUCCIÓN · Próximamente disponible · ⚠️',
      en: '⚠️ UNDER DEVELOPMENT · Coming soon · ⚠️'
    },
    'sistema.error': {
      'es-MX': 'Error al cargar',
      es: 'Error al cargar',
      en: 'Loading error'
    },
    'error.red': {
      'es-MX': 'Error de red',
      es: 'Error de red',
      en: 'Network error'
    },
    'debug.iniciado': {
      'es-MX': 'Sistema inicializado',
      es: 'Sistema inicializado',
      en: 'System ready'
    },
    'debug.productosOK': {
      'es-MX': 'Productos cargados',
      es: 'Productos cargados',
      en: 'Products loaded'
    }
  },

  obtener(clave) {
    const idioma = GestorIdioma.obtenerIdioma();
    const textos = this.textos[clave];
    if (!textos) {
      ConfigUtils.warn('Texto no encontrado:', clave);
      return clave;
    }

    return textos[idioma] || textos[idioma.split('-')[0]] || textos[CONFIG.LANG.DEFAULT] || clave;
  }
};

export const GestorIdioma = {
  obtenerIdioma() {
    try {
      const guardado = localStorage.getItem('idioma-preferido');
      if (guardado && CONFIG.LANG.SUPPORTED.includes(guardado)) {
        return guardado;
      }

      const navegador = navigator.language || navigator.userLanguage || '';
      if (navegador.toLowerCase().startsWith('es-mx')) return 'es-MX';
      if (navegador.toLowerCase().startsWith('es')) return 'es';
      if (navegador.toLowerCase().startsWith('en')) return 'en';
      return CONFIG.LANG.DEFAULT;
    } catch (_) {
      return CONFIG.LANG.DEFAULT;
    }
  },

  guardarIdioma(idioma) {
    try {
      if (CONFIG.LANG.SUPPORTED.includes(idioma)) {
        localStorage.setItem('idioma-preferido', idioma);
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  },

  actualizarCintillo() {
    const cintillo = document.querySelector('.cintillo-texto');
    if (!cintillo) return;
    const texto = TextosSistema.obtener('cintillo.construccion');
    cintillo.textContent = texto;
    cintillo.setAttribute('data-idioma', this.obtenerIdioma());
  },

  inicializar() {
    const idioma = this.obtenerIdioma();
    document.documentElement.setAttribute('lang', idioma);
    this.actualizarCintillo();
  }
};

export function initLanguage() {
  GestorIdioma.inicializar();
}
