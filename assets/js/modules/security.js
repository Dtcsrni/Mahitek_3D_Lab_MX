/**
 * Utilidades de seguridad para sanitizar texto y URLs.
 * Mantiene el render dinámico seguro frente a inyecciones.
 */

export function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sanitiza URLs para evitar javascript: u otros esquemas peligrosos.
// Por defecto permite http/https/mailto/tel y rutas relativas.
export function sanitizeURL(url, { allowRelative = true } = {}) {
  try {
    const raw = String(url || '').trim();
    if (!raw) return '#';
    const hasScheme = /^[a-zA-Z][a-zA-Z+.-]*:/.test(raw);
    if (allowRelative && !hasScheme && !raw.startsWith('//')) {
      return raw;
    }

    const base = document.baseURI || window.location.href;
    const parsed = new URL(raw, base);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (allowedProtocols.includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (_) {
    /* no-op */
  }
  return '#';
}

export function isEmojiLike(value) {
  if (!value) return false;
  const raw = String(value).trim();
  return !raw.startsWith('/') && !raw.includes('.');
}
