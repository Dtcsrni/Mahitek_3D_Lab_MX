/**
 * Schema.org JSON-LD para organización.
 */

import CONFIG from './config.js';
import { loadJSON } from './data-loader.js';

export async function initOrganizationSchema() {
  try {
    const brand = await loadJSON(CONFIG.DATA_PATHS.brand);
    const social = (brand && brand.social) || {};

    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: brand?.brand_name || 'Mahitek 3D Lab',
      url: 'https://mahitek3dlab.com/',
      logo: 'https://mahitek3dlab.com/assets/img/mark-icon.svg',
      sameAs: [social.instagram, social.facebook, social.tiktok, social.youtube].filter(Boolean),
      description:
        'Estudio creativo tecnológico en Pachuca, México. Exploramos impresión 3D con gráfica aplicada a color, piezas expresivas y prototipos con acabados cuidados.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Pachuca',
        addressRegion: 'Hidalgo',
        addressCountry: 'MX'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: brand?.contact?.email || 'armsystechno@gmail.com',
        url: 'https://m.me/mahitek3dlabmx'
      }
    };

    let script = document.getElementById('org-schema');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'org-schema';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  } catch (_) {
    /* no-op */
  }
}
