const CTA_ARROW = `
  <svg viewBox="0 0 20 20" class="payment-cta-icon" aria-hidden="true" focusable="false">
    <path d="M4 10h12" />
    <path d="M11 5l5 5-5 5" />
  </svg>
`;

let logoCounter = 0;
const uniqueId = prefix => `${prefix}-${++logoCounter}`;

const createCodiLogo = () => {
  const gradId = uniqueId('codi-grad');
  const shineId = uniqueId('codi-shine');
  return `
    <svg class="payment-svg payment-svg--codi" viewBox="0 0 120 48" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#2563eb">
            <animate attributeName="offset" values="0;1;0" dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stop-color="#38bdf8">
            <animate attributeName="offset" values="1;0;1" dur="6s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        <linearGradient id="${shineId}" x1="-40" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="rgba(255,255,255,0)" />
          <stop offset="50%" stop-color="rgba(255,255,255,0.65)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="116" height="44" rx="12" fill="url(#${gradId})" opacity="0.92" />
      <text x="18" y="30" class="codi-text">CoDi</text>
      <path
        class="codi-orbit"
        d="M88 12c8 0 14 6 14 14s-6 14-14 14-14-6-14-14"
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        stroke-width="2"
        stroke-linecap="round"
      />
      <circle class="codi-node" cx="88" cy="12" r="4" fill="#fff" />
      <rect class="codi-shine" x="0" y="0" width="40" height="48" fill="url(#${shineId})" />
    </svg>
  `;
};

const createSpeiLogo = () => {
  const gradId = uniqueId('spei-grad');
  return `
    <svg class="payment-svg payment-svg--spei" viewBox="0 0 120 48" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="120" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0ea5e9" />
          <stop offset="45%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="116" height="44" rx="12" fill="#02121f" opacity="0.8" />
      <text x="16" y="30" class="spei-text">SPEI</text>
      <path
        class="spei-wave"
        d="M30 34c8-8 18-12 30-12s22 4 30 12"
        fill="none"
        stroke="url(#${gradId})"
        stroke-width="3"
        stroke-linecap="round"
      />
      <path
        class="spei-arrow"
        d="M82 18l12 6-12 6"
        fill="none"
        stroke="#10b981"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
};

const createClipLogo = () => {
  const gradId = uniqueId('clip-grad');
  return `
    <svg class="payment-svg payment-svg--clip" viewBox="0 0 120 48" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="120" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fb923c" />
          <stop offset="100%" stop-color="#f97316" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="116" height="44" rx="12" fill="#1f0f07" opacity="0.8" />
      <path
        class="clip-curve"
        d="M22 30c6-8 16-12 26-12s20 4 26 12"
        fill="none"
        stroke="url(#${gradId})"
        stroke-width="4"
        stroke-linecap="round"
      />
      <text x="18" y="32" class="clip-text">clip</text>
      <circle class="clip-dot" cx="94" cy="20" r="6" fill="#fb923c" />
    </svg>
  `;
};

const createCashLogo = () => {
  const gradId = uniqueId('cash-grad');
  return `
    <svg class="payment-svg payment-svg--cash" viewBox="0 0 120 48" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#22c55e" />
          <stop offset="100%" stop-color="#16a34a" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="116" height="44" rx="12" fill="#041407" opacity="0.85" />
      <rect x="18" y="12" width="84" height="24" rx="8" fill="url(#${gradId})" class="cash-card" />
      <circle cx="40" cy="24" r="6" fill="#04290f" opacity="0.6" />
      <text x="56" y="29" class="cash-text">$</text>
      <path
        class="cash-shine"
        d="M20 18h12"
        stroke="#bbf7d0"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;
};

export const METHODS = [
  {
    code: 'CODI',
    label: 'CoDi® QR inmediato',
    chip: 'Favorito 2025',
    note: 'Escaneas con tu app bancaria, confirmas en segundos y liberamos la producción.',
    bullets: [
      '0% comisiones y validación directa de Banxico.',
      'Link personalizado por WhatsApp o correo.',
      'Recibo digital en el mismo momento.'
    ],
    cta: 'Solicitar mi QR CoDi',
    accent: {
      base: '#38bdf8',
      strong: '#2563eb',
      soft: 'rgba(59, 130, 246, 0.18)'
    },
    logo: createCodiLogo,
    logoLabel: 'Logotipo oficial de CoDi'
  },
  {
    code: 'TRANSFER',
    label: 'Transferencia SPEI 24/7',
    chip: 'Sin comisión',
    note: 'Enviamos la CLABE empresarial y confirmamos la aplicación en minutos.',
    bullets: [
      'Reportamos el comprobante para bloquear tu turno de impresión.',
      'Conciliación automática con referencia personalizada.',
      'Disponible todos los días, incluido fin de semana.'
    ],
    cta: 'Compartir CLABE segura',
    accent: {
      base: '#2dd4bf',
      strong: '#0f766e',
      soft: 'rgba(45, 212, 191, 0.2)'
    },
    logo: createSpeiLogo,
    logoLabel: 'Logotipo oficial de SPEI'
  },
  {
    code: 'CARD_CLIP',
    label: 'Tarjeta con Clip®',
    chip: 'Visa · Mastercard · AMEX',
    note: 'Pagas presencial o con link. Recibo instantáneo y sin recargos extra.',
    bullets: [
      'Aceptamos tarjetas físicas y wallets digitales.',
      'Terminal contactless higiénica y certificada.',
      'Tickets y facturación con un clic.'
    ],
    cta: 'Generar link Clip',
    accent: {
      base: '#fb923c',
      strong: '#f97316',
      soft: 'rgba(251, 146, 60, 0.22)'
    },
    logo: createClipLogo,
    logoLabel: 'Logotipo oficial de Clip'
  },
  {
    code: 'CASH',
    label: 'Efectivo con recibo digital',
    chip: 'Entrega local',
    note: 'Liquida al recoger en taller o evento, con comprobante electrónico.',
    bullets: [
      'Reservas con anticipo y terminas al recibir.',
      'Firmamos entrega con código de verificación.',
      'Ideal para compras grupales o empresariales.'
    ],
    cta: 'Agendar entrega en efectivo',
    accent: {
      base: '#34d399',
      strong: '#16a34a',
      soft: 'rgba(52, 211, 153, 0.22)'
    },
    logo: createCashLogo,
    logoLabel: 'Icono de efectivo garantizado'
  }
];

