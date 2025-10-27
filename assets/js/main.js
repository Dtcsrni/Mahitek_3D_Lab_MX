import './config.js';
import { preloadStickerSvgs } from './promos.js';
import { renderPayments } from './pagos.js';

const onReady = () => {
  try {
    preloadStickerSvgs();
    renderPayments();
  } catch (e) {
    console.error('[Main] Error inicializando Promos+Pagos:', e);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady, { once: true });
} else {
  onReady();
}
