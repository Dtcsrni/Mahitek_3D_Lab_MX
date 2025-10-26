# 🔧 Configuración de GitHub Pages

## ⚠️ IMPORTANTE: Configuración Requerida

Para que el CI/CD funcione correctamente, debes configurar GitHub Pages en tu repositorio.

### 📋 Pasos de Configuración

1. **Ve a la configuración del repositorio:**
   ```
   https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/settings/pages
   ```

2. **En la sección "Build and deployment":**
   - **Source**: Selecciona **"GitHub Actions"** 
   - ❌ NO uses "Deploy from a branch"
   - ✅ Debe decir "GitHub Actions"

3. **Guarda los cambios**

### 🔍 Verificar Configuración

Una vez configurado, deberías ver:
- ✅ Una sección que dice: "Your site is live at https://dtcsrni.github.io/Mahitek_3D_Lab_MX/"
- ✅ El workflow debería ejecutarse correctamente

### 🎯 Qué hace cada Job del Workflow

#### Job 1: 🔍 Validar Código
- Verifica que existan los archivos principales (`index.html`, `app.js`, `styles.css`)
- Comprueba el formateo con Prettier
- Valida la estructura HTML básica
- **Se ejecuta en**: Todos los push y pull requests

#### Job 2: 🚀 Deploy a GitHub Pages
- Sube el sitio a GitHub Pages
- **Solo se ejecuta**: En push a la rama `main`
- **Requiere**: Que el Job 1 (validate) haya pasado exitosamente
- **Requiere**: Configuración de GitHub Pages con "GitHub Actions"

#### Job 3: 📊 Auditoría Lighthouse
- Espera 45 segundos para que el sitio se propague
- Ejecuta auditoría de rendimiento, SEO, accesibilidad, etc.
- Sube los resultados como artefactos
- **Solo se ejecuta**: Después del deploy exitoso
- **Es opcional**: Si falla, no bloquea el workflow

### 🚨 Solución de Problemas

#### Error: "The `deploy-pages` job requires `pages: write` permissions"
**Solución**: Verifica que GitHub Pages esté configurado con "GitHub Actions" como source.

#### Error: "Error: No uploaded artifact was found!"
**Solución**: 
1. Verifica que el repositorio sea público o tengas GitHub Pro/Team
2. Verifica que `actions/upload-pages-artifact@v3` esté funcionando

#### Los workflows fallan constantemente
**Solución**:
1. Ve a: `https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions`
2. Haz clic en el workflow fallido
3. Revisa los logs de cada step para ver el error exacto
4. El problema más común es la configuración de Pages

### ✅ Checklist de Verificación

- [ ] GitHub Pages configurado con "GitHub Actions"
- [ ] El repositorio tiene los archivos: `index.html`, `assets/js/app.js`, `assets/css/styles.css`
- [ ] Las dependencias están en `package.json` (prettier, live-server)
- [ ] El workflow está en `.github/workflows/ci.yml`
- [ ] Has hecho push a la rama `main`

### 📞 Enlaces Útiles

- **Repositorio**: https://github.com/Dtcsrni/Mahitek_3D_Lab_MX
- **GitHub Actions**: https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions
- **Settings de Pages**: https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/settings/pages
- **Sitio Publicado**: https://dtcsrni.github.io/Mahitek_3D_Lab_MX/

---

## 🎓 Comandos Útiles

```bash
# Ver estado de los workflows (requiere GitHub CLI)
gh run list --limit 5

# Ver logs del último workflow
gh run view --log

# Re-ejecutar el último workflow fallido
gh run rerun

# Ver el estado del último workflow
gh run view
```

**Nota**: Si no tienes GitHub CLI instalado:
```bash
# Instalar GitHub CLI en Windows (con Chocolatey)
choco install gh

# O descarga desde:
# https://cli.github.com/
```
