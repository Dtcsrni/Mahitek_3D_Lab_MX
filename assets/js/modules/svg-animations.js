/**
 * Gestor de animaciones SVG 3D optimizadas
 * Crea y maneja SVG animados con efectos 3D
 * @module svg-animations
 * @version 2.0.0
 */

import { ConfigUtils } from './config.js';

/**
 * Gestor de SVG animados
 */
export class SVGAnimations {
  constructor() {
    this.svgRegistry = new Map();
    this.animationControllers = new Map();
  }

  /**
   * Inicializa las animaciones SVG
   */
  init() {
    ConfigUtils.log('Inicializando animaciones SVG...');

    // Crear biblioteca de SVG animados
    this.createSVGLibrary();

    // Inyectar SVG en el DOM donde se requieran
    this.injectSVGs();

    // Iniciar animaciones
    this.startAnimations();

    ConfigUtils.log('Animaciones SVG inicializadas ✓');
  }

  /**
   * Crea la biblioteca de SVG animados
   */
  createSVGLibrary() {
    // Impresora 3D con animación layer-by-layer
    this.svgRegistry.set('printer-3d', this.createPrinter3D());

    // Filamento flow animado
    this.svgRegistry.set('filament-flow', this.createFilamentFlow());

    // Modelo 3D rotando
    this.svgRegistry.set('model-3d-rotate', this.createModel3DRotate());

    // Engranajes sincronizados
    this.svgRegistry.set('gears-synced', this.createGearsSynced());

    // Ícono de envío
    this.svgRegistry.set('shipping-box', this.createShippingBox());

    // Ícono de calidad
    this.svgRegistry.set('quality-badge', this.createQualityBadge());

    // Ícono de soporte
    this.svgRegistry.set('support-chat', this.createSupportChat());

    // Decoraciones mexicanas
    this.svgRegistry.set('nopal-animated', this.createNopalAnimated());
    this.svgRegistry.set('aztec-pattern', this.createAztecPattern());
  }

  /**
   * Crea SVG de impresora 3D con animación
   */
  createPrinter3D() {
    return `
      <svg viewBox="0 0 200 200" class="svg-3d svg-printer" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="printer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--accent-cyan);stop-opacity:1" />
            <stop offset="100%" style="stop-color:var(--accent-green);stop-opacity:1" />
          </linearGradient>
          
          <filter id="printer-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Marco de la impresora -->
        <g class="printer-frame">
          <rect x="40" y="30" width="120" height="140" rx="4" 
                fill="none" stroke="url(#printer-gradient)" stroke-width="3" opacity="0.6"/>
          <line x1="40" y1="50" x2="160" y2="50" stroke="url(#printer-gradient)" stroke-width="2" opacity="0.4"/>
          <line x1="40" y1="150" x2="160" y2="150" stroke="url(#printer-gradient)" stroke-width="2" opacity="0.4"/>
        </g>
        
        <!-- Eje Z (vertical) -->
        <g class="printer-z-axis">
          <line x1="50" y1="40" x2="50" y2="160" stroke="var(--accent-cyan)" stroke-width="2" opacity="0.5"/>
          <line x1="150" y1="40" x2="150" y2="160" stroke="var(--accent-cyan)" stroke-width="2" opacity="0.5"/>
        </g>
        
        <!-- Hotend (cabezal de impresión) - se mueve arriba/abajo -->
        <g class="printer-hotend">
          <rect x="85" y="70" width="30" height="15" rx="2" 
                fill="var(--accent-red)" opacity="0.8" filter="url(#printer-glow)"/>
          <circle cx="100" cy="90" r="3" fill="var(--accent-red)" opacity="1">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
          </circle>
          <!-- Animación del hotend subiendo/bajando -->
          <animateTransform attributeName="transform" type="translate"
                           values="0,0; 0,10; 0,20; 0,30; 0,20; 0,10; 0,0"
                           dur="6s" repeatCount="indefinite"/>
        </g>
        
        <!-- Cama de impresión -->
        <g class="printer-bed">
          <rect x="60" y="155" width="80" height="5" rx="1" 
                fill="var(--glass-bg)" stroke="var(--accent-cyan)" stroke-width="1"/>
        </g>
        
        <!-- Objeto siendo impreso (crece gradualmente) -->
        <g class="printer-object">
          <!-- Capas que aparecen progresivamente -->
          <rect x="85" y="145" width="30" height="2" fill="var(--accent-green)" opacity="0">
            <animate attributeName="opacity" values="0;1;1" dur="6s" repeatCount="indefinite"/>
          </rect>
          <rect x="85" y="140" width="30" height="2" fill="var(--accent-green)" opacity="0">
            <animate attributeName="opacity" values="0;0;1;1" dur="6s" repeatCount="indefinite"/>
          </rect>
          <rect x="85" y="135" width="30" height="2" fill="var(--accent-green)" opacity="0">
            <animate attributeName="opacity" values="0;0;0;1;1" dur="6s" repeatCount="indefinite"/>
          </rect>
          <rect x="85" y="130" width="30" height="2" fill="var(--accent-green)" opacity="0">
            <animate attributeName="opacity" values="0;0;0;0;1;1" dur="6s" repeatCount="indefinite"/>
          </rect>
          <rect x="85" y="125" width="30" height="2" fill="var(--accent-green)" opacity="0">
            <animate attributeName="opacity" values="0;0;0;0;0;1;1" dur="6s" repeatCount="indefinite"/>
          </rect>
        </g>
        
        <!-- Partículas de filamento -->
        <g class="printer-particles" opacity="0.6">
          <circle cx="100" cy="85" r="1" fill="var(--accent-cyan)">
            <animate attributeName="cy" values="85;145" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    `;
  }

