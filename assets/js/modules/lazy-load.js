/**
 * Lazy load de secciones no críticas.
 */

export function initLazySections({ onPromos, onFaq } = {}) {
  if (typeof IntersectionObserver === 'undefined') {
    onPromos?.();
    onFaq?.();
    return;
  }

  const lazyObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const section = entry.target;
        if (section.id === 'promos') {
          onPromos?.();
        } else if (section.id === 'faq') {
          onFaq?.();
        }
        lazyObserver.unobserve(section);
      });
    },
    { rootMargin: '120px 0px', threshold: 0.01 }
  );

  const promosSection = document.getElementById('promos');
  const faqSection = document.getElementById('faq');
  if (promosSection) lazyObserver.observe(promosSection);
  if (faqSection) lazyObserver.observe(faqSection);
}
