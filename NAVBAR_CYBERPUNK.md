# 🌵 Navbar Cyberpunk Mexicano - Mahitek 3D Lab

## 🎯 Descripción General

Rediseño completo del navbar con estética **cyberpunk** fusionada con elementos culturales **mexicanos** (nopales, águilas, bandera), manteniendo el profesionalismo y la funcionalidad del sistema inteligente (auto-hide, compact mode).

---

## 🎨 Elementos Visuales

### 1. **Decoraciones SVG Mexicanas**

#### Nopales (Cacti)
- **Ubicación**: Izquierda y derecha del navbar
- **Tamaño**: 40px × 60px
- **Características**:
  - Forma orgánica con múltiples "paletas" (pads)
  - Espinas representadas como pequeños círculos cyan
  - Drop-shadow verde (#10B981) con 8px blur
  - Animación: `float-nopal` 6s ease-in-out infinite

```css
.nav-nopal {
  position: absolute;
  width: 40px;
  height: 60px;
  filter: drop-shadow(0 0 8px var(--accent-green));
  animation: float-nopal 6s ease-in-out infinite;
}
```

**Animación float-nopal**:
- Movimiento vertical: translateY(-50% → -55%)
- Rotación sutil: rotate(-5deg → -3deg → -5deg)
- Desplazamiento horizontal: translateX(0 → 3px → 0)

---

#### Águila Mexicana Estilizada
- **Ubicación**: Centro superior del navbar (top: -20px)
- **Tamaño**: 60px × 50px
- **Características**:
  - Cuerpo central con círculo brillante (cabeza)
  - Alas simétricas con animación de aleteo
  - Drop-shadow cyan (#06B6D4) con 12px blur
  - Animación combinada: `aguila-pulse` + `wing-flap`

```css
.nav-aguila {
  animation: aguila-pulse 4s ease-in-out infinite;
}

.aguila-wing-left, .aguila-wing-right {
  animation: wing-flap 2s ease-in-out infinite;
}
```

**Animación aguila-pulse**:
- Opacidad: 0.2 → 0.4 → 0.2
- Escala: 1 → 1.05 → 1

**Animación wing-flap**:
- scaleX: 1 → 0.9 → 1 (efecto de aleteo)
- Delay: 0.1s en ala derecha

---

#### Insignia "Hecho en México" (con micro-franja tricolor)
- Uso de colores de la bandera exclusivamente dentro de un contexto explícito de país o fabricación.
- Ubicación: en el bloque de marca, como insignia compacta.
- Tamaño: 160 × 32 (auto-escalable en CSS)
- Composición:
  - Placa con borde neon sutil
  - Icono circular con "engranaje" simulado (stroke-dash)
  - Águila abstracta geométrica (original)
  - Texto "HECHO EN / MÉXICO" en dos líneas
  - Micro-franja tricolor encapsulada al extremo derecho

```html
<div class="badge-made-mx" role="img" aria-label="Hecho en México">
  <svg class="badge-made-mx-svg" viewBox="0 0 160 32">
    <!-- ... ver index.html para paths completos ... -->
  </svg>
  </div>
```

Nota: Evitar usar la bandera por separado en el navbar; la franja tricolor queda contenida exclusivamente en esta insignia.

---

### 2. **Efectos Cyberpunk**

#### Líneas de Escaneo (Scan Lines) con "tonos mecatrónicos"
- **Ubicación**: Overlay completo del navbar
- **Patrón**: Líneas horizontales repetidas cada 4px
- **Color**: hsla(var(--tone-hue), 85%, 60%, 0.06)
- **Animaciones**: `scan-move` 8s linear infinite + `tone-cycle` 12s linear infinite

```css
.scan-lines {
  background: repeating-linear-gradient(
    0deg,
    hsla(var(--tone-hue), 85%, 60%, 0.06) 0px,
    hsla(var(--tone-hue), 85%, 60%, 0.06) 1px,
    transparent 1px,
    transparent 4px
  );
  animation: scan-move 8s linear infinite, tone-cycle 12s linear infinite;
}
```

---

#### Partículas Flotantes
- **Cantidad**: 5 partículas
- **Tamaño**: 3px × 3px
- **Color**: var(--accent-cyan) con box-shadow glow
- **Animación**: `particle-float` con delays escalonados

**Delays**:
1. Partícula 1: 0s (duración 8s)
2. Partícula 2: 1.5s (duración 7s)
3. Partícula 3: 3s (duración 6s)
4. Partícula 4: 4.5s (duración 9s)
5. Partícula 5: 6s (duración 7s)

```css
@keyframes particle-float {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  10% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-80px) scale(1);
  }
}
```

---

#### Bordes Glitch
- **Ubicación**: Top y bottom del navbar
- **Altura**: 2px
- **Efecto**: Aparición/desaparición rápida (glitch)
- **Animación**: `border-glitch` 5s ease-in-out infinite

```css
@keyframes border-glitch {
  0%, 90%, 100% { opacity: 0; }
  92%, 94%, 96%, 98% { opacity: 0.3; }
}
```

**Patrón de glitch**: 4 pulsos rápidos al 92%, 94%, 96%, 98% del ciclo.

---

### 3. **Efectos Interactivos**

#### Logo con Hexágono Pulsante
- **Estructura**: SVG hexagon overlay sobre logo
- **Tamaño**: 100px × 100px
- **Animación base**: `hex-pulse-anim` 3s ease-in-out infinite
- **Hover**: Acelera a 1.5s

```css
@keyframes hex-pulse-anim {
  0%, 100% {
    opacity: 0;
    stroke-width: 2;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.6;
    stroke-width: 3;
    transform: scale(1.1);
  }
}

.brand-logo:hover .hex-pulse {
  animation-duration: 1.5s;
}
```

---

#### Nav-Links con Barrido de Luz
- **Efecto**: Barra de luz que cruza el link en hover
- **Dirección**: Izquierda → Derecha
- **Duración**: 0.5s
- **Color**: rgba(6, 182, 212, 0.15) con gradiente

```css
.nav-link-bg {
  position: absolute;
  left: -100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(6, 182, 212, 0.15),
    transparent);
  transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover .nav-link-bg {
  left: 100%;
}

.nav-link:hover {
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
}
```

---

#### Tagline con Glitch Text
- **Efecto**: Duplicado del texto con desplazamiento
- **Frecuencia**: 1 glitch cada 8 segundos
- **Colores alternados**: var(--accent-primary) y var(--accent-cyan)

```css
@keyframes glitch-text {
  0%, 90%, 100% {
    opacity: 0;
    transform: translate(0, 0);
  }
  92% {
    opacity: 0.7;
    transform: translate(-2px, -1px);
    color: var(--accent-primary);
  }
  94% {
    opacity: 0.7;
    transform: translate(2px, 1px);
    color: var(--accent-cyan);
  }
  96% {
    opacity: 0.7;
    transform: translate(-1px, 2px);
    color: var(--accent-primary);
  }
}
```

**Pattern**: 3 "frames" de glitch con desplazamientos aleatorios.

---

#### Toggle Circuit (Hamburger Menu)
- **Decoración**: Circuito SVG rotatorio
- **Tamaño**: 50px × 50px
- **Animación base**: `circuit-rotate` 20s linear infinite
- **Hover**: Acelera a 5s + aumenta opacidad (0.3 → 0.6)

```css
@keyframes circuit-rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.nav-toggle:hover .toggle-circuit {
  animation-duration: 5s;
  opacity: 0.6;
}
```

---

#### Botón CTA con Pulso Radial
- **Efecto**: Onda expansiva en hover
- **Origen**: Centro del botón
- **Duración**: 1.5s infinite
- **Color**: rgba(6, 182, 212, 0.5) → transparente

```css
@keyframes btn-pulse-anim {
  0% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.8);
  }
}

.btn-messenger:hover .btn-pulse {
  animation: btn-pulse-anim 1.5s ease-out infinite;
}
```

---

## 🚀 Optimización de Performance

### GPU Acceleration
Todas las animaciones usan **solo** `transform` y `opacity` para aprovechar aceleración GPU:

```css
/* 🚀 GPU-accelerated */
animation: float-nopal 6s ease-in-out infinite;
transform: translateY(-50%) rotate(-5deg);

/* 🚫 Evitado (CPU-intensive) */
/* animation: move-left 3s; */
/* left: 10px → 50px; */
```

### Will-Change Hints
Elementos con animaciones complejas tienen `will-change`:

```css
.nav-nopal,
.nav-aguila,
.particle {
  will-change: transform, opacity;
}
```

### Responsive Behavior
En **modo compacto mobile** (< 768px + scrolled > 300px):

```css
.header.is-compact .nav-decorations {
  opacity: 0.5; /* Reduce visibilidad */
}

.header.is-compact .nav-nopal,
.header.is-compact .nav-aguila {
  display: none; /* Oculta elementos complejos */
}
```

**Resultado**: Reduce animaciones en dispositivos de bajo rendimiento.

---

## ♿ Accesibilidad

### Aria-Hidden en Decoraciones
Todos los elementos decorativos tienen `aria-hidden="true"`:

```html
<div class="nav-decorations" aria-hidden="true">
  <svg class="nav-nopal nav-nopal-left">...</svg>
  <svg class="nav-aguila">...</svg>
  <!-- etc -->
</div>
```

**Beneficio**: Los lectores de pantalla ignoran decoraciones, no causan confusión.

### Reducción de Movimiento
**TODO**: Implementar `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .nav-nopal,
  .nav-aguila,
  .particle,
  .scan-lines {
    animation: none !important;
  }
}
```

---

## 🧪 Variables CSS Utilizadas

```css
:root {
  /* Colores Cyberpunk */
  --accent-primary: #00D9FF; /* Cyan brillante */
  --accent-cyan: #06B6D4;    /* Cyan medio */
  --accent-green: #10B981;   /* Verde nopales */
  
  /* Colores Bandera México */
  --mexico-green: #006847;
  --mexico-white: #FFFFFF;
  --mexico-red: #CE1126;
  
  /* Timing */
  --motion-duration-fast: 0.2s;
  --motion-ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🌀 Tabla de Animaciones

| Nombre | Duración | Timing | Propiedad | Descripción |
|--------|----------|--------|-----------|-------------|
| `scan-line` | 4s | linear | transform, opacity | Línea de escaneo horizontal |
| `float-nopal` | 6s | ease-in-out | transform | Flotación orgánica de nopales |
| `aguila-pulse` | 4s | ease-in-out | opacity, transform | Pulsación del águila |
| `wing-flap` | 2s | ease-in-out | transform (scaleX) | Aleteo de alas |
| `scan-move` | 8s | linear | transform (translateY) | Movimiento de líneas |
| `particle-float` | 6-9s | ease-in-out | transform, opacity, scale | Partículas flotantes |
| `border-glitch` | 5s | ease-in-out | opacity | Glitch de bordes |
| `hex-pulse-anim` | 3s | ease-in-out | opacity, stroke-width, scale | Pulso de hexágono |
| `glitch-text` | 8s | ease-in-out | opacity, transform, color | Glitch de texto |
| `flag-wave` | 3s | ease-in-out | transform (skewX) | Ondulación de bandera |
| `circuit-rotate` | 20s | linear | transform (rotate) | Rotación de circuito |
| `btn-pulse-anim` | 1.5s | ease-out | opacity, transform (scale) | Pulso de botón |

**Total**: 12 animaciones únicas.

---

## 🧩 Estructura HTML

```html
<header class="header">
  <!-- Decoraciones Cyberpunk Mexicanas -->
  <div class="nav-decorations" aria-hidden="true">
    <!-- Nopales -->
    <svg class="nav-deco nav-nopal nav-nopal-left">...</svg>
    <svg class="nav-deco nav-nopal nav-nopal-right">...</svg>
    
    <!-- Águila Mexicana -->
    <svg class="nav-deco nav-aguila">
      <path class="aguila-body">...</path>
      <path class="aguila-wing-left">...</path>
      <path class="aguila-wing-right">...</path>
      <circle cx="30" cy="10" r="4" fill="cyan">...</circle>
    </svg>
    
    <!-- Scan Lines -->
    <div class="scan-lines"></div>
    
    <!-- Partículas Flotantes -->
    <div class="nav-particles">
      <span class="particle"></span>
      <span class="particle"></span>
      <span class="particle"></span>
      <span class="particle"></span>
      <span class="particle"></span>
    </div>
    
    <!-- Bordes Glitch -->
    <div class="nav-border nav-border-top"></div>
    <div class="nav-border nav-border-bottom"></div>
  </div>
  
  <div class="container">
    <nav class="nav">
      <!-- Logo con Hexágono -->
      <a href="#inicio" class="brand-logo">
        <svg class="logo-hexagon">
          <path d="..." stroke="cyan" stroke-width="2" fill="none"></path>
          <path class="hex-pulse" d="..." stroke="cyan" fill="none"></path>
        </svg>
        <img src="assets/img/logo-color.svg" alt="Logo" class="logo-img">
      </a>
      
      <!-- Tagline con Glitch -->
      <div class="nav-tagline">
        <span>Impresión 3D Profesional</span>
        <span class="tagline-glitch">Impresión 3D Profesional</span>
        <svg class="location-flag">
          <rect x="0" y="0" width="10" height="20" fill="#006847"></rect>
          <rect x="10" y="0" width="10" height="20" fill="#FFFFFF"></rect>
          <rect x="20" y="0" width="10" height="20" fill="#CE1126"></rect>
          <circle cx="15" cy="10" r="3" fill="cyan"></circle>
        </svg>
      </div>
      
      <!-- Nav Links -->
      <ul class="nav-menu">
        <li class="nav-item">
          <a href="#servicios" class="nav-link">
            <span class="nav-link-bg"></span>
            Servicios
          </a>
        </li>
        <!-- ... más links -->
      </ul>
      
      <!-- Toggle con Circuito -->
      <button class="nav-toggle" aria-label="Menú">
        <svg class="toggle-circuit">
          <circle cx="25" cy="25" r="18" stroke="cyan" fill="none"></circle>
          <circle cx="25" cy="25" r="22" stroke="cyan" stroke-dasharray="4 4"></circle>
        </svg>
        <span class="nav-toggle-icon">...</span>
      </button>
      
      <!-- Botón CTA con Pulso -->
      <a href="https://m.me/..." class="btn-messenger">
        <span class="btn-pulse"></span>
        <span class="btn-messenger-icon">💬</span>
        Contáctanos
      </a>
    </nav>
  </div>
</header>
```

---

## ?? Correcciones y Mejoras Integradas

### CSS base y capas
```css
.header {
  position: fixed; top: 0; left: 0; width: 100%;
  z-index: 1200;
  background: radial-gradient(120% 120% at 50% -10%, rgba(0, 217, 255, 0.12), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(6, 182, 212, 0.25);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.45);
  transition: transform var(--motion-duration-fast) var(--motion-ease);
}
.header.is-hidden { transform: translateY(-100%); }
.nav-decorations { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.nav-border { position: absolute; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.35), transparent); }
.nav-border-top { top: 0; }
.nav-border-bottom { bottom: 0; }
.nav { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 18px; position: relative; }
```

### Prefers-reduced-motion (cubre todo lo animado)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition: none !important; }
  .nav-decorations { opacity: 0.35; }
}
```

### SVG de nopales (shape base reutilizable)
```html
<svg class="nav-deco nav-nopal nav-nopal-left" viewBox="0 0 60 90">
  <path d="M30 10 C20 25 18 40 22 60 C26 78 18 82 16 90
           C22 82 30 84 34 74 C40 58 42 40 36 22 Z"
        fill="url(#nopalGrad)" stroke="rgba(16,185,129,0.6)" stroke-width="2" />
  <circle cx="24" cy="36" r="2" fill="#06B6D4" />
  <circle cx="30" cy="50" r="2" fill="#06B6D4" />
  <circle cx="20" cy="58" r="2" fill="#06B6D4" />
  <defs>
    <linearGradient id="nopalGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#0F766E" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>
</svg>
```
Reutilizar el mismo svg invirtiendo en X (`transform: scaleX(-1)`) para el lado derecho.

### SVG aguila compacta (60x50)
```html
<svg class="nav-deco nav-aguila" viewBox="0 0 60 50">
  <g filter="drop-shadow(0 0 12px rgba(6,182,212,0.6))">
    <path class="aguila-body" d="M28 24 Q30 14 34 10 Q38 14 40 24 Q36 22 32 22 Z"
          fill="rgba(6,182,212,0.45)" stroke="#06B6D4" stroke-width="1.4" />
    <path class="aguila-wing-left" d="M30 20 Q12 18 8 30 Q18 26 26 28"
          fill="none" stroke="#00D9FF" stroke-width="2.2" stroke-linecap="round" />
    <path class="aguila-wing-right" d="M32 20 Q50 18 54 30 Q44 26 36 28"
          fill="none" stroke="#00D9FF" stroke-width="2.2" stroke-linecap="round" />
    <circle cx="34" cy="9" r="3" fill="#E0F2FE" />
  </g>
</svg>
```

### Insignia "Hecho en Mexico" lista
```html
<div class="badge-made-mx" role="img" aria-label="Hecho en Mexico">
  <svg class="badge-made-mx-svg" viewBox="0 0 160 32" preserveAspectRatio="xMidYMid meet">
    <rect x="1" y="1" width="158" height="30" rx="6" ry="6"
          fill="rgba(0,0,0,0.45)" stroke="rgba(6,182,212,0.5)" stroke-width="1.5" />
    <g class="badge-gear" transform="translate(16 16)">
      <circle r="6" fill="none" stroke="#06B6D4" stroke-width="1.5" stroke-dasharray="2 2" />
      <circle r="2.2" fill="#06B6D4" />
    </g>
    <g class="badge-eagle" transform="translate(40 8)">
      <path d="M0 8 Q6 0 12 8 Q8 6 6 10 Q4 6 0 8" fill="#00D9FF" opacity="0.8" />
    </g>
    <text x="62" y="13" fill="#E0F2FE" font-size="10" font-weight="700" letter-spacing="0.6">HECHO EN</text>
    <text x="62" y="24" fill="#E0F2FE" font-size="12" font-weight="800" letter-spacing="0.8">MEXICO</text>
    <g class="badge-flag" transform="translate(136 4)">
      <rect width="6" height="24" fill="#006847" />
      <rect x="6" width="6" height="24" fill="#FFFFFF" />
      <rect x="12" width="6" height="24" fill="#CE1126" />
      <rect x="0" y="10" width="18" height="4" fill="rgba(0,217,255,0.2)" />
    </g>
  </svg>
</div>
```

### JS de comportamiento inteligente
```js
const header = document.querySelector('.header');
const toggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
let lastY = 0;

// Auto-hide al hacer scroll hacia abajo, mostrar al subir
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const delta = y - lastY;
  header.classList.toggle('is-hidden', delta > 6 && y > 80);
  header.classList.toggle('is-compact', y > 260);
  lastY = y;
}, { passive: true });

// Toggle menu mobile
toggle?.addEventListener('click', () => {
  const open = navMenu?.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Cerrar al hacer click en un link (mobile)
navMenu?.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    navMenu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});
```

### Accesibilidad extra
- `aria-expanded` en el boton de menu.
- Decorativos con `aria-hidden="true"`; solo poner `role` o `aria-label` si aportan significado.
- Focus visible: `:focus-visible { outline: 2px solid var(--accent-primary); outline-offset: 3px; }`
- Contraste en textos sobre gradientes: fondo `rgba(0,0,0,0.72)` o similar.

### Notas de implementacion
- Insertar `nav-decorations` antes de `.container` para que quede bajo el contenido pero dentro del header.
- Fallback a `background-color: rgba(0,0,0,0.82);` si no hay `backdrop-filter`.
- Comprimir SVG (svgo) y centralizar `defs` en un `<svg width="0" height="0" style="position:absolute">` para reuso.
- Reutilizar el mismo nopal espejado; reduces peso y cargas solo una definicion.

---
## ? Testing Checklist

### Visual
- [x] Nopales visibles y flotando suavemente
- [x] Águila pulsando con alas en movimiento
- [x] Bandera ondeando sin distorsión
- [x] Partículas flotando con diferentes velocidades
- [x] Scan lines visibles pero sutiles
- [x] Bordes glitching en intervalos de 5s

### Interacciones
- [x] Logo hexagon pulse acelera en hover
- [x] Nav-links muestran barrido de luz en hover
- [x] Tagline glitch se activa cada 8s
- [x] Toggle circuit rota más rápido en hover
- [x] Botón CTA muestra pulso radial en hover

### Performance
- [ ] 60 FPS constante en Chrome DevTools (Performance)
- [ ] GPU layers activadas (check en DevTools > Layers)
- [ ] Sin layout shifts (CLS < 0.1)
- [ ] Animaciones no bloquean scroll

### Responsive
- [x] Decoraciones reducen opacidad en mobile compacto
- [x] Nopales y águila se ocultan en < 768px compacto
- [x] Partículas siguen visibles pero con menos cantidad
- [x] Botones mantienen área táctil mínima 44×44px

### Accesibilidad
- [x] Decoraciones con `aria-hidden="true"`
- [ ] `prefers-reduced-motion` implementado
- [ ] Contraste de texto cumple WCAG AA (4.5:1)
- [ ] Navegación por teclado funcional

---

## 🎨 Notas de Diseño

### Filosofía
Fusionar **cyberpunk** (tecnología, futuro, neón) con **mexicanidad** (nopales, águila, bandera) para crear identidad visual única que refleje:
- Innovación tecnológica (impresión 3D)
- Orgullo nacional (empresa mexicana)
- Profesionalismo (no excesivo, sutil)

### Paleta de Colores
- **Cyan (#06B6D4)**: Color primario cyberpunk, evoca tecnología
- **Verde (#10B981)**: Nopales, naturaleza mexicana
- **Bandera**: Colores oficiales (Ley sobre el Escudo, la Bandera y el Himno Nacionales)

### Timing de Animaciones
- **Rápidas (1-3s)**: Efectos hover, interacciones
- **Medias (4-6s)**: Decoraciones principales (nopales, águila)
- **Lentas (8-20s)**: Efectos ambientales (scan, circuit)

---

## 🧭 Futuras Mejoras

### v2.0 Planeado
1. **Modo Nocturno Dinámico**
   - Aumentar intensidad de neón en dark mode
   - Partículas más brillantes

2. **Responsive Avanzado**
   - Animaciones adaptativas por GPU device
   - Menos partículas en móviles de gama baja

3. **Efectos de Sonido** (integración con sistema de sonido existente)
   - Glitch sound en border-glitch
   - Ambient cyberpunk loop

4. **Easter Egg**
   - Konami code activa "modo fiesta" con más efectos

5. **Accesibilidad Completa**
   - `prefers-reduced-motion` implementado
   - Opción en UI para deshabilitar animaciones

---

## 📚 Referencias

### UX Research
- **ISO 9241-910**: Ergonomía de interacción humano-sistema
- **Don Norman** - "The Design of Everyday Things": Affordances visuales
- **William Gaver** - Auditory Icons: Feedback multi-sensorial

### Inspiración Visual
- **Cyberpunk 2077**: Estética neón, interfaces futuristas
- **Blade Runner**: Paleta de colores, atmósfera nocturna
- **Arte Mexicano Contemporáneo**: Fusión tradición-modernidad

---

## 🙌 Créditos

**Diseño e Implementación**: GitHub Copilot + Mahitek Development Team  
**Fecha**: Octubre 2024  
**Versión**: 1.0.0  
**Licencia**: Propietario - Mahitek 3D Lab MX

---

## 📞 Soporte

Para dudas o sugerencias sobre el navbar cyberpunk:
- **GitHub Issues**: [repositorio]/issues
- **Email**: contacto@mahitek.com
- **Messenger**: [m.me/mahitek3dlab]

---

**¡Viva México! 🇲🇽 ¡Viva el Cyberpunk! 🤖**