  /**
   * Crea SVG de flujo de filamento
   */
  createFilamentFlow() {
    return `
      <svg viewBox="0 0 100 100" class="svg-3d svg-filament" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="filament-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:var(--accent-cyan);stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:var(--accent-green);stop-opacity:0.8" />
          </linearGradient>
        </defs>
        
        <!-- Carrete de filamento -->
        <circle cx="50" cy="30" r="20" fill="none" stroke="url(#filament-gradient)" stroke-width="4"/>
        <circle cx="50" cy="30" r="15" fill="none" stroke="url(#filament-gradient)" stroke-width="2" opacity="0.5"/>
        
        <!-- Filamento fluyendo -->
        <path d="M 50 50 Q 45 60, 50 70 Q 55 80, 50 90" 
              fill="none" stroke="url(#filament-gradient)" stroke-width="3" stroke-linecap="round">
          <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" values="0;-100" dur="2s" repeatCount="indefinite"/>
        </path>
        
        <!-- Partículas -->
        <circle cx="50" cy="50" r="2" fill="var(--accent-cyan)">
          <animate attributeName="cy" values="50;90" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="50" r="2" fill="var(--accent-green)">
          <animate attributeName="cy" values="50;90" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  /**
   * Crea SVG de modelo 3D rotando - MEJORADO
   */
  createModel3DRotate() {
    return `
      <svg viewBox="0 0 120 120" class="svg-3d svg-model" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="model-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:1" />
          </linearGradient>
          <filter id="model-glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Cubo 3D isométrico mejorado -->
        <g transform="translate(60, 60)" filter="url(#model-glow)">
          <!-- Cara frontal -->
          <polygon points="-20,-12 20,-12 20,28 -20,28" 
                   fill="url(#model-gradient)" stroke="#00d4ff" stroke-width="1.5" opacity="0.95"/>
          
          <!-- Cara derecha -->
          <polygon points="20,-12 32,0 32,40 20,28" 
                   fill="#00d4ff" stroke="#00d4ff" stroke-width="1" opacity="0.7"/>
          
          <!-- Cara superior -->
          <polygon points="-20,-12 20,-12 32,0 -8,0" 
                   fill="#10b981" stroke="#10b981" stroke-width="1" opacity="0.8"/>
          
          <!-- Detalles de grilla -->
          <line x1="-20" y1="-12" x2="20" y2="28" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
          <line x1="20" y1="-12" x2="-20" y2="28" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
          <line x1="0" y1="-12" x2="0" y2="28" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
          <line x1="-20" y1="8" x2="20" y2="8" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
          
          <!-- Puntos de vértice brillantes -->
          <circle cx="-20" cy="-12" r="2" fill="#00d4ff" opacity="0.9">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="20" cy="-12" r="2" fill="#00d4ff" opacity="0.9">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="20" cy="28" r="2" fill="#10b981" opacity="0.9">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.6s" repeatCount="indefinite"/>
          </circle>
          
          <!-- Animación de rotación suave -->
          <animateTransform attributeName="transform" type="rotate"
                           from="0 60 60" to="360 60 60" dur="12s" repeatCount="indefinite"/>
        </g>
        
        <!-- Sombra dinámica -->
        <ellipse cx="60" cy="100" rx="25" ry="6" fill="#000" opacity="0.15">
          <animate attributeName="rx" values="25;28;25" dur="12s" repeatCount="indefinite"/>
        </ellipse>
        
        <!-- Partículas orbitales -->
        <circle cx="90" cy="60" r="1.5" fill="#00d4ff" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate"
                           from="0 60 60" to="360 60 60" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="60" r="1.5" fill="#10b981" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate"
                           from="0 60 60" to="-360 60 60" dur="5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  /**
   * Crea SVG de engranajes sincronizados - MEJORADO
   */
  createGearsSynced() {
    return `
      <svg viewBox="0 0 240 120" class="svg-3d svg-gears" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="gear-shadow">
            <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
          </filter>
          <linearGradient id="gear-grad-1">
            <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="gear-grad-2">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Engranaje izquierdo (grande) -->
        <g transform="translate(70, 60)" filter="url(#gear-shadow)">
          <!-- Dientes externos -->
          <circle r="38" fill="url(#gear-grad-1)" opacity="0"/>
          <path d="M 0,-38 L 6,-44 L 6,-32 A 38 38 0 0 1 32,-19 L 38,-25 L 26,-13
                   A 38 38 0 0 1 19,32 L 25,38 L 13,26
                   A 38 38 0 0 1 -32,19 L -38,25 L -26,13
                   A 38 38 0 0 1 -19,-32 L -25,-38 L -13,-26
                   A 38 38 0 0 1 6,-44 Z"
                fill="url(#gear-grad-1)" stroke="#00d4ff" stroke-width="1" opacity="0.95"/>
          
          <!-- Círculo central -->
          <circle r="15" fill="#0c1117" stroke="#00d4ff" stroke-width="2.5"/>
          <circle r="8" fill="url(#gear-grad-1)" opacity="0.8"/>
          
          <!-- Detalles mecánicos -->
          <circle r="20" fill="none" stroke="rgba(0,212,255,0.3)" stroke-width="1"/>
          <circle r="28" fill="none" stroke="rgba(0,212,255,0.2)" stroke-width="0.5"/>
          
          <!-- Líneas radiales -->
          <line x1="0" y1="-10" x2="0" y2="-28" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          <line x1="0" y1="10" x2="0" y2="28" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          <line x1="-10" y1="0" x2="-28" y2="0" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          <line x1="10" y1="0" x2="28" y2="0" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          
          <!-- Animación de rotación horaria -->
          <animateTransform attributeName="transform" type="rotate"
                           from="0 70 60" to="360 70 60" dur="6s" repeatCount="indefinite"/>
        </g>
        
        <!-- Engranaje derecho (mediano) -->
        <g transform="translate(170, 60)" filter="url(#gear-shadow)">
          <!-- Dientes externos -->
          <path d="M 0,-28 L 4,-32 L 4,-24 A 28 28 0 0 1 24,-14 L 28,-18 L 20,-10
                   A 28 28 0 0 1 14,24 L 18,28 L 10,20
                   A 28 28 0 0 1 -24,14 L -28,18 L -20,10
                   A 28 28 0 0 1 -14,-24 L -18,-28 L -10,-20
                   A 28 28 0 0 1 4,-32 Z"
                fill="url(#gear-grad-2)" stroke="#10b981" stroke-width="1" opacity="0.95"/>
          
          <!-- Círculo central -->
          <circle r="12" fill="#0c1117" stroke="#10b981" stroke-width="2"/>
          <circle r="6" fill="url(#gear-grad-2)" opacity="0.8"/>
          
          <!-- Detalles mecánicos -->
          <circle r="16" fill="none" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
          <circle r="22" fill="none" stroke="rgba(16,185,129,0.2)" stroke-width="0.5"/>
          
          <!-- Líneas radiales -->
          <line x1="0" y1="-8" x2="0" y2="-20" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          <line x1="0" y1="8" x2="0" y2="20" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          
          <!-- Rotación antihoraria (sincronizada) -->
          <animateTransform attributeName="transform" type="rotate"
                           from="0 170 60" to="-360 170 60" dur="6s" repeatCount="indefinite"/>
        </g>
        
        <!-- Línea de conexión animada -->
        <line x1="95" y1="60" x2="145" y2="60" 
              stroke="#00d4ff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5">
          <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite"/>
        </line>
        
        <!-- Partículas de energía -->
        <circle cx="120" cy="60" r="2" fill="#00d4ff" opacity="0.8">
          <animate attributeName="cx" values="95;145" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  /**
   * Crea SVG de caja de envío - MEJORADO
   */
  createShippingBox() {
    return `
      <svg viewBox="0 0 140 140" class="svg-icon svg-shipping" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="box-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.9" />
          </linearGradient>
          <filter id="box-shadow">
            <feDropShadow dx="4" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Caja 3D -->
        <g transform="translate(70, 50)" filter="url(#box-shadow)">
          <!-- Cara frontal -->
          <polygon points="-28,5 28,5 28,50 -28,50" 
                   fill="url(#box-gradient)" stroke="#00d4ff" stroke-width="1.5" opacity="0.95"/>
          
          <!-- Cara superior -->
          <polygon points="-28,5 0,-10 56,5 28,5" 
                   fill="#10b981" stroke="#10b981" stroke-width="1" opacity="0.85"/>
          
          <!-- Cara derecha -->
          <polygon points="28,5 56,5 56,35 28,50" 
                   fill="#00d4ff" stroke="#00d4ff" stroke-width="1" opacity="0.7"/>
          
          <!-- Cinta de embalaje horizontal -->
          <rect x="-28" y="20" width="56" height="4" fill="#ff6b6b" opacity="0.85"/>
          <rect x="28" y="20" width="28" height="4" 
                transform="skewY(-25)" transform-origin="28 22" fill="#ff6b6b" opacity="0.7"/>
          
          <!-- Cinta vertical -->
          <rect x="-3" y="5" width="6" height="45" fill="#ff6b6b" opacity="0.85"/>
          <polygon points="-3,5 3,5 17,-3 11,-3" fill="#ff6b6b" opacity="0.7"/>
          
          <!-- Símbolo de envío -->
          <g transform="translate(0, 28)">
            <!-- Flecha de envío -->
            <path d="M -10,0 L 10,0 L 10,-6 L 18,2 L 10,10 L 10,4 L -10,4 Z" 
                  fill="rgba(255,255,255,0.5)" opacity="0">
              <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite"/>
            </path>
          </g>
          
          <!-- Checkmark de confirmación -->
          <g transform="translate(0, 28)" opacity="0">
            <circle r="12" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="2"/>
            <path d="M -6,0 L -2,5 L 8,-5" stroke="#10b981" 
                  stroke-width="3" stroke-linecap="round" fill="none"/>
            <animate attributeName="opacity" values="0;0;0;1;1;0" dur="3s" repeatCount="indefinite"/>
          </g>
          
          <!-- Detalles de textura -->
          <line x1="-28" y1="35" x2="28" y2="35" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
          <line x1="-15" y1="5" x2="-15" y2="50" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
          <line x1="15" y1="5" x2="15" y2="50" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
        </g>
        
        <!-- Líneas de movimiento -->
        <g opacity="0.4">
          <line x1="20" y1="60" x2="30" y2="60" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round">
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
          </line>
          <line x1="15" y1="70" x2="25" y2="70" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.3s" repeatCount="indefinite"/>
          </line>
          <line x1="20" y1="80" x2="30" y2="80" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.6s" repeatCount="indefinite"/>
          </line>
        </g>
        
        <!-- Sombra del paquete -->
        <ellipse cx="70" cy="110" rx="35" ry="8" fill="#000" opacity="0.15">
          <animate attributeName="opacity" values="0.15;0.1;0.15" dur="2s" repeatCount="indefinite"/>
        </ellipse>
        
        <!-- Animación de envío (movimiento horizontal) -->
        <animateTransform attributeName="transform" type="translate"
                         values="0,0; 8,-3; 0,0" dur="2s" repeatCount="indefinite"/>
      </svg>
    `;
  }

  /**
   * Crea SVG de badge de calidad
   */
  createQualityBadge() {
    return `
      <svg viewBox="0 0 100 100" class="svg-icon svg-quality" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="badge-gradient">
            <stop offset="0%" style="stop-color:var(--accent-green);stop-opacity:1" />
            <stop offset="100%" style="stop-color:var(--accent-cyan);stop-opacity:0.8" />
          </radialGradient>
          
          <filter id="badge-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Badge circular -->
        <circle cx="50" cy="50" r="35" fill="url(#badge-gradient)" filter="url(#badge-glow)" opacity="0.9"/>
        
        <!-- Círculo interior -->
        <circle cx="50" cy="50" r="30" fill="none" stroke="var(--text-primary)" stroke-width="2" opacity="0.3"/>
        
        <!-- Estrella central -->
        <polygon points="50,25 54,42 71,42 57,52 62,68 50,58 38,68 43,52 29,42 46,42"
                 fill="var(--text-primary)" opacity="0.9"/>
        
        <!-- Animación de pulso -->
        <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent-green)" stroke-width="2" opacity="0">
          <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  /**
   * Crea SVG de soporte/chat
   */
  createSupportChat() {
    return `
      <svg viewBox="0 0 100 100" class="svg-icon svg-support" xmlns="http://www.w3.org/2000/svg">
        <!-- Burbuja de chat -->
        <g transform="translate(50, 45)">
          <rect x="-30" y="-20" width="60" height="40" rx="8" 
                fill="var(--accent-cyan)" opacity="0.8"/>
          
          <!-- Cola de la burbuja -->
          <polygon points="-10,20 -5,30 0,20" fill="var(--accent-cyan)" opacity="0.8"/>
          
          <!-- Puntos suspensivos animados -->
          <circle cx="-12" cy="0" r="3" fill="var(--text-primary)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="0" cy="0" r="3" fill="var(--text-primary)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="12" cy="0" r="3" fill="var(--text-primary)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
          </circle>
        </g>
        
        <!-- Ícono de persona -->
        <g transform="translate(50, 75)">
          <circle cx="0" cy="0" r="8" fill="var(--accent-green)" opacity="0.8"/>
          <path d="M -10,15 Q -10,8 0,8 Q 10,8 10,15" 
                fill="var(--accent-green)" opacity="0.8"/>
        </g>
      </svg>
    `;
  }

  /**
   * Crea SVG de nopal animado
   */
  createNopalAnimated() {
    return `
      <svg viewBox="0 0 60 80" class="svg-deco svg-nopal" xmlns="http://www.w3.org/2000/svg">
        <!-- Pencas del nopal -->
        <ellipse cx="30" cy="50" rx="12" ry="20" 
                 fill="var(--accent-green)" opacity="0.4" transform="rotate(-15 30 50)">
          <animateTransform attributeName="transform" type="rotate"
                           values="-15 30 50; -10 30 50; -15 30 50" dur="3s" repeatCount="indefinite"/>
        </ellipse>
        
        <ellipse cx="30" cy="40" rx="15" ry="25" 
                 fill="var(--accent-green)" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate"
                           values="0 30 40; 5 30 40; 0 30 40" dur="4s" repeatCount="indefinite"/>
        </ellipse>
        
        <ellipse cx="30" cy="55" rx="10" ry="18" 
                 fill="var(--accent-green)" opacity="0.4" transform="rotate(15 30 55)">
          <animateTransform attributeName="transform" type="rotate"
                           values="15 30 55; 20 30 55; 15 30 55" dur="3.5s" repeatCount="indefinite"/>
        </ellipse>
        
        <!-- Espinas -->
        <g opacity="0.3">
          <line x1="20" y1="35" x2="17" y2="32" stroke="var(--text-primary)" stroke-width="1"/>
          <line x1="25" y1="30" x2="23" y2="27" stroke="var(--text-primary)" stroke-width="1"/>
          <line x1="35" y1="30" x2="37" y2="27" stroke="var(--text-primary)" stroke-width="1"/>
          <line x1="40" y1="35" x2="43" y2="32" stroke="var(--text-primary)" stroke-width="1"/>
        </g>
      </svg>
    `;
  }

  /**
   * Crea SVG de patrón azteca
   */
  createAztecPattern() {
    return `
      <svg viewBox="0 0 100 100" class="svg-deco svg-aztec" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="aztec-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="none"/>
            <path d="M 10,0 L 15,5 L 10,10 L 5,5 Z" fill="var(--accent-red)" opacity="0.3"/>
            <circle cx="10" cy="10" r="2" fill="var(--accent-cyan)" opacity="0.4"/>
          </pattern>
        </defs>
        
        <rect width="100" height="100" fill="url(#aztec-pattern)"/>
        
        <!-- Forma geométrica central -->
        <polygon points="50,20 70,40 50,80 30,40" 
                 fill="none" stroke="var(--accent-red)" stroke-width="2" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate"
                           from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite"/>
        </polygon>
      </svg>
    `;
  }

  /**
   * Inyecta SVG en elementos con data-svg
   */
  injectSVGs() {
    const svgPlaceholders = document.querySelectorAll('[data-svg]');

    svgPlaceholders.forEach(placeholder => {
      const svgName = placeholder.dataset.svg;
      const svgContent = this.svgRegistry.get(svgName);

      if (svgContent) {
        placeholder.innerHTML = svgContent;
        ConfigUtils.log(`SVG inyectado: ${svgName}`);
      } else {
        ConfigUtils.warn(`SVG no encontrado: ${svgName}`);
      }
    });
  }

  /**
   * Inicia todas las animaciones
   */
  startAnimations() {
    // Las animaciones están definidas en SVG con <animate> y <animateTransform>
    // No requieren control adicional de JavaScript
    ConfigUtils.log('Animaciones SVG iniciadas');
  }

  /**
   * Pausa todas las animaciones
   */
  pauseAnimations() {
    document.querySelectorAll('.svg-3d, .svg-icon').forEach(svg => {
      svg.pauseAnimations();
    });
  }

  /**
   * Reanuda todas las animaciones
   */
  resumeAnimations() {
    document.querySelectorAll('.svg-3d, .svg-icon').forEach(svg => {
      svg.unpauseAnimations();
    });
  }
}

// Instancia singleton
let svgInstance = null;

/**
 * Inicializa las animaciones SVG
 */
export function initSVGAnimations() {
  if (!svgInstance) {
    svgInstance = new SVGAnimations();
    svgInstance.init();
  }
  return svgInstance;
}

/**
 * Obtiene la instancia de SVG
 */
export function getSVGInstance() {
  return svgInstance;
}

export default SVGAnimations;

