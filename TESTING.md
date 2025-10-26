# Guia Rapida - Sistema de Pruebas Automatizadas

## Instalacion (Una sola vez)

```powershell
# 1. Instalar Git Hooks
.\scripts\instalar-hooks.ps1
```

## Uso Diario

### Opcion 1: Commit Automatizado (Recomendado)

```powershell
# Commit con mensaje automatico
.\scripts\commit-auto.ps1

# Commit con mensaje personalizado
.\scripts\commit-auto.ps1 -Mensaje "tu mensaje aqui"

# Commit de tipo especifico
.\scripts\commit-auto.ps1 -Tipo fix -Mensaje "corregir bug"
```

### Opcion 2: Commit Manual (con validacion automatica)

```powershell
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

Los hooks ejecutaran validaciones automaticamente.

### Opcion 3: Solo Validar (sin commit)

```powershell
.\scripts\validar-codigo.ps1
```

## Tipos de Commit

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Correccion de bug |
| `docs` | Cambios en documentacion |
| `style` | Cambios de formato (CSS) |
| `refactor` | Refactorizacion de codigo |
| `perf` | Mejora de rendimiento |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento |

## Ejemplos

```powershell
# Nueva caracteristica
.\scripts\commit-auto.ps1 -Tipo feat -Mensaje "agregar carousel de productos"

# Corregir error
.\scripts\commit-auto.ps1 -Tipo fix -Mensaje "corregir responsive en mobile"

# Actualizar estilos
.\scripts\commit-auto.ps1 -Tipo style -Mensaje "ajustar colores del hero"

# Solo commit local (sin push)
.\scripts\commit-auto.ps1 -NoPush

# Omitir validaciones (emergencia)
.\scripts\commit-auto.ps1 -SkipTests
```

## Solucionar Problemas

### Si las validaciones fallan:

1. Revisa los errores mostrados
2. Corrige los problemas
3. Intenta el commit nuevamente

### Si necesitas hacer commit urgente:

```powershell
# Omitir validaciones
git commit -m "mensaje" --no-verify

# O usar el script
.\scripts\commit-auto.ps1 -SkipTests
```

## Documentacion Completa

Ver `scripts/README.md` para documentacion detallada.
