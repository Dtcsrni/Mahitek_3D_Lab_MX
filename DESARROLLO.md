# Configuración del Proyecto - Mahitek 3D Lab MX

## 🛠️ Extensiones de VS Code Utilizadas

Este proyecto aprovecha las siguientes extensiones instaladas:

### ✨ Esenciales
- **Prettier** (`esbenp.prettier-vscode`) - Formateo automático de código
- **Live Server** (`ritwickdey.liveserver`) - Servidor de desarrollo local
- **HTML CSS Support** (`ecmel.vscode-html-css`) - Autocompletado de clases CSS
- **IntelliSense for CSS** (`zignd.html-css-class-completion`) - Autocompletado inteligente

### 🤖 IA y Productividad
- **GitHub Copilot** (`github.copilot`) - Asistente de código IA
- **GitHub Copilot Chat** (`github.copilot-chat`) - Chat con IA

### 🔧 Desarrollo
- **Edge DevTools** (`ms-edgedevtools.vscode-edge-devtools`) - Depuración integrada
- **Markdown Preview Enhanced** (`shd101wyy.markdown-preview-enhanced`) - Vista previa de Markdown
- **Git History** (`donjayamanne.githistory`) - Historial visual de Git

### ⚠️ No Necesarias para Este Proyecto
- ~~ESLint~~ - Proyecto vanilla sin transpilación
- ~~Live Sass Compiler~~ - Usamos CSS directo
- ~~Stylelint~~ - No necesario para proyecto simple

## 📦 Scripts Disponibles

```bash
# 🚀 Servidor de desarrollo (RECOMENDADO)
npm run dev              # Inicia en puerto 8080 (sin abrir navegador)
npm run dev:open         # Inicia y abre navegador automáticamente
npm start                # Alias de npm run dev

# 🔄 Alternativas sin NPM
npm run serve            # Python o npx serve como fallback

# 💅 Formateo de código
npm run format           # Formatear todo (JS, CSS, HTML)
npm run format:js        # Solo JavaScript
npm run format:css       # Solo CSS
npm run format:html      # Solo HTML

# ✅ Validación
npm run check:format     # Verificar formateo sin modificar
npm run validate:html    # Validar estructura HTML
npm run validate         # Ejecutar todas las validaciones

# 🏗️ Build y Deploy
npm run build            # Formatear todo el código
npm run deploy           # Commit y push rápido a GitHub

# 🔧 Utilidades
npm install --force      # Reinstalar dependencias
```

## ⚙️ Configuración Automática

El proyecto está configurado con:

- ✅ **Auto-formateo** al guardar archivos (Prettier)
- ✅ **Servidor local** en puerto 8080 (Live Server)
- ✅ **Task auto-run** al abrir el proyecto (opcional)
- ✅ **Hot reload** automático en cambios
- ✅ **Git hooks** simplificados

## 🚀 Inicio Rápido

### Opción 1: Auto-inicio con Script (Recomendado)

**Windows:**
```bash
.\start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Opción 2: Comando Manual

```bash
# 1. Instalar dependencias (solo primera vez)
npm install

# 2. Iniciar servidor
npm run dev
```

### Opción 3: VS Code Task (Automático)

1. Abre el proyecto en VS Code
2. Presiona `Ctrl+Shift+B` (tarea de build por defecto)
3. El servidor se inicia automáticamente

### Opción 4: Live Server de VS Code

1. Instalar extensión **Live Server** (si no la tienes)
2. Clic derecho en `index.html`
3. Seleccionar **"Open with Live Server"**

## 🎯 Configuración de Auto-inicio

Para que `npm run dev` se ejecute automáticamente al abrir el proyecto:

### Método 1: VS Code Task con runOn

Ya configurado en `.vscode/tasks.json`:

```json
{
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

**Activar:**
1. `Ctrl+Shift+P`
2. Escribe: "Tasks: Manage Automatic Tasks in Folder"
3. Selecciona: "Allow Automatic Tasks in Folder"

### Método 2: Usar el Workspace File

Abre el proyecto con:
```bash
code mahitek.code-workspace
```

Esto carga la configuración completa con auto-inicio.

### Método 3: Script de Shell

Agrega a tu `.bashrc` o `.zshrc`:

```bash
# Auto-start Mahitek dev server
mahitek-dev() {
  cd "/ruta/a/Mahitek_3D_Lab_MX" && npm run dev
}
```

## 📝 Notas Importantes

### ⚡ Proyecto Vanilla - Sin Build Step

Este proyecto **NO requiere**:
- ❌ Transpilación (Babel)
- ❌ Bundling (Webpack/Vite)
- ❌ Compilación SASS
- ❌ Minificación para desarrollo

Es HTML/CSS/JS puro que se sirve directamente.

### 🔧 Dependencias Mínimas

Solo requiere:
- `prettier` - Formateo de código
- `live-server` - Servidor de desarrollo

Total: **~15MB** en `node_modules`

### 🚀 Deploy Automático

GitHub Actions se ejecuta automáticamente en cada push a `main`:

1. ✅ Valida estructura HTML
2. ✅ Verifica formateo con Prettier
3. 🚀 Deploy a GitHub Pages
4. 🔍 Auditoría Lighthouse (post-deploy)

## 🎨 Snippets Personalizados

Los snippets están en:
- `.vscode/mahitek.code-snippets` (HTML)
- `.vscode/mahitek-css.code-snippets` (CSS)

Usa `mhk-` + Tab para auto-completar.

## ¿ Tips de Productividad

### Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+Shift+B` | Iniciar servidor (tarea por defecto) |
| `Shift+Alt+F` | Formatear archivo actual |
| `Ctrl+Shift+P` | Command Palette (acceder a tareas) |
| `Ctrl+K Ctrl+F` | Formatear selección |

### Comandos Útiles

```bash
# Ver servidor corriendo
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows

# Matar proceso en puerto 8080
kill -9 $(lsof -t -i:8080)  # Mac/Linux
taskkill /F /PID <PID>  # Windows
```

## 🐛 Troubleshooting

### Error: "Puerto 8080 ya en uso"

```bash
# Opción 1: Cambiar puerto en package.json
"dev": "live-server --port=3000 ..."

# Opción 2: Matar proceso existente (ver arriba)
```

### Error: "live-server no encontrado"

```bash
npm install --force
# o
npm install -g live-server
```

### El formateo automático no funciona

1. Verifica que Prettier esté instalado:
   ```bash
   npm list prettier
   ```

2. Revisa configuración de VS Code:
   - `Ctrl+,` → Busca "format on save"
   - Debe estar activado ✅

3. Reinstala extensión Prettier en VS Code

### Task no se ejecuta automáticamente

1. Habilita automatic tasks:
   - `Ctrl+Shift+P`
   - "Tasks: Manage Automatic Tasks"
   - "Allow Automatic Tasks in Folder"

2. Reinicia VS Code

## 📚 Documentación Adicional

- **[README.md](README.md)** - Documentación general del proyecto
- **[CONFIGURACION_EXTENSIONES.md](CONFIGURACION_EXTENSIONES.md)** - Guía completa de extensiones
- **[NAVBAR_INTELIGENTE.md](NAVBAR_INTELIGENTE.md)** - Documentación del navbar
- **[NAVBAR_CYBERPUNK.md](NAVBAR_CYBERPUNK.md)** - Diseño cyberpunk

---

✨ **íTodo configurado y listo para desarrollar!** ✨

**Primera vez:** `npm install && npm run dev`  
**Siguiente:** `npm run dev` o `Ctrl+Shift+B`




