/**
 * FAQ: carga, render, filtros y schema JSON-LD.
 */

import CONFIG from './config.js';
import { loadJSON } from './data-loader.js';
import { addHealthReport, flushHealthReports } from './health-report.js';
import { escapeHTML } from './security.js';
import { normalizeKey, slugify } from './utils.js';
import { validateFaqData } from './validation.js';
import { revealInRoot } from './scroll-reveal.js';

let faqLoaded = false;

function getFaqDisclosure() {
  return document.getElementById('faq-disclosure');
}

function openFaqDisclosure(target) {
  const disclosure = getFaqDisclosure();
  if (!disclosure) return false;
  if (!disclosure.open) {
    disclosure.open = true;
  }
  if (target && target.id !== 'faq') {
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start' });
    });
  }
  return true;
}

function handleFaqHash() {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;
  const id = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(id);
  if (!target) return;
  if (target.id === 'faq' || target.closest('#faq')) {
    openFaqDisclosure(target);
    if (target.classList.contains('faq-item')) {
      target.open = true;
    }
  }
}

function getFAQTheme(categoryLabel) {
  const key = normalizeKey(categoryLabel);

  if (key.includes('personal')) return { icon: 'i-faq-wand', theme: 'violet' };
  if (key.includes('produc') || key.includes('equipo'))
    return { icon: 'i-faq-printer', theme: 'cyan' };
  if (key.includes('servic') || key.includes('post'))
    return { icon: 'i-faq-wrench', theme: 'green' };
  if (key.includes('env')) return { icon: 'i-faq-truck', theme: 'amber' };
  if (key.includes('garant') || key.includes('calid'))
    return { icon: 'i-faq-shield', theme: 'blue' };
  if (key.includes('precio') || key.includes('pago') || key.includes('fact'))
    return { icon: 'i-faq-tag', theme: 'lime' };
  if (key.includes('archivo') || key.includes('formato'))
    return { icon: 'i-faq-file', theme: 'rose' };
  if (key.includes('disen')) return { icon: 'i-faq-pen', theme: 'rose' };
  if (key.includes('privac')) return { icon: 'i-faq-lock', theme: 'violet' };
  if (key.includes('sosten')) return { icon: 'i-faq-leaf', theme: 'emerald' };
  if (key.includes('devol')) return { icon: 'i-faq-refresh', theme: 'slate' };
  if (key.includes('material') || key.includes('acab'))
    return { icon: 'i-faq-layers', theme: 'pink' };
  if (key.includes('tiemp')) return { icon: 'i-faq-clock', theme: 'sky' };

  return { icon: 'i-faq-spark', theme: 'teal' };
}

function injectFAQSchema(items) {
  if (!Array.isArray(items) || items.length === 0) return;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(it => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a }
    }))
  };
  let script = document.getElementById('faq-schema');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

