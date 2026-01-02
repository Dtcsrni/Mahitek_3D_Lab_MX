/**
 * Button-like elements behavior (scroll + highlight).
 */

const HIGHLIGHT_CLASS = 'is-highlighted';
const HIGHLIGHT_DURATION = 1600;
const highlightTimers = new WeakMap();

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getTarget = button => {
  const selector = button?.dataset?.target;
  if (!selector) return null;
  return document.querySelector(selector);
};

const getHighlightTarget = button => {
  const selector = button?.dataset?.highlightTarget;
  if (selector) return document.querySelector(selector);
  const parentSelector = button?.dataset?.highlightParent;
  if (parentSelector) return button.closest(parentSelector);
  return getTarget(button);
};

const highlight = target => {
  if (!target) return;
  target.classList.add(HIGHLIGHT_CLASS);
  if (highlightTimers.has(target)) {
    clearTimeout(highlightTimers.get(target));
  }
  const timer = window.setTimeout(() => {
    target.classList.remove(HIGHLIGHT_CLASS);
    highlightTimers.delete(target);
  }, HIGHLIGHT_DURATION);
  highlightTimers.set(target, timer);
};

const handleAction = button => {
  const action = button?.dataset?.action;
  if (!action) return;

  if (action === 'scroll') {
    const target = getTarget(button);
    if (target) {
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    }
    highlight(getHighlightTarget(button));
    return;
  }

  if (action === 'highlight') {
    highlight(getHighlightTarget(button));
  }
};

export function initButtonActions() {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    handleAction(button);
  });
}
