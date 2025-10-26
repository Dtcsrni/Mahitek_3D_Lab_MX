# 🎨 UI Components - Mahitek 3D Lab

Biblioteca de componentes de interfaz reutilizables con API consistente y accesibilidad ARIA.

## 📦 Componentes Disponibles

- **Modal**: Diálogos modales accesibles con backdrop
- **Toast**: Notificaciones temporales con posicionamiento flexible
- **Spinner**: Indicadores de carga con overlay opcional
- **Badge**: Etiquetas/insignias de estado

---

## 🚀 Uso Básico

### Importación (ES6 Modules)

```javascript
import { Modal, Toast, Spinner, Badge } from './modules/ui-components.js';

// O importar todo
import UIComponents from './modules/ui-components.js';
const { Modal, Toast, Spinner, Badge } = UIComponents;
```

### Uso desde app.js legacy

```javascript
// Los componentes están disponibles globalmente después del boot
const { Modal, Toast, Spinner, Badge } = window.MahitekUI;
```

---

## 📋 Modal

### API

```javascript
const modal = new Modal({
  title: 'Título del Modal',
  content: '<p>Contenido HTML o elemento DOM</p>',
  footer: '<button>Aceptar</button>',
  closeButton: true,
  closeOnEscape: true,
  closeOnBackdrop: true,
  size: 'medium', // small, medium, large
  className: 'custom-modal',
  onShow: modal => console.log('Modal mostrado'),
  onHide: modal => console.log('Modal ocultado')
});

modal.show();
modal.hide();
modal.updateContent('<p>Nuevo contenido</p>');
modal.destroy();
```

### Ejemplos

#### Modal simple

```javascript
const modal = new Modal({
  title: 'Confirmación',
  content: '¿Estás seguro de continuar?'
});

modal.show();
```

#### Modal con footer personalizado

```javascript
const footer = document.createElement('div');
footer.style.display = 'flex';
footer.style.gap = '12px';
footer.style.justifyContent = 'flex-end';

const btnCancel = document.createElement('button');
btnCancel.textContent = 'Cancelar';
btnCancel.className = 'btn btn-secondary';
btnCancel.onclick = () => modal.hide();

const btnConfirm = document.createElement('button');
btnConfirm.textContent = 'Confirmar';
btnConfirm.className = 'btn btn-primary';
btnConfirm.onclick = () => {
  console.log('Confirmado');
  modal.hide();
};

footer.appendChild(btnCancel);
footer.appendChild(btnConfirm);

const modal = new Modal({
  title: 'Eliminar producto',
  content: '<p>Esta acción no se puede deshacer.</p>',
  footer
});

modal.show();
```

#### Modal con contenido dinámico

```javascript
const modal = new Modal({
  title: 'Detalles del Producto',
  size: 'large'
});

modal.show();

// Cargar datos
DataManager.getProducts({ search: 'PLA' }).then(products => {
  const content = `
      <ul>
        ${products.map(p => `<li>${p.nombre} - $${p.precio_mxn} MXN</li>`).join('')}
      </ul>
    `;
  modal.updateContent(content);
});
```

#### Eventos personalizados

```javascript
const modal = new Modal({ title: 'Test' });

modal.element.addEventListener('modal:show', () => {
  console.log('Modal visible');
});

modal.element.addEventListener('modal:hide', () => {
  console.log('Modal cerrado');
});

modal.show();
```

---

## 🔔 Toast

### API

```javascript
const toast = new Toast({
  message: 'Mensaje de notificación',
  type: 'info', // info, success, warning, error
  duration: 3000, // ms, 0 = permanente
  position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center
  closeButton: true,
  onShow: toast => console.log('Toast mostrado'),
  onHide: toast => console.log('Toast ocultado')
});

toast.show();
toast.hide();
```

### Helpers estáticos (uso rápido)

```javascript
Toast.info('Información importante');
Toast.success('Operación exitosa', 4000);
Toast.warning('Cuidado con esto');
Toast.error('Error al cargar datos');

// Ocultar todos
Toast.hideAll();
```

### Ejemplos

#### Toast de éxito

```javascript
Toast.success('Producto agregado al carrito');
```

