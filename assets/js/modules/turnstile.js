/**
 * Carga compartida de Cloudflare Turnstile (evita scripts duplicados).
 */

let turnstilePromise = null;

export function loadTurnstile() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('turnstile_unavailable'));
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstilePromise) {
    return turnstilePromise;
  }

  turnstilePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile-script]');
    if (existing) {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }
      existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
      existing.addEventListener('error', () => reject(new Error('turnstile_load_failed')), {
        once: true
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-turnstile-script', 'true');
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error('turnstile_load_failed'));
    document.head.appendChild(script);
  });

  return turnstilePromise;
}
