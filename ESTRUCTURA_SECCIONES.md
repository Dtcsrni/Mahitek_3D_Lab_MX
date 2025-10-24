# Estructura Temática del Sitio - Mahitek 3D Lab

## 📋 Índice de Secciones

### 1. **Hero / Inicio** 
- **ID**: `#inicio`
- **Propósito**: Primera impresión, propuesta de valor principal
- **Elementos clave**: 
  - Logo y marca
  - Eslogan: "Impresión 3D Profesional"
  - Llamado a acción principal
  - Ilustración hero-lab.svg

---

### 2. **Cómo Trabajamos** 🤝
- **ID**: `#servicios`
- **Clase temática**: `section-accent--teal`
- **Propósito**: Explicar la metodología y diferenciadores del servicio
- **SVGs mejorados**:
  - `service-design-v2.svg`: Modelado técnico 3D con grid, dimensiones y wireframe
  - `service-packaging-v2.svg`: Empaque premium con lazo holográfico
  - `service-support-v2.svg`: Chat de Messenger realista con conversación
- **Subsecciones**:
  1. Modelado técnico sin jerga
  2. Empaque listo para entregar
  3. Soporte continuo post-venta

---

### 3. **Aplicaciones y Casos de Uso** 💡
- **ID**: Sin ID específico (después de #servicios)
- **Clase temática**: `section-accent--red`
- **Propósito**: Mostrar ejemplos reales de aplicación
- **Categorías**:
  - 🏡 Tu espacio, tu identidad (deco)
  - 🎁 Regalos con contexto (personalizados)
  - 🎮 Fandom con propósito (coleccionables)
  - 📚 Primeras series de tu marca (emprendedores)
- **SVGs**: segment-deco, segment-gift, segment-fandom-static, segment-education

---

### 4. **Catálogo de Productos** 📦
- **ID**: `#catalogo`
- **Clase temática**: `section-accent--purple`
- **Propósito**: Productos listos para imprimir con precios claros
- **Funcionalidad**:
  - Filtro por categoría
  - Búsqueda por texto
  - Carrusel de productos
  - Información de compra detallada
- **Carga**: Dinámica desde `products.json`

---

### 5. **Promociones Activas** 🎯
- **ID**: `#promos`
- **Clase temática**: `section-accent--green`
- **Propósito**: Descuentos temporales, bundles y lanzamientos
- **Funcionalidad**:
  - Carrusel de promociones
  - Filtrado por vigencia
  - Carga dinámica desde `promos.json`
- **Estados**: activo/inactivo, fechas de inicio/fin

---

### 6. **Flujo de Producción** 🛠️
- **ID**: `#proceso`
- **Clase temática**: `section-accent--teal`
- **Propósito**: Transparencia en el proceso de fabricación
- **Pasos**:
  1. 💬 Consulta inicial
  2. 🎨 Validación de diseño
  3. 🖨️ Producción y acabados
  4. 📦 Entrega y seguimiento
- **Incluidos**: Registro fotográfico, ajustes, control de calidad

---

### 7. **Preguntas Frecuentes** ❓
- **ID**: `#faq`
- **Clase temática**: `section-accent--green`
- **Propósito**: Resolver dudas comunes
- **Funcionalidad**:
  - Búsqueda en preguntas
  - Filtro por categoría
  - Expandir/contraer todo
  - Preguntas destacadas al inicio
- **Carga**: Dinámica desde `faq.json`
- **Categorías**: personalización, tiempos, materiales, costos, etc.

---

### 8. **Contacto / CTA** ✨
- **ID**: `#contacto`
- **Clase**: `cta-section`
- **Propósito**: Llamado final a la acción
- **Opciones de contacto**:
  - Email: armsystechno@gmail.com
  - Messenger (preferido): m.me/mahitek3dlabmx
- **Horario**: L-V 10:00-18:00 GMT-6

---

### 9. **Footer**
- **Propósito**: Información corporativa y enlaces
- **Secciones**:
  - Marca y ubicación
  - Enlaces rápidos
  - Redes sociales
  - Horarios
  - Métodos de pago
  - Suscripción newsletter

---

## 🎨 Sistema de Colores Temáticos

```css
--teal (Cyan):    Servicios técnicos, procesos
--red (Naranja):  Aplicaciones, casos de uso
--purple:         Catálogo, productos
--green:          Promociones, FAQ, engagement
```

## 📐 Arquitectura de Navegación

```
Header Nav
├── 🤝 Servicios → #servicios
├── 📦 Catálogo → #catalogo
├── 🛠️ Proceso → #proceso
├── 💡 FAQ → #faq
├── ✨ Contacto → #contacto
└── 💬 Cotizar (Messenger)
```

## 🔄 Orden de Carga de Recursos

1. **Critical Path** (eager/high priority):
   - logo-color.svg
   - hero-lab.svg
   - service-design-v2.svg
   - styles.css
   - app.js

2. **Lazy Load** (después del viewport inicial):
   - segment-*.svg
   - product-*.svg
   - placeholder-*.svg

## 📝 Convenciones de Código

### Comentarios HTML
```html
<!-- ===== SECCIÓN: NOMBRE DESCRIPTIVO ===== -->
<section id="..." class="...">
  ...
</section>
```

### Clases de Sección
- `.section`: Contenedor base
- `.section-alt`: Fondo alternado
- `.section-accent--{color}`: Tema de color

### Animaciones
- `data-animate="fade-up"`: Trigger de entrada
- `.animate-delay-{n}`: Delay escalonado (1-5)

---

## 🚀 Mejoras Futuras Sugeridas

1. **Testimonios** (nueva sección entre FAQ y CTA)
2. **Galería de proyectos** (casos de éxito)
3. **Blog/Noticias** (actualizaciones y tutoriales)
4. **Calculadora de precios** (estimación rápida)
5. **Tracking de pedidos** (área de cliente)

---

*Última actualización: 24 de octubre de 2025*
*Versión del sitio: Estado histórico (commit 16e4723 + mejoras)*
