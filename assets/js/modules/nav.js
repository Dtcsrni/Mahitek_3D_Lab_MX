/**
 * Navegación principal y smooth scroll.
 */

import ResizeManager from './resize-manager.js';

export function initNav({ onEvent } = {}) {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const header = document.querySelector('.header');

  if (!toggle || !menu) return;

  const initialState = menu.classList.contains('active');
  toggle.setAttribute('aria-expanded', String(initialState));
  toggle.setAttribute('aria-label', initialState ? 'Cerrar menú' : 'Abrir menú');

  let isAnimating = false;

  const closeMenu = () => {
    if (isAnimating) return;
    isAnimating = true;

    menu.classList.remove('active');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('nav-open');

    setTimeout(() => {
      isAnimating = false;
    }, 350);
  };

  const openMenu = () => {
    if (isAnimating) return;
    isAnimating = true;

    menu.classList.add('active');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.classList.add('nav-open');

    setTimeout(() => {
      isAnimating = false;
    }, 350);
  };

  toggle.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

    if (isAnimating) return;

    const isOpen = menu.classList.contains('active');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }

    onEvent?.('nav_menu_toggle', { state: isOpen ? 'closed' : 'open' });
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
      onEvent?.('nav_link_click', { href: link.getAttribute('href') });
    });
  });

  document.addEventListener('click', e => {
    if (
      menu.classList.contains('active') &&
      !menu.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeMenu();
      onEvent?.('nav_menu_close', { method: 'outside_click' });
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      closeMenu();
      toggle.focus();
      onEvent?.('nav_menu_close', { method: 'escape_key' });
    }
  });

  const handleNavResize = () => {
    if (window.innerWidth >= 768 && menu.classList.contains('active')) {
      closeMenu();
      onEvent?.('nav_menu_close', { method: 'resize_to_desktop' });
    }
  };

  ResizeManager.register(handleNavResize);

  document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = target.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
