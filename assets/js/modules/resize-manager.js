/**
 * Gestor centralizado de resize con throttle.
 */

const ResizeManager = {
  callbacks: new Set(),
  timeout: null,
  ticking: false,

  register(callback) {
    if (typeof callback !== 'function') return;
    this.callbacks.add(callback);
  },

  unregister(callback) {
    this.callbacks.delete(callback);
  },

  handleResize() {
    if (this.ticking) return;
    this.ticking = true;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    requestAnimationFrame(() => {
      this.timeout = setTimeout(() => {
        this.callbacks.forEach(callback => callback());
        this.ticking = false;
      }, 150);
    });
  },

  init() {
    window.addEventListener('resize', () => this.handleResize(), { passive: true });
  }
};

export default ResizeManager;
