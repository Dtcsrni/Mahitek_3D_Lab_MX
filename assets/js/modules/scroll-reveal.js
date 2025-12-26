/**
 * Revelado por scroll para elementos con data-animate.
 */

let scrollObserver = null;

export function initScrollReveal() {
  const animatedNodes = document.querySelectorAll('[data-animate]');
  if (!animatedNodes.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    animatedNodes.forEach(node => node.classList.add('is-visible'));
    return;
  }

  scrollObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, 20);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedNodes.forEach(node => {
    const rect = node.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight * 0.9;
    if (isVisible) {
      node.classList.add('is-visible');
    } else {
      scrollObserver.observe(node);
    }
  });

  requestAnimationFrame(() => {
    document.documentElement.classList.add('animations-ready');
  });
}

export function revealInRoot(root) {
  if (!root) return;
  if (!scrollObserver) {
    root.querySelectorAll('[data-animate]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const candidates = [];
  root.querySelectorAll('[data-animate]').forEach(el => {
    if (!el.classList.contains('is-visible')) {
      candidates.push(el);
    }
  });

  candidates.forEach(el => scrollObserver.observe(el));
}
