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
   * Crea SVG de modelo 3D rotando
   */
  createModel3DRotate() {
    return `
      <svg viewBox="0 0 100 100" class="svg-3d svg-model" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="model-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--accent-cyan);stop-opacity:1" />
            <stop offset="50%" style="stop-color:var(--accent-green);stop-opacity:1" />
            <stop offset="100%" style="stop-color:var(--accent-cyan);stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Cubo 3D isométrico -->
        <g transform="translate(50, 50)">
          <!-- Cara frontal -->
          <polygon points="-15,-10 15,-10 15,20 -15,20" 
                   fill="url(#model-gradient)" opacity="0.9"/>
          
          <!-- Cara derecha -->
          <polygon points="15,-10 25,0 25,30 15,20" 
                   fill="var(--accent-cyan)" opacity="0.6"/>
          
          <!-- Cara superior -->
          <polygon points="-15,-10 15,-10 25,0 -5,0" 
                   fill="var(--accent-green)" opacity="0.7"/>
          
          <!-- Líneas de malla 3D -->
          <line x1="-15" y1="-10" x2="15" y2="20" stroke="var(--text-primary)" stroke-width="0.5" opacity="0.3"/>
          <line x1="15" y1="-10" x2="-15" y2="20" stroke="var(--text-primary)" stroke-width="0.5" opacity="0.3"/>
          
          <!-- Animación de rotación -->
          <animateTransform attributeName="transform" type="rotate"
                           from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite"/>
        </g>
        
        <!-- Sombra -->
        <ellipse cx="50" cy="85" rx="20" ry="5" fill="var(--bg-dark)" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.2;0.3" dur="8s" repeatCount="indefinite"/>
        </ellipse>
      </svg>
    `;
  }

  /**
   * Crea SVG de engranajes sincronizados
   */
  createGearsSynced() {
    return `
      <svg viewBox="0 0 200 100" class="svg-3d svg-gears" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="gear-shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Engranaje izquierdo -->
        <g transform="translate(50, 50)" filter="url(#gear-shadow)">
          <!-- Dientes del engranaje -->
          <path d="M 0,-25 L 5,-30 L 5,-20 L 10,-25 L 10,-15 L 15,-20 L 15,-10 
                   L 20,-15 L 20,-5 L 25,-10 L 25,0 L 25,10 L 20,5 L 20,15 
                   L 15,10 L 15,20 L 10,15 L 10,25 L 5,20 L 5,30 L 0,25 
                   L -5,30 L -5,20 L -10,25 L -10,15 L -15,20 L -15,10 
                   L -20,15 L -20,5 L -25,10 L -25,0 L -25,-10 L -20,-5 
                   L -20,-15 L -15,-10 L -15,-20 L -10,-15 L -10,-25 L -5,-20 L -5,-30 Z"
                fill="var(--accent-cyan)" opacity="0.8"/>
          
          <!-- Centro del engranaje -->
          <circle r="10" fill="var(--glass-bg)" stroke="var(--accent-cyan)" stroke-width="2"/>
          
          <!-- Animación de rotación -->
          <animateTransform attributeName="transform" type="rotate"
                           from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite"/>
        </g>
        
        <!-- Engranaje derecho (rota en dirección opuesta) -->
        <g transform="translate(150, 50)" filter="url(#gear-shadow)">
          <path d="M 0,-20 L 4,-24 L 4,-16 L 8,-20 L 8,-12 L 12,-16 L 12,-8 
                   L 16,-12 L 16,-4 L 20,-8 L 20,0 L 20,8 L 16,4 L 16,12 
                   L 12,8 L 12,16 L 8,12 L 8,20 L 4,16 L 4,24 L 0,20 
                   L -4,24 L -4,16 L -8,20 L -8,12 L -12,16 L -12,8 
                   L -16,12 L -16,4 L -20,8 L -20,0 L -20,-8 L -16,-4 
                   L -16,-12 L -12,-8 L -12,-16 L -8,-12 L -8,-20 L -4,-16 L -4,-24 Z"
                fill="var(--accent-green)" opacity="0.8"/>
          
          <circle r="8" fill="var(--glass-bg)" stroke="var(--accent-green)" stroke-width="2"/>
          
          <!-- Rotación inversa -->
          <animateTransform attributeName="transform" type="rotate"
                           from="0 150 50" to="-360 150 50" dur="4s" repeatCount="indefinite"/>
        </g>
        
        <!-- Línea de conexión -->
        <line x1="70" y1="50" x2="130" y2="50" 
              stroke="var(--glass-border)" stroke-width="1" stroke-dasharray="2,2" opacity="0.5"/>
      </svg>
    `;
  }

  /**
   * Crea SVG de caja de envío
   */
  createShippingBox() {
    return `
      <svg viewBox="0 0 100 100" class="svg-icon svg-shipping" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="box-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--accent-cyan);stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:var(--accent-green);stop-opacity:0.8" />
          </linearGradient>
        </defs>
        
        <!-- Caja 3D -->
        <g transform="translate(50, 40)">
          <!-- Cara frontal -->
          <polygon points="-20,0 20,0 20,30 -20,30" fill="url(#box-gradient)" opacity="0.9"/>
          
          <!-- Cara superior -->
          <polygon points="-20,0 0,-10 40,0 20,0" fill="var(--accent-green)" opacity="0.7"/>
          
          <!-- Cara derecha -->
          <polygon points="20,0 40,0 40,20 20,30" fill="var(--accent-cyan)" opacity="0.6"/>
          
          <!-- Cinta de embalaje -->
          <rect x="-20" y="10" width="40" height="3" fill="var(--accent-red)" opacity="0.6"/>
          <rect x="-2" y="0" width="4" height="30" fill="var(--accent-red)" opacity="0.6"/>
          
          <!-- Checkmark animado -->
          <g opacity="0">
            <path d="M -5,15 L 0,20 L 10,5" stroke="var(--accent-green)" 
                  stroke-width="3" stroke-linecap="round" fill="none"/>
            <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite"/>
          </g>
        </g>
        
        <!-- Animación de envío (movimiento) -->
        <animateTransform attributeName="transform" type="translate"
                         values="0,0; 5,-2; 0,0" dur="2s" repeatCount="indefinite"/>
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
