async function loadJSON(path){
  const res = await fetch(path);
  return res.json();
}

function el(tag, attrs = {}, children = []){
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if(key === "class") element.className = value;
    else if(key === "text") element.textContent = value;
    else element.setAttribute(key, value);
  });
  children.forEach(child => element.appendChild(child));
  return element;
}

function money(n){
  return `$${n} MXN`;
}

const ICONS = {
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.8A5.2 5.2 0 1 1 6.8 13 5.2 5.2 0 0 1 12 7.8zm0 2A3.2 3.2 0 1 0 15.2 13 3.2 3.2 0 0 0 12 9.8zm5.6-3.1a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3H13.5V8.7c0-.9.2-1.5 1.6-1.5H17V4.4c-.8-.1-1.7-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V11H7.5v3h2.5v8h3.5z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.3a6.8 6.8 0 0 1-4.6-1.7v7.2a6.2 6.2 0 1 1-5-6.1v3.8a2.7 2.7 0 1 0 1.9 2.6V2h3.2a6.8 6.8 0 0 0 4.5 4.2z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.5a4 4 0 0 0-2.8-2.8C18.4 4 12 4 12 4s-6.4 0-8.2.7A4 4 0 0 0 1 7.5 41.6 41.6 0 0 0 1 12a41.6 41.6 0 0 0 1 4.5 4 4 0 0 0 2.8 2.8C5.6 20 12 20 12 20s6.4 0 8.2-.7A4 4 0 0 0 23 16.5 41.6 41.6 0 0 0 24 12a41.6 41.6 0 0 0-1-4.5zM10 15.5v-7l6 3.5z"/></svg>`
};

function socialLink(name, url){
  const anchor = el('a', {href:url, target:'_blank', rel:'noopener', title:name});
  anchor.innerHTML = ICONS[name] || '';
  return anchor;
}

function renderSocial(container, social){
  const wrap = el('div', {class:'social'});
  Object.entries(social).forEach(([key, value]) => {
    if(value) wrap.appendChild(socialLink(key, value));
  });
  container.appendChild(wrap);
}

function renderPromo(promo){
  const wrap = el('div', {class:'promo slide'});
  wrap.append(el('div', {class:'t', text: promo.title}));
  if(promo.value){
    wrap.append(el('div', {class:'value', text: promo.value}));
  }
  wrap.append(el('div', {class:'d', text: promo.detail}));
  wrap.append(el('a', {href: promo.href, class:'btn pill', text: promo.cta}));
  return wrap;
}

function renderCard(product, promoDict){
  const card = el('article', {class:'card glass product-card reveal', 'data-material': product.material});

  if(product.promo_id && promoDict[product.promo_id]){
    const rib = el('div', {class:'ribbon', text: promoDict[product.promo_id].title});
    card.append(rib);
  }

  const visual = el('div', {class:'product-visual'});
  if(product.image){
    const img = el('img', {src: product.image, alt: `Foto de ${product.name}`});
    visual.append(img);
  } else {
    const placeholder = el('div', {class:'placeholder', text:'Bosquejo en progreso'});
    visual.append(placeholder);
  }
  card.append(visual);

  card.append(el('div', {class:'tag', text: product.material}));
  card.append(el('div', {class:'title', text: product.name}));
  card.append(el('div', {class:'price', text: money(product.price_mxn)}));
  card.append(el('p', {text: product.desc}));

  if(product.sku){
    card.append(el('div', {class:'product-meta', text: `SKU · ${product.sku}`}));
  }

  if(Array.isArray(product.tags) && product.tags.length){
    const tags = el('div', {class:'tags'});
    product.tags.forEach(tag => tags.append(el('span', {class:'chip', text: `#${tag}`})));
    card.append(tags);
  }

  const actions = el('div', {class:'actions'});
  actions.append(el('a', {class:'btn', href:'#contacto', text:'Pedir por DM'}));
  actions.append(el('a', {class:'btn ghost', href:'#showroom', text:'Ver moodboard'}));
  card.append(actions);

  return card;
}

function makeSlider(slides){
  const slider = document.getElementById('promo-slider');
  const dotsWrap = document.getElementById('promo-dots');
  slides.forEach((slide, index) => {
    slider.appendChild(slide);
    const dot = el('div', {class:'dot' + (index === 0 ? ' active' : '')});
    dot.addEventListener('click', () => show(index));
    dotsWrap.appendChild(dot);
  });

  let current = 0;
  const total = slides.length;
  if(total === 0) return;

  function show(next){
    current = next;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === next));
    dotsWrap.querySelectorAll('.dot').forEach((dot, idx) => dot.classList.toggle('active', idx === next));
  }

  show(0);
  setInterval(() => show((current + 1) % total), 5000);
}

function enableReveal(){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('on');
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15});
  document.querySelectorAll('.reveal').forEach(node => io.observe(node));
}

async function bootstrap(){
  const [brand, promos, products] = await Promise.all([
    loadJSON('assets/data/brand.json'),
    loadJSON('assets/data/promos.json'),
    loadJSON('assets/data/products.json')
  ]);

  document.querySelectorAll('[data-brand]').forEach(node => node.textContent = brand.brand_name);
  document.querySelectorAll('[data-tagline]').forEach(node => node.textContent = brand.tagline);

  const headerSocial = document.getElementById('header-social');
  const footerSocial = document.getElementById('footer-social');
  renderSocial(headerSocial, brand.social);
  renderSocial(footerSocial, brand.social);

  const ig = document.querySelector('[data-instagram]');
  const fb = document.querySelector('[data-facebook]');
  const mail = document.querySelector('[data-email]');
  if(ig && brand.social.instagram) ig.setAttribute('href', brand.social.instagram);
  if(fb && brand.social.facebook) fb.setAttribute('href', brand.social.facebook);
  if(mail && brand.contact.email) mail.setAttribute('href', `mailto:${brand.contact.email}`);

  const activePromos = promos.filter(promo => promo.active).map(renderPromo);
  const promoDict = Object.fromEntries(promos.filter(promo => promo.active).map(promo => [promo.id, promo]));
  makeSlider(activePromos);

  const grid = document.getElementById('grid-catalogo');
  products.filter(product => product.active).forEach(product => grid.appendChild(renderCard(product, promoDict)));

  const filter = document.getElementById('filter-material');
  filter.addEventListener('change', () => {
    const val = filter.value;
    document.querySelectorAll('#grid-catalogo .card').forEach(card => {
      const mat = card.getAttribute('data-material');
      card.style.display = (val === 'all' || val === mat) ? '' : 'none';
    });
  });

  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll('#grid-catalogo .card').forEach(card => {
      const title = card.querySelector('.title').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      card.style.display = (title.includes(query) || description.includes(query)) ? '' : 'none';
    });
  });

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  enableReveal();
}

document.addEventListener('DOMContentLoaded', bootstrap);
