/**
 * Comportamiento del header durante el scroll.
 */

export function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const docEl = document.documentElement;
  let ticking = false;
  let lastScrollY = 0;
  let scrollDirection = 'up';
  let lastHeaderHeight = header.offsetHeight;

  const SCROLL_THRESHOLD = 24;
  const HIDE_THRESHOLD = 100;
  const COMPACT_THRESHOLD = 300;

  const toggleState = () => {
    const scrollY = window.scrollY;
    const scrollDelta = scrollY - lastScrollY;
    if (Math.abs(scrollDelta) > SCROLL_THRESHOLD) {
      scrollDirection = scrollDelta > 0 ? 'down' : 'up';
    }

    const isMobile = window.innerWidth < 1024;
    const isMenuOpen = document.body.classList.contains('nav-open');
    const isNearTop = scrollY < HIDE_THRESHOLD;
    const shouldHide = scrollDirection === 'down' && scrollY > HIDE_THRESHOLD && !isMenuOpen;

    header.classList.toggle('is-scrolled', scrollY > 0);
    header.classList.toggle('is-compact', scrollY > COMPACT_THRESHOLD);
    header.classList.toggle('is-hidden', isMobile && shouldHide);

    if (scrollDirection === 'up' || isNearTop || isMenuOpen) {
      header.classList.remove('is-hidden');
    }

    const nextHeight = header.offsetHeight;
    if (nextHeight !== lastHeaderHeight) {
      docEl.style.setProperty('--header-h', `${nextHeight}px`);
      lastHeaderHeight = nextHeight;
    }

    lastScrollY = scrollY;
    ticking = false;
  };

  const requestToggle = () => {
    if (!ticking) {
      window.requestAnimationFrame(toggleState);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestToggle, { passive: true });
  requestToggle();
}
