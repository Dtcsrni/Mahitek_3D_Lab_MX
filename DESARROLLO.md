# Configuración del Proyecto - Mahitek 3D Lab MX

## 🛠️ Extensiones de VS Code Utilizadas

Este proyecto aprovecha las siguientes extensiones instaladas:

### ✨ Esenciales
- **Prettier** (`esbenp.prettier-vscode`) - Formateo automático de código
- **ESLint** (`dbaeumer.vscode-eslint`) - Linting de JavaScript
- **Live Server** (`ritwickdey.liveserver`) - Servidor de desarrollo local
- **Live Sass Compiler** (`glenn2223.live-sass`) - Compilación SASS en tiempo real

### 🎨 HTML/CSS
- **HTML CSS Support** (`ecmel.vscode-html-css`) - Autocompletado de clases CSS
- **IntelliSense for CSS** (`zignd.html-css-class-completion`) - Autocompletado inteligente

### 🤖 IA y Productividad
- **GitHub Copilot** (`github.copilot`) - Asistente de código IA
- **GitHub Copilot Chat** (`github.copilot-chat`) - Chat con IA

### 🔧 Desarrollo
- **Edge DevTools** (`ms-edgedevtools.vscode-edge-devtools`) - Depuración integrada
- **Markdown Preview Enhanced** (`shd101wyy.markdown-preview-enhanced`) - Vista previa de Markdown

## 📦 Scripts Disponibles

```bash
# Servidor de desarrollo
npm run dev

# Linting
npm run lint:js          # Validar JavaScript
npm run lint:css         # Validar CSS
npm run validate         # Validar todo

# Formateo
npm run format:js        # Formatear JavaScript
npm run format:css       # Formatear CSS
npm run format:html      # Formatear HTML
npm run format           # Formatear todo

# SASS
npm run watch:sass       # Compilar SASS en tiempo real
npm run build:css        # Compilar SASS comprimido

# Optimización
npm run optimize         # Construir y formatear todo
```

## ⚙️ Configuración Automática

El proyecto está configurado con:

- **Auto-formateo** al guardar archivos
- **Linting automático** con correcciones automáticas
- **Servidor local** en puerto 8080
- **Compilación SASS** opcional
- **Git hooks** para validación pre-commit (próximamente)

## 🚀 Inicio Rápido

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm run dev
```

O usar Live Server directamente desde VS Code (clic derecho > "Open with Live Server")

## 📝 Notas

- El formateo automático usa las reglas definidas en `.prettierrc`
- ESLint valida el código según `.eslintrc.json`
- Stylelint valida CSS según `.stylelintrc.json`
- Las configuraciones de VS Code están en `.vscode/settings.json`
