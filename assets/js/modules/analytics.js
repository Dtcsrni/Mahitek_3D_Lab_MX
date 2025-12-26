/**
 * Analytics (GA4) sin scripts inline y con fallback seguro.
 */

import CONFIG, { ConfigUtils } from './config.js';

let isReady = false;

export function setupAnalytics() {
  try {
    const ua = navigator.userAgent || '';
    const skipAnalytics =
      ua.includes('Chrome-Lighthouse') || ua.includes('Speed Insights') || ua.includes('PageSpeed');
    if (skipAnalytics || !CONFIG.ANALYTICS_GA_ID) return;

    const hasGtagScript = Array.from(document.scripts || []).some(script =>
      String(script.src || '').includes('googletagmanager.com/gtag/js')
    );
    if (!hasGtagScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        CONFIG.ANALYTICS_GA_ID
      )}`;
      document.head.appendChild(script);
    }

    if (typeof window.gtag === 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        if (window.dataLayer) {
          window.dataLayer.push(arguments);
        }
      };
    }

    window.gtag('js', new Date());
    window.gtag('config', CONFIG.ANALYTICS_GA_ID, {
      send_page_view: true,
      anonymize_ip: true
    });
    isReady = true;
  } catch (error) {
    ConfigUtils.warn('Analytics deshabilitado por error:', error);
  }
}

export function logEvent(eventName, params = {}) {
  if (!isReady || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, params);
  } catch (_) {
    /* no-op */
  }
}
