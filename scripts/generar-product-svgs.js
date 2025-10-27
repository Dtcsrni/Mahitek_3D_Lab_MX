#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'img');

const baseTemplate = (product, innerContent) => {
  const { id, title, desc, colors } = product;
  const gradientId = `${id}-bg`;
  const glowId = `${id}-glow`;
  const gridId = `${id}-grid`;
  const sparkleId = `${id}-sparkle`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${title}</title>
  <desc id="${id}-desc">${desc}</desc>
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bgStart}" />
      <stop offset="100%" stop-color="${colors.bgEnd}" />
    </linearGradient>
    <radialGradient id="${glowId}" cx="50%" cy="48%" r="62%">
      <stop offset="0%" stop-color="${colors.glowCenter}" stop-opacity="0.9" />
      <stop offset="60%" stop-color="${colors.glowEdge}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${colors.glowEdge}" stop-opacity="0" />
    </radialGradient>
    <pattern id="${gridId}" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke="${colors.grid}" stroke-width="0.6" opacity="0.18" />
    </pattern>
    <filter id="${sparkleId}">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="160" height="160" rx="20" fill="url(#${gradientId})" />
  <rect width="160" height="160" rx="20" fill="url(#${gridId})" opacity="0.15" />
  <ellipse cx="80" cy="88" rx="68" ry="50" fill="url(#${glowId})" opacity="0.4">
    <animate attributeName="opacity" values="0.35;0.55;0.35" dur="6s" repeatCount="indefinite" />
  </ellipse>
  <g filter="url(#${sparkleId})">
    ${innerContent.trim()}
  </g>
  <g class="sparkles" fill="${colors.sparkle}" opacity="0.6">
    <circle cx="24" cy="32" r="2">
      <animate attributeName="opacity" values="0;1;0" dur="3.8s" repeatCount="indefinite" />
      <animate attributeName="r" values="1;3;1" dur="3.8s" repeatCount="indefinite" />
    </circle>
    <circle cx="140" cy="28" r="2.4">
      <animate attributeName="opacity" values="0;0.8;0" dur="4.6s" repeatCount="indefinite" />
      <animate attributeName="r" values="1.5;3;1.5" dur="4.6s" repeatCount="indefinite" />
    </circle>
    <circle cx="132" cy="134" r="2">
      <animate attributeName="opacity" values="0;1;0" dur="5s" repeatCount="indefinite" />
      <animate attributeName="r" values="1;2.6;1" dur="5s" repeatCount="indefinite" />
    </circle>
  </g>
</svg>`;
};

const keychainBase = ({ ring, charmFill, accent, detail }) => `
  <g transform="translate(80 40)" stroke="${ring}" stroke-width="4" fill="none">
    <circle r="16" />
    <path d="M0 16 L0 34" stroke-width="3" stroke-linecap="round">
      <animate attributeName="d" values="M0 16 L0 34; M0 16 L4 32; M0 16 L0 34; M0 16 L-4 32; M0 16 L0 34" dur="5.5s" repeatCount="indefinite" />
    </path>
  </g>
  <g transform="translate(80 94)" fill="${charmFill}" stroke="${accent}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    ${detail}
  </g>
`;

const createFace = ({ eye, mouth, scar, fill }) => `
  <circle cx="0" cy="0" r="24" fill="${fill}" opacity="0.92" />
  <circle cx="-8" cy="-4" r="4.5" fill="${eye}" />
  <circle cx="10" cy="-2" r="4" fill="${eye}" />
  <path d="M-10 10 Q0 16 10 10" stroke="${mouth}" stroke-width="3" fill="none" />
  ${scar || ''}
