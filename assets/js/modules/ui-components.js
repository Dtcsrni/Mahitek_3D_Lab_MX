/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UI COMPONENTS MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * Componentes de interfaz reutilizables y accesibles.
 * Modal, Toast, Spinner, Badge con API consistente y ARIA compliant.
 *
 * @module UIComponents
 * @version 1.0.0
 * @author Mahitek 3D Lab
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CONFIG } from './config.js';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function log(message, data = null) {
  if (CONFIG.DEBUG_MODE) {
    if (data) {
      console.log(`[UIComponents] ${message}`, data);
    } else {
      console.log(`[UIComponents] ${message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════

export class Modal {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      content: options.content || '',
      footer: options.footer || null,
      closeButton: options.closeButton !== false,
      closeOnEscape: options.closeOnEscape !== false,
      closeOnBackdrop: options.closeOnBackdrop !== false,
      size: options.size || 'medium', // small, medium, large
      className: options.className || '',
      onShow: options.onShow || null,
      onHide: options.onHide || null
    };

    this.element = null;
    this.backdrop = null;
    this.isOpen = false;
    this._boundHandlers = {};
  }

  /**
   * Crear elementos del modal
   */
  _createElement() {
    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.setAttribute('aria-hidden', 'true');

    // Modal container
    this.element = document.createElement('div');
    this.element.className = `modal modal--${this.options.size} ${this.options.className}`;
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    if (this.options.title) {
      this.element.setAttribute('aria-labelledby', 'modal-title');
    }

    // Header
    const header = document.createElement('div');
    header.className = 'modal__header';

    if (this.options.title) {
      const title = document.createElement('h2');
      title.id = 'modal-title';
      title.className = 'modal__title';
      title.textContent = this.options.title;
      header.appendChild(title);
    }

    if (this.options.closeButton) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'modal__close';
      closeBtn.setAttribute('aria-label', 'Cerrar modal');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => this.hide());
      header.appendChild(closeBtn);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'modal__body';

    if (typeof this.options.content === 'string') {
      body.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      body.appendChild(this.options.content);
    }

    // Footer (opcional)
    let footer = null;
    if (this.options.footer) {
      footer = document.createElement('div');
      footer.className = 'modal__footer';

      if (typeof this.options.footer === 'string') {
        footer.innerHTML = this.options.footer;
      } else if (this.options.footer instanceof HTMLElement) {
        footer.appendChild(this.options.footer);
      }
    }

    // Ensamblar
    this.element.appendChild(header);
    this.element.appendChild(body);
    if (footer) this.element.appendChild(footer);

    // Estilos inline mínimos (asumimos CSS externo para lo demás)
    this._applyStyles();
  }

  /**
   * Aplicar estilos base inline
   */
  _applyStyles() {
    Object.assign(this.backdrop.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: '9998',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      backdropFilter: 'blur(4px)'
    });

    Object.assign(this.element.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(0.95)',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      zIndex: '9999',
      maxWidth:
        this.options.size === 'small' ? '400px' : this.options.size === 'large' ? '800px' : '600px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      opacity: '0',
      transition: 'all 0.3s ease'
    });
  }

  /**
   * Mostrar modal
   */
  show() {
    if (this.isOpen) return;

    if (!this.element) {
      this._createElement();
    }

    // Agregar al DOM
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.element);

    // Prevenir scroll en body
    document.body.style.overflow = 'hidden';

    // Trigger animation
    requestAnimationFrame(() => {
      this.backdrop.style.opacity = '1';
      this.element.style.opacity = '1';
      this.element.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // Event listeners
    if (this.options.closeOnEscape) {
      this._boundHandlers.escape = e => {
        if (e.key === 'Escape') this.hide();
      };
      document.addEventListener('keydown', this._boundHandlers.escape);
    }

    if (this.options.closeOnBackdrop) {
      this._boundHandlers.backdrop = () => this.hide();
      this.backdrop.addEventListener('click', this._boundHandlers.backdrop);
    }

    this.isOpen = true;

    // Focus trap
    const focusable = this.element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    // Callback
    if (this.options.onShow) {
      this.options.onShow(this);
    }

    // Evento personalizado
    this.element.dispatchEvent(new CustomEvent('modal:show'));

    log('Modal shown');
  }

  /**
   * Ocultar modal
   */
  hide() {
    if (!this.isOpen) return;

    // Animación de salida
    this.backdrop.style.opacity = '0';
    this.element.style.opacity = '0';
    this.element.style.transform = 'translate(-50%, -50%) scale(0.95)';

    setTimeout(() => {
      if (this.backdrop && this.backdrop.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      // Restaurar scroll
      document.body.style.overflow = '';

      // Limpiar listeners
      if (this._boundHandlers.escape) {
        document.removeEventListener('keydown', this._boundHandlers.escape);
      }
      if (this._boundHandlers.backdrop) {
        this.backdrop.removeEventListener('click', this._boundHandlers.backdrop);
      }

      this.isOpen = false;

      // Callback
      if (this.options.onHide) {
        this.options.onHide(this);
      }

      // Evento personalizado
      if (this.element) {
        this.element.dispatchEvent(new CustomEvent('modal:hide'));
      }

      log('Modal hidden');
    }, 300);
  }

  /**
   * Destruir modal completamente
   */
  destroy() {
    this.hide();
    this.element = null;
    this.backdrop = null;
    this._boundHandlers = {};
  }

  /**
   * Actualizar contenido
   */
  updateContent(content) {
    const body = this.element?.querySelector('.modal__body');
    if (!body) return;

    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.innerHTML = '';
      body.appendChild(content);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════

export class Toast {
  static container = null;
  static toasts = [];

  constructor(options = {}) {
    this.options = {
      message: options.message || '',
      type: options.type || 'info', // info, success, warning, error
      duration: options.duration || 3000,
      position: options.position || 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center
      closeButton: options.closeButton !== false,
      onShow: options.onShow || null,
      onHide: options.onHide || null
    };

    this.element = null;
    this.timeout = null;
  }

  /**
   * Crear contenedor global de toasts (singleton)
   */
  static _ensureContainer() {
    if (!Toast.container) {
      Toast.container = document.createElement('div');
      Toast.container.className = 'toast-container';
      Toast.container.setAttribute('aria-live', 'polite');
      Toast.container.setAttribute('aria-atomic', 'true');

      Object.assign(Toast.container.style, {
        position: 'fixed',
        zIndex: '10000',
        pointerEvents: 'none'
      });

      document.body.appendChild(Toast.container);
    }
  }

  /**
   * Crear elemento del toast
   */
  _createElement() {
    this.element = document.createElement('div');
    this.element.className = `toast toast--${this.options.type}`;
    this.element.setAttribute('role', 'alert');

    // Icono según tipo
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const icon = document.createElement('span');
    icon.className = 'toast__icon';
    icon.textContent = icons[this.options.type] || icons.info;

    const message = document.createElement('span');
    message.className = 'toast__message';
    message.textContent = this.options.message;

    this.element.appendChild(icon);
    this.element.appendChild(message);

    if (this.options.closeButton) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'toast__close';
      closeBtn.setAttribute('aria-label', 'Cerrar notificación');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => this.hide());
      this.element.appendChild(closeBtn);
    }

    this._applyStyles();
  }

  /**
   * Aplicar estilos base
   */
  _applyStyles() {
    const colors = {
      info: { bg: '#3b82f6', text: '#fff' },
      success: { bg: '#10b981', text: '#fff' },
      warning: { bg: '#f59e0b', text: '#fff' },
      error: { bg: '#ef4444', text: '#fff' }
    };

    const color = colors[this.options.type] || colors.info;

    Object.assign(this.element.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: color.bg,
      color: color.text,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      marginBottom: '12px',
      minWidth: '300px',
      maxWidth: '500px',
      pointerEvents: 'auto',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s ease'
    });
  }

  /**
   * Posicionar contenedor según opción
   */
  _updateContainerPosition() {
    const positions = {
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' }
    };

    const pos = positions[this.options.position] || positions['top-right'];
    Object.assign(Toast.container.style, pos);
  }

  /**
   * Mostrar toast
   */
  show() {
    Toast._ensureContainer();

    if (!this.element) {
      this._createElement();
    }

    this._updateContainerPosition();
    Toast.container.appendChild(this.element);
    Toast.toasts.push(this);

    // Trigger animation
    requestAnimationFrame(() => {
      this.element.style.opacity = '1';
      this.element.style.transform = 'translateY(0)';
    });

    // Auto-hide
    if (this.options.duration > 0) {
      this.timeout = setTimeout(() => this.hide(), this.options.duration);
    }

    // Callback
    if (this.options.onShow) {
      this.options.onShow(this);
    }

    log(`Toast shown: ${this.options.type} - ${this.options.message}`);
  }

  /**
   * Ocultar toast
   */
  hide() {
    if (!this.element) return;

    clearTimeout(this.timeout);

    // Animación de salida
    this.element.style.opacity = '0';
    this.element.style.transform = 'translateY(-20px)';

    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      // Remover de lista
      const index = Toast.toasts.indexOf(this);
      if (index > -1) {
        Toast.toasts.splice(index, 1);
      }

      // Callback
      if (this.options.onHide) {
        this.options.onHide(this);
      }

      log('Toast hidden');
    }, 300);
  }

  /**
   * Helpers estáticos para uso rápido
   */
  static info(message, duration) {
    return new Toast({ message, type: 'info', duration }).show();
  }

  static success(message, duration) {
    return new Toast({ message, type: 'success', duration }).show();
  }

  static warning(message, duration) {
    return new Toast({ message, type: 'warning', duration }).show();
  }

  static error(message, duration) {
    return new Toast({ message, type: 'error', duration }).show();
  }

  /**
   * Ocultar todos los toasts
   */
  static hideAll() {
    [...Toast.toasts].forEach(toast => toast.hide());
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPINNER
// ═══════════════════════════════════════════════════════════════════════════

export class Spinner {
  constructor(options = {}) {
    this.options = {
      size: options.size || 'medium', // small, medium, large
      color: options.color || '#3b82f6',
      overlay: options.overlay !== false,
      message: options.message || null
    };

    this.element = null;
    this.overlay = null;
  }

  /**
   * Crear elementos
   */
  _createElement() {
    // Overlay opcional
    if (this.options.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'spinner-overlay';
      Object.assign(this.overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      });
    }

    // Spinner
    const sizes = { small: '24px', medium: '48px', large: '72px' };
    const size = sizes[this.options.size] || sizes.medium;

    this.element = document.createElement('div');
    this.element.className = 'spinner';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.setAttribute('aria-label', 'Cargando...');

    Object.assign(this.element.style, {
      width: size,
      height: size,
      border: `4px solid rgba(0, 0, 0, 0.1)`,
      borderTopColor: this.options.color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    });

    // Mensaje opcional
    if (this.options.message) {
      const message = document.createElement('p');
      message.className = 'spinner__message';
      message.textContent = this.options.message;
      Object.assign(message.style, {
        margin: '0',
        color: '#6b7280',
        fontSize: '14px'
      });

      if (this.overlay) {
        this.overlay.appendChild(this.element);
        this.overlay.appendChild(message);
      }
    } else if (this.overlay) {
      this.overlay.appendChild(this.element);
    }

    // Añadir animación CSS si no existe
    this._ensureAnimation();
  }

  /**
   * Asegurar que existe la animación spin
   */
  _ensureAnimation() {
    const styleId = 'spinner-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Mostrar spinner
   */
  show() {
    if (!this.element) {
      this._createElement();
    }

    if (this.overlay) {
      document.body.appendChild(this.overlay);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.appendChild(this.element);
    }

    log('Spinner shown');
  }

  /**
   * Ocultar spinner
   */
  hide() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      document.body.style.overflow = '';
    } else if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    log('Spinner hidden');
  }

  /**
   * Destruir
   */
  destroy() {
    this.hide();
    this.element = null;
    this.overlay = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════════════════

export class Badge {
  /**
   * Crear badge (función estática de utilidad)
   */
  static create(text, options = {}) {
    const badge = document.createElement('span');
    badge.className = `badge badge--${options.variant || 'default'}`;
    badge.textContent = escapeHTML(text);

    const colors = {
      default: { bg: '#e5e7eb', text: '#374151' },
      primary: { bg: '#3b82f6', text: '#fff' },
      success: { bg: '#10b981', text: '#fff' },
      warning: { bg: '#f59e0b', text: '#fff' },
      error: { bg: '#ef4444', text: '#fff' },
      info: { bg: '#06b6d4', text: '#fff' }
    };

    const color = colors[options.variant] || colors.default;

    Object.assign(badge.style, {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '12px',
      backgroundColor: color.bg,
      color: color.text,
      ...options.style
    });

    return badge;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  Modal,
  Toast,
  Spinner,
  Badge
};

