import './config.js';
import { renderPromos } from './promos.js';
import { renderPayments } from './pagos.js';
import { initCalc } from './calc.js';

const onReady = () => {
  try {
    renderPromos();
    renderPayments();
    initCalc();
  } catch (e) {
    console.error('[Main] Error inicializando Promos+Pagos:', e);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady, { once: true });
} else {
  onReady();
}