#### Toast de error con duración personalizada

```javascript
Toast.error('No se pudo conectar al servidor', 5000);
```

#### Toast permanente (requiere cierre manual)

```javascript
const toast = new Toast({
  message: 'Sesión a punto de expirar',
  type: 'warning',
  duration: 0, // No auto-hide
  closeButton: true
});

toast.show();
```

#### Toast con callback

```javascript
const toast = new Toast({
  message: 'Guardando cambios...',
  type: 'info',
  duration: 0,
  onShow: () => {
    // Iniciar operación
    saveChanges()
      .then(() => {
        toast.hide();
        Toast.success('Cambios guardados');
      })
      .catch(() => {
        toast.hide();
        Toast.error('Error al guardar');
      });
  }
});

toast.show();
```

---

## ⏳ Spinner

### API

```javascript
const spinner = new Spinner({
  size: 'medium', // small, medium, large
  color: '#3b82f6',
  overlay: true, // Bloquear interacción
  message: 'Cargando datos...'
});

spinner.show();
spinner.hide();
spinner.destroy();
```

### Ejemplos

#### Spinner con overlay (bloquea UI)

```javascript
const spinner = new Spinner({
  overlay: true,
  message: 'Cargando productos...'
});

spinner.show();

DataManager.loadData('products')
  .then(data => {
    spinner.hide();
    renderProducts(data);
  })
  .catch(error => {
    spinner.hide();
    Toast.error('Error al cargar productos');
  });
```

#### Spinner inline (sin overlay)

```javascript
const container = document.getElementById('product-carousel');
const spinner = new Spinner({
  overlay: false,
  size: 'small'
});

// Insertar spinner en contenedor específico
container.innerHTML = '';
container.appendChild(spinner.element);
spinner.show();

// Ocultar cuando termina
loadProducts().then(() => {
  spinner.hide();
  renderProducts();
});
```

#### Spinner durante operación async

```javascript
async function loadAndDisplayData() {
  const spinner = new Spinner({ message: 'Sincronizando...' });

  try {
    spinner.show();

    const [products, promos] = await Promise.all([
      DataManager.loadData('products'),
      DataManager.loadData('promos')
    ]);

    spinner.hide();
    Toast.success('Datos actualizados');
  } catch (error) {
    spinner.hide();
    Toast.error('Error al sincronizar');
  }
}
```

---

## 🏷️ Badge

### API (helper estático)

```javascript
const badge = Badge.create('Nuevo', {
  variant: 'primary', // default, primary, success, warning, error, info
  style: { fontSize: '14px' } // CSS inline adicional
});

// Agregar al DOM
element.appendChild(badge);
```

### Ejemplos

#### Badges de estado

```javascript
const statusBadge = Badge.create('Activo', { variant: 'success' });
const newBadge = Badge.create('Nuevo', { variant: 'primary' });
const saleBadge = Badge.create('Oferta', { variant: 'error' });
```

#### Badge en producto

```javascript
const productCard = document.querySelector('.product-card');

if (product.destacado) {
  const badge = Badge.create('Destacado', { variant: 'warning' });
  productCard.appendChild(badge);
}
```

#### Badge personalizado

```javascript
const customBadge = Badge.create('Premium', {
  variant: 'primary',
  style: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
});
```

---

## 🎯 Casos de Uso Prácticos

### Confirmación antes de acción