`;

const iconGenerators = {
  'product-llavero-zombie': colors => {
    const scar = `<path d="M-18 -8 L-26 -14" stroke="${colors.accent}" stroke-width="2.5" />`;
    return keychainBase({
      ring: colors.accent,
      charmFill: '#123524',
      accent: colors.highlight,
      detail: `${createFace({ eye: colors.highlight, mouth: colors.glowEdge, scar, fill: '#1ec978' })}
        <path d="M-14 4 l28 -8" stroke="${colors.highlight}" stroke-width="2" opacity="0.6" />`
    });
  },
  'product-llavero-chimuelo': colors => {
    return keychainBase({
      ring: colors.accent,
      charmFill: '#0d1c2b',
      accent: colors.highlight,
      detail: `
        <path d="M0 -20 Q16 -18 18 -4 Q20 16 0 24 Q-20 16 -18 -4 Q-16 -18 0 -20" fill="#0f2b3f" />
        <path d="M-8 -6 Q0 -12 8 -6" stroke="${colors.highlight}" stroke-width="3" fill="none" />
        <path d="M-10 6 Q0 14 10 6" stroke="#55f6ff" stroke-width="3" fill="none" />
        <circle cx="-6" cy="-4" r="4" fill="#55f6ff" />
        <circle cx="6" cy="-4" r="4" fill="#55f6ff" />
        <path d="M-18 2 C-12 18 12 18 18 2" stroke="#55f6ff" stroke-width="2.4" fill="none" />`
    });
  },
  'product-colgante-quetzal': colors => `
    <g transform="translate(80 86)">
      <path d="M-36 -10 Q-8 -28 10 -16 Q24 -8 28 6 Q18 0 6 -2" fill="${colors.detail}" opacity="0.7" />
      <path d="M-6 -38 Q12 -44 24 -26 Q30 -14 18 -4" fill="${colors.highlight}" opacity="0.8" />
      <path d="M-6 -38 Q-20 -28 -24 -8 Q-28 12 -6 32" fill="${colors.feather || '#34d399'}" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" values="-4 0 20;4 0 20;-4 0 20" dur="5s" repeatCount="indefinite" />
      </path>
      <circle cx="-8" cy="-18" r="10" fill="#0f172a" stroke="${colors.highlight}" stroke-width="3" />
      <circle cx="-10" cy="-20" r="2.5" fill="${colors.sparkle}" />
      <path d="M-20 6 Q-4 40 6 52" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round" opacity="0.6">
        <animate attributeName="stroke-width" values="4;6;4" dur="4.5s" repeatCount="indefinite" />
      </path>
    </g>
  `,
  'product-figura-tux': colors => `
    <g transform="translate(80 92)">
      <ellipse cx="0" cy="32" rx="34" ry="10" fill="#0b1522" opacity="0.25" />
      <path d="M0 -44 C26 -44 32 -10 32 0 C32 20 10 36 0 36 C-10 36 -32 20 -32 0 C-32 -10 -26 -44 0 -44" fill="#0f1f32" stroke="${colors.highlight}" stroke-width="2.4" />
      <circle cx="-10" cy="-12" r="6" fill="#fff" />
      <circle cx="10" cy="-12" r="6" fill="#fff" />
      <circle cx="-8.5" cy="-12" r="2.5" fill="#1f2937" />
      <circle cx="8.5" cy="-12" r="2.5" fill="#1f2937" />
      <path d="M-4 0 Q0 -8 4 0" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round" />
      <path d="M-18 8 Q0 22 18 8" fill="${colors.detail}" opacity="0.8" />
      <path d="M-26 4 Q-8 -10 0 -2" stroke="${colors.highlight}" stroke-width="3" stroke-linecap="round" opacity="0.4" />
      <path d="M26 4 Q8 -10 0 -2" stroke="${colors.highlight}" stroke-width="3" stroke-linecap="round" opacity="0.4" />
    </g>
  `,
  'product-figura-calaverita': colors => `
    <g transform="translate(80 88)">
      <path d="M0 -48 C32 -48 40 -22 40 0 C40 20 26 32 16 32 L10 44 H-10 L-16 32 C-26 32 -40 20 -40 0 C-40 -22 -32 -48 0 -48" fill="#fff7f2" stroke="${colors.accent}" stroke-width="2.8" />
      <circle cx="-12" cy="-12" r="8" fill="#0f172a" />
      <circle cx="12" cy="-12" r="8" fill="#0f172a" />
      <path d="M-18 8 Q0 26 18 8" stroke="${colors.highlight}" stroke-width="4" stroke-linecap="round" />
      <path d="M-18 -28 L-22 -34" stroke="${colors.highlight}" stroke-width="3" />
      <path d="M18 -28 L22 -34" stroke="${colors.highlight}" stroke-width="3" />
      <circle cx="0" cy="4" r="6" fill="${colors.detail}" opacity="0.85" />
    </g>
  `,
  'product-fidget-zombie': colors => `
    <g transform="translate(80 90)">
      <circle cx="0" cy="32" r="28" fill="#0a1724" opacity="0.18" />
      <g>
        <circle cx="0" cy="0" r="32" fill="#0f241d" stroke="${colors.highlight}" stroke-width="3" />
        <circle cx="0" cy="0" r="12" fill="#1ec978" />
        <g fill="${colors.detail}">
          <circle cx="0" cy="-20" r="6" />
          <circle cx="17.3" cy="10" r="6" />
          <circle cx="-17.3" cy="10" r="6" />
        </g>
        <g stroke="${colors.accent}" stroke-width="3">
          <path d="M0 -20 L0 20" />
          <path d="M-17 10 L17 10" />
        </g>
      </g>
      <animateTransform attributeName="transform" type="rotate" values="0 80 90;360 80 90" dur="6s" repeatCount="indefinite" />
    </g>
  `,
  'product-soporte-audifonos': colors => `
    <g transform="translate(80 96)">
      <rect x="-20" y="34" width="40" height="10" rx="5" fill="#0f172a" opacity="0.3" />
      <path d="M-30 -36 Q0 -52 30 -36 L20 36 H-20 Z" fill="#101f33" stroke="${colors.highlight}" stroke-width="2.6" />
      <path d="M-18 -30 Q0 -40 18 -30" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" />
      <path d="M-24 10 Q0 24 24 10" stroke="${colors.detail}" stroke-width="6" stroke-linecap="round" />
      <path d="M-16 36 L-16 -12" stroke="${colors.highlight}" stroke-width="3" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
      </path>
      <path d="M16 36 L16 -12" stroke="${colors.highlight}" stroke-width="3" opacity="0.6">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="4s" repeatCount="indefinite" />
      </path>
    </g>
  `,
  'product-porta-celular': colors => `
    <g transform="translate(80 100)">
      <rect x="-18" y="32" width="36" height="8" rx="4" fill="#0f172a" opacity="0.25" />
      <rect x="-28" y="-40" width="56" height="80" rx="10" fill="#0c1a2b" stroke="${colors.highlight}" stroke-width="3" />
      <rect x="-20" y="-32" width="40" height="50" rx="6" fill="#111d32" />
      <circle cx="0" cy="26" r="4" fill="${colors.highlight}" />
      <path d="M-30 20 L30 20" stroke="${colors.accent}" stroke-width="6" stroke-linecap="round" opacity="0.6" />
      <path d="M-28 16 L28 4" stroke="${colors.detail}" stroke-width="4" stroke-linecap="round" opacity="0.5" />
    </g>
  `,
  'product-organizador-cables': colors => `
    <g transform="translate(80 96)">
      <rect x="-44" y="30" width="88" height="12" rx="6" fill="#0b1a24" opacity="0.25" />
      <rect x="-40" y="-24" width="80" height="40" rx="14" fill="#102230" stroke="${colors.highlight}" stroke-width="3" />
      <path d="M-30 -2 Q-16 -20 0 -6 Q16 8 30 -4" stroke="${colors.accent}" stroke-width="5" fill="none">
        <animate attributeName="d" values="M-30 -2 Q-16 -20 0 -6 Q16 8 30 -4; M-30 4 Q-16 -12 0 -2 Q16 12 30 2; M-30 -2 Q-16 -20 0 -6 Q16 8 30 -4" dur="5s" repeatCount="indefinite" />
      </path>
      <rect x="-26" y="-12" width="52" height="24" rx="8" fill="#111d2e" opacity="0.7" />
    </g>
  `,
  'product-clip-multi': colors => `
    <g transform="translate(80 94)">
      <path d="M-32 -32 H20 C32 -32 40 -24 40 -12 V28 C40 40 32 48 20 48 H-12 C-24 48 -32 40 -32 28 Z" fill="#102033" stroke="${colors.highlight}" stroke-width="3" />
      <path d="M-26 -24 H14 C22 -24 28 -18 28 -10 V24 C28 32 22 38 14 38 H-6 C-14 38 -20 32 -20 24 V-10 C-20 -18 -14 -24 -6 -24" stroke="${colors.accent}" stroke-width="6" fill="none" />
      <path d="M-18 14 H10" stroke="${colors.detail}" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <path d="M-18 0 H18" stroke="${colors.detail}" stroke-width="4" stroke-linecap="round" opacity="0.35" />
    </g>
  `,
  'product-gancho-universal': colors => `
    <g transform="translate(80 88)">
      <path d="M0 -44 C28 -44 36 -24 36 -8 C36 8 26 18 12 18 H-6 C-18 18 -26 28 -26 38 C-26 50 -16 60 -4 60" stroke="${colors.highlight}" stroke-width="10" stroke-linecap="round" fill="none" />
      <path d="M0 -44 C-28 -44 -36 -24 -36 -8 C-36 4 -30 12 -20 16" stroke="${colors.accent}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.6" />
      <circle cx="-4" cy="60" r="6" fill="${colors.accent}" />
    </g>
  `,
  'product-sujetapuerta': colors => `
    <g transform="translate(80 96)">
      <polygon points="-40 30 40 0 40 44 -40 44" fill="#0f1f33" stroke="${colors.highlight}" stroke-width="3" />
      <polygon points="-36 30 36 4 36 40 -36 40" fill="${colors.detail}" opacity="0.6" />
      <path d="M-20 24 L20 10" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round" opacity="0.5" />
      <path d="M-10 32 L10 24" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round" opacity="0.5" />
    </g>
  `,
  'product-portallaves': colors => `
    <g transform="translate(80 92)">
      <rect x="-44" y="-28" width="88" height="40" rx="12" fill="#102132" stroke="${colors.highlight}" stroke-width="3" />
      <g fill="none" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round">
        <path d="M-24 12 V24" />
        <path d="M0 12 V24" />
        <path d="M24 12 V24" />
      </g>
      <g fill="${colors.detail}" opacity="0.9">
        <circle cx="-24" cy="28" r="6" />
        <circle cx="0" cy="28" r="6" />
        <circle cx="24" cy="28" r="6" />
      </g>
      <path d="M-34 -12 H34" stroke="${colors.highlight}" stroke-width="3" stroke-linecap="round" opacity="0.4" />
    </g>
  `,
  'product-soporte-control': colors => `
    <g transform="translate(80 94)">
      <ellipse cx="0" cy="38" rx="40" ry="12" fill="#0a1724" opacity="0.22" />
      <path d="M-40 -8 C-32 -28 -14 -36 0 -36 C14 -36 32 -28 40 -8 V30 H-40 Z" fill="#0f2133" stroke="${colors.highlight}" stroke-width="3" />
      <rect x="-24" y="-20" width="48" height="24" rx="10" fill="#101f33" />
      <circle cx="-16" cy="-6" r="6" fill="${colors.detail}" />
      <circle cx="16" cy="-6" r="6" fill="${colors.detail}" />
      <path d="M-6 6 H6" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round" />
      <path d="M0 0 V12" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round" />
    </g>
  `,
  'product-iot-box': colors => `
    <g transform="translate(80 92)">
      <rect x="-36" y="-20" width="72" height="44" rx="10" fill="#111f2f" stroke="${colors.highlight}" stroke-width="3" />
      <rect x="-30" y="-14" width="60" height="20" rx="6" fill="#0f1725" opacity="0.8" />
      <g stroke="${colors.detail}" stroke-width="3" stroke-linecap="round">
        <path d="M-24 12 H-10" />
        <path d="M-24 20 H-10" opacity="0.6" />
        <path d="M10 12 H24" />
        <path d="M10 20 H24" opacity="0.6" />
      </g>
      <circle cx="0" cy="4" r="6" fill="${colors.accent}" opacity="0.8">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>
  `,
  'product-llavero-calaverita-pla': colors => {
    const scar = `<path d="M-14 -20 L-20 -26" stroke="${colors.highlight}" stroke-width="2" />`;
    return keychainBase({
      ring: colors.accent,
      charmFill: '#1b1d29',
      accent: colors.highlight,
      detail: `${createFace({ eye: colors.highlight, mouth: colors.accent, scar, fill: '#ffd6a5' })}
        <path d="M-12 16 Q0 24 12 16" stroke="${colors.accent}" stroke-width="3" fill="none" />`
    });
  },
  'product-maceta-mini': colors => `
    <g transform="translate(80 94)">
      <ellipse cx="0" cy="40" rx="32" ry="10" fill="#0a1724" opacity="0.2" />
      <path d="M-28 -14 H28 L22 28 H-22 Z" fill="#2f261f" stroke="${colors.highlight}" stroke-width="3" />
      <path d="M-24 -14 Q0 -26 24 -14" fill="#3b2f24" />
      <g>
        <path d="M0 -32 C-8 -32 -12 -20 -10 -6" stroke="${colors.highlight}" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M0 -32 C8 -32 12 -20 10 -6" stroke="${colors.highlight}" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M-6 -22 Q-16 -30 -18 -16" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round" fill="none" />
        <path d="M6 -22 Q16 -30 18 -16" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round" fill="none" />
      </g>
      <circle cx="0" cy="-8" r="10" fill="${colors.detail}" opacity="0.8" />
    </g>
  `,
  'product-topper-pastel': colors => `
    <g transform="translate(80 90)">
      <path d="M0 -50 L12 -14 L48 -14 L18 8 L30 42 L0 20 L-30 42 L-18 8 L-48 -14 L-12 -14 Z" fill="${colors.highlight}" stroke="${colors.accent}" stroke-width="3" />
      <line x1="0" y1="20" x2="0" y2="60" stroke="${colors.accent}" stroke-width="6" stroke-linecap="round" />
      <line x1="0" y1="20" x2="0" y2="60" stroke="${colors.detail}" stroke-width="2" stroke-linecap="round" opacity="0.6" />
      <circle cx="0" cy="-50" r="6" fill="${colors.sparkle}" />
    </g>
  `,
  'product-adorno-estrella': colors => `
    <g transform="translate(80 88)">
      <path d="M0 -48 L14 -16 L46 -16 L20 6 L30 38 L0 18 L-30 38 L-20 6 L-46 -16 L-14 -16 Z" fill="${colors.detail}" stroke="${colors.highlight}" stroke-width="3" />
      <circle cx="0" cy="-60" r="6" fill="${colors.accent}" />
      <path d="M0 -54 V-40" stroke="${colors.accent}" stroke-width="4" stroke-linecap="round">
        <animate attributeName="stroke-width" values="4;6;4" dur="3.5s" repeatCount="indefinite" />
      </path>
    </g>
  `,
};

const products = [
  {
    id: 'product-llavero-zombie',
    title: 'Llavero Zombie PETG',
    desc: 'Llavero estilo zombie con detalles fluorescentes, impreso en PETG resistente.',
    colors: {
      bgStart: '#041f1d',
      bgEnd: '#072b32',
      glowCenter: '#1ec978',
      glowEdge: '#0f172a',
      grid: '#24f3c8',
      accent: '#24f3c8',
      highlight: '#72ffd7',
      sparkle: '#9bffec',
      detail: '#1ec978',
    },
  },
  {
    id: 'product-llavero-chimuelo',
    title: 'Llavero Chimuelo',
    desc: 'Mini dragón chimuelo articulado en formato llavero, ideal para fans.',
    colors: {
      bgStart: '#041627',
      bgEnd: '#0a243f',
      glowCenter: '#2dd4ff',
      glowEdge: '#0f172a',
      grid: '#38bdf8',
      accent: '#38bdf8',
      highlight: '#60eaff',
      sparkle: '#a5f3ff',
      detail: '#1c64f2',
    },
  },
  {
    id: 'product-colgante-quetzal',
    title: 'Colgante Quetzal',
    desc: 'Colgante inspirado en el quetzal con plumas dinámicas y acabado brillante.',
    colors: {
      bgStart: '#061520',
      bgEnd: '#0d2b2b',
      glowCenter: '#34d399',
      glowEdge: '#0b1817',
      grid: '#22c55e',
      accent: '#34d399',
      highlight: '#5eead4',
      sparkle: '#befae3',
      detail: '#0ea5e9',
      feather: '#16a34a',
    },
  },
  {
    id: 'product-figura-tux',
    title: 'Figura Tux Linux',
    desc: 'Figura coleccionable de Tux el pingüino, impresa con alta definición.',
    colors: {
      bgStart: '#050e1a',
      bgEnd: '#0b1e31',
      glowCenter: '#38bdf8',
      glowEdge: '#0f172a',
      grid: '#1d4ed8',
      accent: '#38bdf8',
      highlight: '#93c5fd',
      sparkle: '#bfdbfe',
      detail: '#facc15',
    },
  },
  {
    id: 'product-figura-calaverita',
    title: 'Figura Calaverita',
    desc: 'Calaverita decorativa estilo Día de Muertos con detalles suaves.',
    colors: {
      bgStart: '#1f0d19',
      bgEnd: '#290f2b',
      glowCenter: '#f472b6',
      glowEdge: '#160715',
      grid: '#fb7185',
      accent: '#fb7185',
      highlight: '#fbcfe8',
      sparkle: '#fecdd3',
      detail: '#f97316',
    },
  },
  {
    id: 'product-fidget-zombie',
    title: 'Fidget Zombie',
    desc: 'Spinner fidget zombie con ejes reforzados y colores neon.',
    colors: {
      bgStart: '#021d16',
      bgEnd: '#062826',
      glowCenter: '#14b8a6',
      glowEdge: '#03100f',
      grid: '#0d9488',
      accent: '#14b8a6',
      highlight: '#5eead4',
      sparkle: '#a7f3d0',
      detail: '#10b981',
    },
  },
  {
    id: 'product-soporte-audifonos',
    title: 'Soporte para audífonos',
    desc: 'Soporte estable para audífonos con líneas futuristas.',
    colors: {
      bgStart: '#041426',
      bgEnd: '#091f3a',
      glowCenter: '#60a5fa',
      glowEdge: '#07122a',
      grid: '#2563eb',
      accent: '#60a5fa',
      highlight: '#c7d2fe',
      sparkle: '#e0e7ff',
      detail: '#38bdf8',
    },
  },
  {
    id: 'product-porta-celular',
    title: 'Soporte para celular',
    desc: 'Soporte plegable para smartphone con soporte antideslizante.',
    colors: {
      bgStart: '#0a1226',
      bgEnd: '#141f3b',
      glowCenter: '#818cf8',
      glowEdge: '#090f24',
      grid: '#6366f1',
      accent: '#a855f7',
      highlight: '#c7d2fe',
      sparkle: '#e9d5ff',
      detail: '#f97316',
    },
  },
  {
    id: 'product-organizador-cables',
    title: 'Organizador de cables',
    desc: 'Organizador compacto para cables, evita enredos y cuida tus dispositivos.',
    colors: {
      bgStart: '#04181e',
      bgEnd: '#08262d',
      glowCenter: '#38bdf8',
      glowEdge: '#03161c',
      grid: '#0ea5e9',
      accent: '#0ea5e9',
      highlight: '#7dd3fc',
      sparkle: '#bae6fd',
      detail: '#22d3ee',
    },
  },
  {
    id: 'product-clip-multi',
    title: 'Clip multiusos',
    desc: 'Clip multiusos impreso en 3D para asegurar cables o documentos.',
    colors: {
      bgStart: '#071321',
      bgEnd: '#0b1f32',
      glowCenter: '#7c3aed',
      glowEdge: '#090f24',
      grid: '#a855f7',
      accent: '#a855f7',
      highlight: '#c4b5fd',
      sparkle: '#e9d5ff',
      detail: '#f472b6',
    },
  },
  {
    id: 'product-gancho-universal',
    title: 'Gancho universal',
    desc: 'Gancho universal de alta resistencia para colgar accesorios.',
    colors: {
      bgStart: '#041719',
      bgEnd: '#0a2824',
      glowCenter: '#34d399',
      glowEdge: '#02100f',
      grid: '#22c55e',
      accent: '#34d399',
      highlight: '#bbf7d0',
      sparkle: '#dcfce7',
      detail: '#65a30d',
    },
  },
  {
    id: 'product-sujetapuerta',
    title: 'Sujetapuerta',
    desc: 'Sujetapuerta con inclinación calculada para estabilidad y agarre.',
    colors: {
      bgStart: '#110b18',
      bgEnd: '#1e1630',
      glowCenter: '#f59e0b',
      glowEdge: '#190c23',
      grid: '#f97316',
      accent: '#f97316',
      highlight: '#fde68a',
      sparkle: '#fcd34d',
      detail: '#fb7185',
    },
  },
  {
    id: 'product-portallaves',
    title: 'Portallaves mural',
    desc: 'Soporte portallaves mural con ganchos reforzados y estilo moderno.',
    colors: {
      bgStart: '#050f21',
      bgEnd: '#0d1f33',
      glowCenter: '#60a5fa',
      glowEdge: '#071225',
      grid: '#2563eb',
      accent: '#2563eb',
      highlight: '#bfdbfe',
      sparkle: '#dbeafe',
      detail: '#f8fafc',
    },
  },
  {
    id: 'product-soporte-control',
    title: 'Soporte para control',
    desc: 'Soporte para control de videojuegos con base estable.',
    colors: {
      bgStart: '#090f1c',
      bgEnd: '#141f30',
      glowCenter: '#fb7185',
      glowEdge: '#0f172a',
      grid: '#ef4444',
      accent: '#ef4444',
      highlight: '#fca5a5',
      sparkle: '#fecaca',
      detail: '#22d3ee',
    },
  },
  {
    id: 'product-iot-box',
    title: 'Caja IoT',
    desc: 'Caja para proyectos IoT con rejillas de ventilación y puertos.',
    colors: {
      bgStart: '#021420',
      bgEnd: '#0a2633',
      glowCenter: '#38bdf8',
      glowEdge: '#03101a',
      grid: '#0284c7',
      accent: '#0ea5e9',
      highlight: '#bae6fd',
      sparkle: '#e0f2fe',
      detail: '#22d3ee',
    },
  },
  {
    id: 'product-llavero-calaverita-pla',
    title: 'Llavero Calaverita PLA',
    desc: 'Llavero calaverita ligero impreso en PLA con detalles artesanales.',
    colors: {
      bgStart: '#1f0f1a',
      bgEnd: '#2a1228',
      glowCenter: '#fda4af',
      glowEdge: '#180915',
      grid: '#fb7185',
      accent: '#fb7185',
      highlight: '#fecdd3',
      sparkle: '#ffe4e6',
      detail: '#fb7185',
    },
  },
  {
    id: 'product-maceta-mini',
    title: 'Maceta mini',
    desc: 'Maceta mini con forma estilizada, ideal para suculentas.',
    colors: {
      bgStart: '#031a17',
      bgEnd: '#052321',
      glowCenter: '#4ade80',
      glowEdge: '#03120f',
      grid: '#22c55e',
      accent: '#22c55e',
      highlight: '#bbf7d0',
      sparkle: '#dcfce7',
      detail: '#86efac',
    },
  },
  {
    id: 'product-topper-pastel',
    title: 'Topper para pastel',
    desc: 'Topper decorativo para pastel con estrella brillante.',
    colors: {
      bgStart: '#170b22',
      bgEnd: '#2a1740',
      glowCenter: '#f0abfc',
      glowEdge: '#1a0f2a',
      grid: '#e879f9',
      accent: '#e879f9',
      highlight: '#f9a8d4',
      sparkle: '#fbcfe8',
      detail: '#fde68a',
    },
  },
  {
    id: 'product-adorno-estrella',
    title: 'Adorno estrella',
    desc: 'Adorno colgante en forma de estrella con acabado holográfico.',
    colors: {
      bgStart: '#0d1024',
      bgEnd: '#171b33',
      glowCenter: '#facc15',
      glowEdge: '#0f172a',
      grid: '#fbbf24',
      accent: '#facc15',
      highlight: '#fde68a',
      sparkle: '#fef3c7',
      detail: '#fcd34d',
    },
  },
];

products.forEach(product => {
  const generator = iconGenerators[product.id];
  if (!generator) {
    console.warn(`Sin generador para ${product.id}`);
    return;
  }
  const content = generator(product.colors);
  const svg = baseTemplate(product, content);
  const outputPath = path.join(OUTPUT_DIR, `${product.id}.svg`);
  fs.writeFileSync(outputPath, svg.trim() + '\n', 'utf8');
  console.log(`Generado ${product.id}.svg`);
});
