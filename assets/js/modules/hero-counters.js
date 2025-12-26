/**
 * Contadores animados para estadísticas.
 */

function animateCounter(element) {
  const target = element.getAttribute('data-counter');
  if (!target) return;

  const numMatch = target.match(/(\d+)/);
  if (!numMatch) {
    element.textContent = target;
    return;
  }

  const targetNum = parseInt(numMatch[1], 10);
  const suffix = target.replace(numMatch[1], '');
  const duration = 2000;
  const steps = 60;
  const increment = targetNum / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(current + increment, targetNum);
    element.textContent = Math.floor(current) + suffix;

    if (step >= steps) {
      clearInterval(timer);
      element.textContent = target;
    }
  }, duration / steps);
}

export function initHeroCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}
