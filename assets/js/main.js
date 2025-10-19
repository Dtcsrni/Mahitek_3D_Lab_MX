
async function loadJSON(path){ const res = await fetch(path); return res.json(); }
function el(tag, attrs={}, children=[]){ const e = document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{
  if(k==="class") e.className = v; else if(k==="text") e.textContent = v; else e.setAttribute(k,v);
}); children.forEach(c => e.appendChild(c)); return e; }
function money(n){ return `$${n} MXN`; }

const ICONS = {
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.8A5.2 5.2 0 1 1 6.8 13 5.2 5.2 0 0 1 12 7.8zm0 2A3.2 3.2 0 1 0 15.2 13 3.2 3.2 0 0 0 12 9.8zm5.6-3.1a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3H13.5V8.7c0-.9.2-1.5 1.6-1.5H17V4.4c-.8-.1-1.7-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V11H7.5v3h2.5v8h3.5z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.3a6.8 6.8 0 0 1-4.6-1.7v7.2a6.2 6.2 0 1 1-5-6.1v3.8a2.7 2.7 0 1 0 1.9 2.6V2h3.2a6.8 6.8 0 0 0 4.5 4.2z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.5a4 4 0 0 0-2.8-2.8C18.4 4 12 4 12 4s-6.4 0-8.2.7A4 4 0 0 0 1 7.5 41.6 41.6 0 0 0 1 12a41.6 41.6 0 0 0 1 4.5 4 4 0 0 0 2.8 2.8C5.6 20 12 20 12 20s6.4 0 8.2-.7A4 4 0 0 0 23 16.5 41.6 41.6 0 0 0 24 12a41.6 41.6 0 0 0-1-4.5zM10 15.5v-7l6 3.5z"/></svg>`
};

function socialLink(name, url){
  const a = el('a', {href:url, target:'_blank', rel:'noopener', title:name});
  a.innerHTML = ICONS[name] || '';
  return a;
}

function renderSocial(container, social){
  const wrap = el('div', {class:'social'});
  Object.entries(social).forEach(([k,v])=>{
    if(v) wrap.appendChild(socialLink(k, v));
  });
  container.appendChild(wrap);
}

function renderPromo(p){
  const wrap = el('div', {class:'promo slide'});
  wrap.append(el('div', {class:'t', text:p.title}));
  wrap.append(el('div', {class:'d', text:p.detail}));
  wrap.append(el('a', {href:p.href, class:'btn pill', text:p.cta}));
  return wrap;
}
function renderCard(prod, promoDict){
  const card = el('div', {class:'card reveal', 'data-material':prod.material});
  if(prod.promo_id && promoDict[prod.promo_id]){
    const rib = el('div', {class:'ribbon', text: promoDict[prod.promo_id].title});
    card.append(rib);
  }
  card.append(el('div', {class:'tag', text: prod.material}));
  card.append(el('div', {class:'title', text: prod.name}));
  card.append(el('div', {class:'price', text: money(prod.price_mxn)}));
  card.append(el('p', {text: prod.desc}));
  const acts = el('div', {class:'actions'});
  acts.append(el('a', {class:'btn', href:'#contacto', text:'Pedir'}));
  acts.append(el('a', {class:'btn ghost', href:'#', text:'Detalles'}));
  card.append(acts);
  return card;
}

function makeSlider(slides){
  const slider = document.getElementById('promo-slider');
  const dotsWrap = document.getElementById('promo-dots');
  slides.forEach((s,i)=>{
    slider.appendChild(s);
    const d = el('div',{class:'dot' + (i===0?' active':'')});
    d.addEventListener('click', ()=> show(i));
    dotsWrap.appendChild(d);
  });
  let cur = 0; const N = slides.length; if(N===0) return;
  function show(i){
    cur = i;
    slides.forEach((s,k)=> s.classList.toggle('active', k===i));
    dotsWrap.querySelectorAll('.dot').forEach((d,k)=> d.classList.toggle('active', k===i));
  }
  show(0);
  setInterval(()=> show((cur+1)%N), 5000);
}

function enableReveal(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(n => io.observe(n));
}

async function bootstrap(){
  const [brand, promos, products] = await Promise.all([
    loadJSON('assets/data/brand.json'),
    loadJSON('assets/data/promos.json'),
    loadJSON('assets/data/products.json')
  ]);

  // Brand and socials
  document.querySelectorAll('[data-brand]').forEach(n=> n.textContent = brand.brand_name);
  document.querySelectorAll('[data-tagline]').forEach(n=> n.textContent = brand.tagline);

  const headerSocial = document.getElementById('header-social');
  const footerSocial = document.getElementById('footer-social');
  renderSocial(headerSocial, brand.social);
  renderSocial(footerSocial, brand.social);

  // Contacts quick links for section
  const ig = document.querySelector('[data-instagram]');
  const fb = document.querySelector('[data-facebook]');
  const mail = document.querySelector('[data-email]');
  if(ig && brand.social.instagram) ig.setAttribute('href', brand.social.instagram);
  if(fb && brand.social.facebook) fb.setAttribute('href', brand.social.facebook);
  if(mail && brand.contact.email) mail.setAttribute('href', `mailto:${brand.contact.email}`);

  // Promo slider
  const activePromos = promos.filter(p=>p.active).map(renderPromo);
  const promoDict = Object.fromEntries(promos.filter(p=>p.active).map(p=>[p.id,p]));
  makeSlider(activePromos);

  // Catalog
  const grid = document.getElementById('grid-catalogo');
  products.filter(p=>p.active).forEach(p => grid.appendChild(renderCard(p, promoDict)));

  // Filters
  const filter = document.getElementById('filter-material');
  filter.addEventListener('change', ()=>{
    const val = filter.value;
    document.querySelectorAll("#grid-catalogo .card").forEach(card => {
      const mat = card.getAttribute('data-material');
      card.style.display = (val==="all" || val===mat) ? "" : "none";
    });
  });

  // Search
  const search = document.getElementById('search');
  search.addEventListener('input', ()=>{
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll("#grid-catalogo .card").forEach(card => {
      const t = card.querySelector('.title').textContent.toLowerCase();
      const d = card.querySelector('p').textContent.toLowerCase();
      card.style.display = (t.includes(q) || d.includes(q)) ? "" : "none";
    });
  });

  // Year
  document.querySelectorAll("[data-year]").forEach(el=> el.textContent = new Date().getFullYear());

  enableReveal();
}

document.addEventListener('DOMContentLoaded', bootstrap);