export function renderPayments() {
  const root = document.getElementById('pagos');
  if (!root) return;

  root.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container payments-grid';

  const hero = document.createElement('div');
  hero.className = 'payments-hero';
  hero.innerHTML = `
    <div class="payments-copy" data-animate="fade-up">
      <p class="payments-eyebrow">Pagos sin fricción</p>
      <h2 class="section-title payments-title" id="pagos-title">Métodos de pago que inspiran confianza</h2>
      <p class="payments-subtitle">
        Elige la alternativa que más te acomode: todas mantienen tus datos seguros y bloquean tu lugar en producción.
      </p>
      <ul class="payments-benefits" role="list">
        <li><strong>Protección bancaria</strong> con protocolos oficiales CoDi y SPEI.</li>
        <li><strong>Experiencia asistida</strong> te guiamos paso a paso vía WhatsApp o videollamada.</li>
        <li><strong>Garantía anti-sorpresas</strong> sin cargos ocultos ni incrementos de último minuto.</li>
      </ul>
      <div class="payments-guarantee" role="note">
        💡 Anticipa tu pago hoy y aseguramos el slot de impresión para la fecha que necesitas.
      </div>
    </div>
    <aside class="payments-trust" aria-label="Indicadores de seguridad" data-animate="fade-up">
      <div class="trust-card">
        <div class="trust-score">
          <strong>98%</strong>
          <span>clientes satisfechos</span>
        </div>
        <p>La claridad en los cobros y recibos genera recompra y recomendaciones orgánicas.</p>
        <div class="trust-secure">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3l7 4v5c0 5-3.5 9.4-7 10-3.5-.6-7-5-7-10V7l7-4z" />
            <path d="M9.5 11.5l2 2 3-4" />
          </svg>
          <span>Pagos verificados con encriptado de extremo a extremo.</span>
        </div>
      </div>
    </aside>
  `;

  const cards = document.createElement('div');
  cards.className = 'cards-grid payment-cards';
  cards.setAttribute('role', 'list');
  cards.setAttribute('aria-describedby', 'pagos-title');

  METHODS.forEach(method => {
    const card = document.createElement('article');
    card.className = 'card payment-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-animate', 'fade-up');
    card.style.setProperty('--accent', method.accent.base);
    card.style.setProperty('--accent-strong', method.accent.strong);
    card.style.setProperty('--accent-soft', method.accent.soft);
    const benefits = method.bullets
      .map(point => `<li>${point}</li>`)
      .join('');

    card.innerHTML = `
      <div class="payment-card-glow" aria-hidden="true"></div>
      <header class="payment-card-header">
        <span class="payment-chip">${method.chip}</span>
        <div class="payment-logo" aria-hidden="true">${method.logo()}</div>
        <span class="sr-only">${method.logoLabel}</span>
      </header>
      <h3 class="payment-label">${method.label}</h3>
      <p class="payment-note">${method.note}</p>
      <ul class="payment-benefits" role="list">${benefits}</ul>
      <div class="payment-cta" role="text">
        <span>${method.cta}</span>
        ${CTA_ARROW}
      </div>
    `;

    cards.appendChild(card);
  });

  const reassurance = document.createElement('div');
  reassurance.className = 'payments-assurance';
  reassurance.setAttribute('data-animate', 'fade-up');
  reassurance.innerHTML = `
    <h3>Todo pago genera comprobante oficial</h3>
    <p>Cerramos la transacción contigo en vivo: recibes confirmación y acceso al panel de seguimiento.</p>
    <div class="payments-assurance-list" role="list">
      <span role="listitem">🔒 Encriptado AES-256 y tokenización de tarjetas.</span>
      <span role="listitem">🧾 Factura CFDI disponible en menos de 24 horas.</span>
      <span role="listitem">🤝 Acompañamiento humano antes, durante y después del pago.</span>
    </div>
  `;

  container.appendChild(hero);
  container.appendChild(cards);
  container.appendChild(reassurance);
  root.appendChild(container);

  if (typeof window !== 'undefined') {
    if (typeof window.registerAnimatedElements === 'function') {
      window.registerAnimatedElements(container);
    } else {
      window.dispatchEvent(
        new CustomEvent('mahitek:register-animations', {
          detail: container
        })
      );
    }
  }
}