export async function initFAQ() {
  if (faqLoaded) return;
  const faqData = await loadJSON(CONFIG.DATA_PATHS.faq);
  const report = validateFaqData(faqData);
  const container = document.getElementById('faq-list');
  if (!container) return;

  faqLoaded = true;

  if (!Array.isArray(faqData) || faqData.length === 0) {
    addHealthReport('faq', report);
    flushHealthReports();
    container.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-faq.svg" alt="Archivo del taller en preparación" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>Estamos curando respuestas. Escríbenos si quieres resolver algo puntual.</p>
      </div>
    `;
    revealInRoot(container);
    return;
  }

  container.innerHTML = faqData
    .map((item, index) => {
      const id = `faq-${slugify(item.q)}`;
      const categoryValue = (item.categoria || '').toLowerCase();
      const categoryAttr = categoryValue ? ` data-category="${escapeHTML(categoryValue)}"` : '';
      const theme = getFAQTheme(item.categoria || '');
      const themeAttr = theme?.theme ? ` data-faq-theme="${escapeHTML(theme.theme)}"` : '';
      const categoryPill = item.categoria
        ? `<span class="faq-item-pill">${escapeHTML(item.categoria)}</span>`
        : '';

      return `
  <details class="faq-item faq-card animate-delay-${Math.min(index, 5)}" id="${id}" data-animate="fade-up"${categoryAttr}${themeAttr}>
    <summary class="faq-card-summary">
      <span class="faq-item-chevron" aria-hidden="true"></span>
      <span class="faq-card-illustration" aria-hidden="true">
        <svg class="ui-icon ui-icon--draw" viewBox="0 0 24 24">
          <use href="#${escapeHTML(theme.icon)}"></use>
        </svg>
      </span>
      <span class="faq-item-question">${escapeHTML(item.q)}</span>
      ${categoryPill}
    </summary>
    <div class="faq-item-content">
      <p>${escapeHTML(item.a)}</p>
    </div>
  </details>
      `;
    })
    .join('');

  const top = document.getElementById('faq-top');
  const featured = Array.isArray(faqData) ? faqData.filter(i => i.destacada) : [];

  report.summary.destacadas = featured.length;
  addHealthReport('faq', report);
  flushHealthReports();

  if (top) {
    if (featured.length) {
      top.innerHTML = featured
        .map(it => {
          const id = `faq-${slugify(it.q)}`;
          const theme = getFAQTheme(it.categoria || '');
          const themeAttr = theme?.theme ? ` data-faq-theme="${escapeHTML(theme.theme)}"` : '';
          return `<a class="faq-chip" href="#${id}" data-faq-target="#${id}" aria-label="Ir a: ${escapeHTML(
            it.q
          )}"${themeAttr}><svg class="faq-chip-icon ui-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#${escapeHTML(
            theme.icon
          )}"></use></svg><span>${escapeHTML(it.q)}</span></a>`;
        })
        .join('');
    }

    top.addEventListener('click', e => {
      const a = e.target.closest('a.faq-chip');
      if (!a) return;
      const sel = a.getAttribute('data-faq-target');
      const target = document.querySelector(sel);
      if (target) {
        target.open = true;
      }
    });
  }

  const search = document.getElementById('faq-search');
  const categorySelect = document.getElementById('faq-category');
  const btnExpand = document.getElementById('faq-expand');
  const btnCollapse = document.getElementById('faq-collapse');
  const countEl = document.getElementById('faq-count');
  const items = Array.from(container.querySelectorAll('.faq-item'));
  const featuredStat = document.querySelector('[data-faq-featured]');
  const totalStat = document.querySelector('[data-faq-total]');
  const disclosure = getFaqDisclosure();

  if (disclosure) {
    disclosure.addEventListener('toggle', () => {
      if (disclosure.open) {
        revealInRoot(disclosure);
      }
    });
  }

  if (totalStat) totalStat.textContent = faqData.length;
  if (featuredStat) featuredStat.textContent = featured.length;

  if (categorySelect) {
    const categories = Array.from(new Set(faqData.map(i => i.categoria).filter(Boolean)))
      .map(cat => ({ label: cat, value: cat.toLowerCase() }))
      .sort((a, b) => a.label.localeCompare(b.label));
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.value;
      opt.textContent = cat.label;
      categorySelect.appendChild(opt);
    });
  }

  const applyFilter = query => {
    const q = (query || '').trim().toLowerCase();
    const cat = categorySelect && categorySelect.value ? categorySelect.value : '';
    let visible = 0;
    items.forEach(el => {
      const text = el.textContent.toLowerCase();
      const matchText = q.length === 0 || text.includes(q);
      const itemCat = (el.dataset.category || '').toLowerCase();
      const matchCat = !cat || itemCat === cat;
      const match = matchText && matchCat;
      el.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (countEl) {
      countEl.textContent = `Mostrando ${visible} de ${items.length} preguntas`;
    }
  };

  if (search) {
    search.addEventListener('input', e => applyFilter(e.target.value));
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', () => applyFilter(search ? search.value : ''));
  }
  if (btnExpand) {
    btnExpand.addEventListener('click', () => items.forEach(el => (el.open = true)));
  }
  if (btnCollapse) {
    btnCollapse.addEventListener('click', () => items.forEach(el => (el.open = false)));
  }

  if (countEl) {
    countEl.textContent = `Mostrando ${items.length} de ${items.length} preguntas`;
  }

  handleFaqHash();
  window.addEventListener('hashchange', handleFaqHash);

  revealInRoot(container);
  injectFAQSchema(faqData);
}