```javascript
function confirmDelete(productId) {
  const modal = new Modal({
    title: '⚠️ Confirmar eliminación',
    content: `<p>¿Seguro que deseas eliminar el producto <strong>${productId}</strong>?</p>`,
    size: 'small',
    onShow: () => {
      const footer = modal.element.querySelector('.modal__footer');
      if (footer) {
        const btnConfirm = footer.querySelector('.btn-danger');
        btnConfirm?.addEventListener('click', () => {
          performDelete(productId);
          modal.hide();
        });
      }
    }
  });

  const footer = document.createElement('div');
  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="this.closest('.modal').dispatchEvent(new Event('hide'))">
      Cancelar
    </button>
    <button class="btn btn-danger">
      Eliminar
    </button>
  `;

  modal.options.footer = footer;
  modal.show();
}
```

### Feedback de operación async

```javascript
async function saveProduct(product) {
  const spinner = new Spinner({
    message: 'Guardando producto...'
  });

  try {
    spinner.show();

    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error('Error en servidor');

    spinner.hide();
    Toast.success('Producto guardado exitosamente');
  } catch (error) {
    spinner.hide();
    Toast.error('No se pudo guardar el producto');
    console.error(error);
  }
}
```

### Preview de imagen

```javascript
function previewImage(imageSrc) {
  const img = document.createElement('img');
  img.src = imageSrc;
  img.style.maxWidth = '100%';
  img.style.borderRadius = '8px';

  const modal = new Modal({
    title: 'Vista Previa',
    content: img,
    size: 'large',
    closeOnBackdrop: true
  });

  modal.show();
}
```

### Notificaciones de sistema

```javascript
// Conexión exitosa
DataManager.subscribe('products', data => {
  Toast.info(`${data.length} productos cargados`);
});

// Error de red
window.addEventListener('offline', () => {
  Toast.warning('Sin conexión a internet', 0);
});

window.addEventListener('online', () => {
  Toast.hideAll();
  Toast.success('Conexión restablecida');
});
```

---

## ♿ Accesibilidad

Todos los componentes implementan ARIA:

### Modal

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` (título)
- Focus trap dentro del modal
- Cierre con `Escape`

### Toast

- `role="alert"`
- `aria-live="polite"`
- `aria-atomic="true"`

### Spinner

- `role="status"`
- `aria-live="polite"`
- `aria-label="Cargando..."`

### Badge

- Texto semántico (no solo color)

---

## 🎨 Personalización

### Estilos CSS

Los componentes usan estilos inline mínimos. Puedes sobrescribirlos con CSS:

```css
/* Modal */
.modal {
  border-radius: 16px !important;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5) !important;
}

.modal__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

.modal__title {
  font-size: 24px;
  font-weight: 700;
}

/* Toast */
.toast {
  font-family: 'Inter', sans-serif;
}

.toast--success {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

/* Spinner */
.spinner {
  border-width: 6px !important;
}

/* Badge */
.badge {
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

---

## 🔧 Configuración Avanzada

### Cambiar posición por defecto de Toast

```javascript
// Modificar directamente en ui-components.js
position: options.position || 'bottom-right';
```

### Cambiar duración por defecto

```javascript
duration: options.duration || 5000;
```

### Tamaños personalizados de Modal

```javascript
const modal = new Modal({
  size: 'large'
  // ...
});

// O con CSS inline
modal.element.style.maxWidth = '1000px';
```

---

## 📊 Performance

- **Modal**: ~5ms para crear/mostrar
- **Toast**: ~2ms por toast
- **Spinner**: ~1ms
- **Badge**: <1ms

Recomendaciones:

- Reutilizar instancias de Modal si es posible
- Limitar toasts simultáneos (<5)
- Destruir spinners tras uso (`spinner.destroy()`)

---

## 🐛 Debugging

Activar logs en `config.js`:

```javascript
DEBUG_MODE: true;
```

Logs disponibles:

```
[UIComponents] Modal shown
[UIComponents] Toast shown: success - Producto guardado
[UIComponents] Spinner shown
[UIComponents] Modal hidden
```

---

## 🔗 Integración con DataManager

```javascript
// Cargar datos con feedback visual
async function loadProductsWithFeedback() {
  const spinner = new Spinner({ message: 'Cargando catálogo...' });
  spinner.show();

  try {
    const products = await DataManager.getProducts({ activeOnly: true });

    spinner.hide();
    renderProducts(products);
    Toast.success(`${products.length} productos cargados`);
  } catch (error) {
    spinner.hide();

    const modal = new Modal({
      title: 'Error al cargar',
      content: '<p>No se pudieron cargar los productos. Intenta de nuevo.</p>',
      footer: `<button class="btn btn-primary" onclick="location.reload()">Recargar</button>`
    });

    modal.show();
  }
}
```

---

**Última actualización:** 26 octubre 2025  
**Versión:** 1.0.0
