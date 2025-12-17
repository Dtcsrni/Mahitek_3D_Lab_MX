/**
 * Helpers centralizados de animación (flags + utilidades seguras).
 * Objetivo (AI-011): evitar duplicación de lógica (reduce motion, device-low, save-data).
 *
 * Este módulo es importable sin side-effects: no modifica el DOM si no se llama explícitamente.
 *
 * @module animations
 * @version 1.0.0
 */

const DEFAULT_THRESHOLDS = {
  lowEndDeviceMemoryGB: 2,
  lowEndHardwareConcurrency: 4
};

function safeMatchMedia(query) {
  try {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query)
      : null;
  } catch {
    return null;
  }
}

function getNavigatorConnection() {
  try {
    if (typeof navigator === 'undefined') return null;
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  } catch {
    return null;
  }
}

/**
 * Lee preferencia de reduce motion del usuario.
 * @returns {{ prefersReducedMotion: boolean, mediaQuery: MediaQueryList | null }}
 */
export function getMotionPreference() {
  const mediaQuery = safeMatchMedia('(prefers-reduced-motion: reduce)');
  return {
    prefersReducedMotion: Boolean(mediaQuery && mediaQuery.matches),
    mediaQuery
  };
}

/**
 * Lee señales de red / ahorro de datos.
 * @returns {{ saveData: boolean, effectiveType: string | null }}
 */
export function getNetworkPreference() {
  const connection = getNavigatorConnection();
  return {
    saveData: Boolean(connection && connection.saveData),
    effectiveType:
      connection && typeof connection.effectiveType === 'string' ? connection.effectiveType : null
  };
}

/**
 * Lee señales aproximadas de performance del dispositivo (best-effort).
 * @returns {{ deviceMemory: number | null, hardwareConcurrency: number | null }}
 */
export function getDeviceHints() {
  try {
    if (typeof navigator === 'undefined') return { deviceMemory: null, hardwareConcurrency: null };
    const deviceMemory =
      typeof navigator.deviceMemory === 'number' && Number.isFinite(navigator.deviceMemory)
        ? navigator.deviceMemory
        : null;
    const hardwareConcurrency =
      typeof navigator.hardwareConcurrency === 'number' &&
      Number.isFinite(navigator.hardwareConcurrency)
        ? navigator.hardwareConcurrency
        : null;

    return { deviceMemory, hardwareConcurrency };
  } catch {
    return { deviceMemory: null, hardwareConcurrency: null };
  }
}

/**
 * Determina si es un dispositivo "low-end" (para reducir intensidad o desactivar loops pesados).
 * @param {{ deviceMemory?: number | null, hardwareConcurrency?: number | null, saveData?: boolean, thresholds?: Partial<typeof DEFAULT_THRESHOLDS> }} input
 */
export function isLowEndDevice(input = {}) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(input.thresholds || {}) };
  const deviceMemory = typeof input.deviceMemory === 'number' ? input.deviceMemory : null;
  const hardwareConcurrency =
    typeof input.hardwareConcurrency === 'number' ? input.hardwareConcurrency : null;
  const saveData = Boolean(input.saveData);

  if (saveData) return true;
  if (deviceMemory !== null && deviceMemory <= thresholds.lowEndDeviceMemoryGB) return true;
  if (hardwareConcurrency !== null && hardwareConcurrency <= thresholds.lowEndHardwareConcurrency)
    return true;
  return false;
}

/**
 * Obtiene todas las flags relevantes para animación.
 * @param {{ thresholds?: Partial<typeof DEFAULT_THRESHOLDS> }} options
 */
export function getAnimationFlags(options = {}) {
  const motion = getMotionPreference();
  const network = getNetworkPreference();
  const device = getDeviceHints();
  const lowEnd = isLowEndDevice({
    deviceMemory: device.deviceMemory,
    hardwareConcurrency: device.hardwareConcurrency,
    saveData: network.saveData,
    thresholds: options.thresholds
  });

  return {
    prefersReducedMotion: motion.prefersReducedMotion,
    saveData: network.saveData,
    effectiveType: network.effectiveType,
    deviceMemory: device.deviceMemory,
    hardwareConcurrency: device.hardwareConcurrency,
    lowEnd
  };
}

/**
 * Decide si se deben ejecutar animaciones (respeta reduce motion).
 * @param {ReturnType<typeof getAnimationFlags>} flags
 */
export function shouldAnimate(flags = getAnimationFlags()) {
  return !flags.prefersReducedMotion;
}

/**
 * Decide si se recomienda permitir animaciones "pesadas" (loops, parallax, etc.).
 * @param {ReturnType<typeof getAnimationFlags>} flags
 */
export function shouldUseHeavyAnimations(flags = getAnimationFlags()) {
  return shouldAnimate(flags) && !flags.lowEnd && !flags.saveData;
}

/**
 * Ajusta duraciones según flags.
 * @param {number} durationMs
 * @param {{ flags?: ReturnType<typeof getAnimationFlags> }} options
 */
export function getAnimationDuration(durationMs, options = {}) {
  const flags = options.flags || getAnimationFlags();
  return shouldAnimate(flags) ? durationMs : 0;
}

/**
 * Aplica clases CSS al root para estilos condicionales.
 * No se ejecuta automáticamente: llamarlo explícitamente en boot/app si se requiere.
 * @param {HTMLElement} root
 * @param {ReturnType<typeof getAnimationFlags>} flags
 */
export function applyAnimationFlags(root, flags = getAnimationFlags()) {
  if (!root || !root.classList) return flags;

  root.classList.toggle('reduced-motion', flags.prefersReducedMotion);
  root.classList.toggle('save-data', flags.saveData);
  root.classList.toggle('device-low', flags.lowEnd);
  root.dataset.motion = flags.prefersReducedMotion ? 'reduce' : 'ok';
  root.dataset.device = flags.lowEnd ? 'low' : 'ok';

  return flags;
}

export default {
  getMotionPreference,
  getNetworkPreference,
  getDeviceHints,
  isLowEndDevice,
  getAnimationFlags,
  shouldAnimate,
  shouldUseHeavyAnimations,
  getAnimationDuration,
  applyAnimationFlags
};
