/**
 * Ajustes de viewport y capacidades del dispositivo.
 */

export function initViewport() {
  const docEl = document.documentElement;

  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    docEl.style.setProperty('--vh', `${vh}px`);
  };

  const setVW = () => {
    const vw = window.innerWidth * 0.01;
    docEl.style.setProperty('--vw', `${vw}px`);
  };

  const setHeaderHeight = () => {
    const header = document.querySelector('.header');
    if (header) {
      docEl.style.setProperty('--header-h', `${header.offsetHeight}px`);
    }
  };

  const setDeviceClass = () => {
    try {
      const mem = navigator.deviceMemory || 2;
      const cores = navigator.hardwareConcurrency || 2;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finePointer = window.matchMedia('(pointer: fine)').matches;

      const isHigh = mem >= 4 && cores >= 6 && !reduceMotion && finePointer;
      docEl.classList.toggle('device-high', isHigh);
      docEl.classList.toggle('device-low', !isHigh);
    } catch (_) {
      docEl.classList.add('device-low');
    }
  };

  const update = () => {
    setVH();
    setVW();
    setHeaderHeight();
  };

  update();
  setDeviceClass();

  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('orientationchange', update);
}
