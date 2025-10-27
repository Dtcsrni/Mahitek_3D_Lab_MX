export const TICKET_MIN = 40;
export const PACKS = [
  { price: 5, units: 2 },
  { price: 10, units: 4 },
  { price: 20, units: 10 },
  { price: 30, units: 15 },
  { price: 50, units: 25 }
];

const UNIT_PRICE = 3; // público

function pricePerUnit(pack) {
  return pack.price / pack.units;
}

function clone(arr) {
  return JSON.parse(JSON.stringify(arr));
}

// Devuelve la mejor combinación de packs para alcanzar al menos targetUnits
// Criterios: 1) coste por unidad mínimo 2) coste total mínimo 3) unidades totales mínimas (menor sobrestock)
export function selectBestPack(targetUnits) {
  if (!Number.isFinite(targetUnits) || targetUnits <= 0) return null;
  // Límite superior razonable para buscar con margen
  const maxUnits = targetUnits + 25; // una ventana de hasta el pack más grande

  // DP: costo mínimo para alcanzar exactamente u unidades (o Infinity si no alcanzable exacto)
  const INF = 1e9;
  const dp = Array(maxUnits + 1).fill(INF);
  const choice = Array(maxUnits + 1).fill(null);
  dp[0] = 0;

  for (let u = 1; u <= maxUnits; u++) {
    for (const p of PACKS) {
      const prev = u - p.units;
      if (prev >= 0 && dp[prev] + p.price < dp[u]) {
        dp[u] = dp[prev] + p.price;
        choice[u] = p;
      }
    }
  }

  // Evaluar candidatos u >= targetUnits
  let best = null;
  for (let u = targetUnits; u <= maxUnits; u++) {
    if (dp[u] >= INF) continue;
    const totalPrice = dp[u];
    const ppu = totalPrice / u; // precio por unidad efectivo
    const candidate = { units: u, price: totalPrice, ppu };
    if (!best) best = candidate;
    else {
      if (
        candidate.ppu < best.ppu - 1e-9 ||
        (Math.abs(candidate.ppu - best.ppu) < 1e-9 && candidate.price < best.price) ||
        (Math.abs(candidate.ppu - best.ppu) < 1e-9 &&
          Math.abs(candidate.price - best.price) < 1e-9 &&
          candidate.units < best.units)
      ) {
        best = candidate;
      }
    }
  }

  if (!best) return null;

  // Reconstruir desglose de packs
  let remaining = best.units;
  const breakdown = [];
  while (remaining > 0) {
    const p = choice[remaining];
    if (!p) break;
    const last = breakdown[breakdown.length - 1];
    if (last && last.price === p.price && last.units === p.units) {
      last.count += 1;
    } else {
      breakdown.push({ ...p, count: 1 });
    }
    remaining -= p.units;
  }

  return { units: best.units, price: best.price, pricePerUnit: best.ppu, breakdown };
}

export function suggestToReachMin(subtotal) {
  return Math.max(0, TICKET_MIN - subtotal);
}

export function bestValueFor(units) {
  const solo = { mode: 'unit', units, price: units * UNIT_PRICE, pricePerUnit: UNIT_PRICE };
  const pack = selectBestPack(units);
  if (!pack) return solo;
  if (pack.price < solo.price) {
    return { mode: 'pack', ...pack, savings: solo.price - pack.price };
  }
  return solo;
}

export function renderPromos() {
  const root = document.getElementById('promos-stickers');
  if (!root) return;
  const container = document.createElement('div');
  container.className = 'container promo-grid';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.id = 'promos-stickers-title';
  title.textContent = 'Promociones de Stickers 50×50';
  container.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'section-subtitle';
  subtitle.textContent = 'Ahorra más con packs: mejor precio por unidad que suelto ($3).';
  container.appendChild(subtitle);

  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  PACKS.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card promo-card';
    const ppu = (p.price / p.units).toFixed(2);
    const solo = p.units * UNIT_PRICE;
    const savings = Math.max(0, solo - p.price);

    let highlights = '';
    if (p.units >= 25) highlights += '<span class="badge badge--value">Mejor valor</span> ';
    else if (p.units === 10)
      highlights += '<span class="badge badge--bestseller">Más vendido</span> ';
    else if (p.units === 2) highlights += '<span class="badge badge--entry">Entrada</span> ';

    const saveBadge = savings > 0 ? `<span class="badge badge-save">Ahorra $${savings}</span>` : '';

    card.innerHTML = `
      <div class="card-body">
        <h3 class="promo-price">$${p.price} MXN</h3>
        <p class="promo-units">${p.units} unidades</p>
        <div class="promo-badges">${highlights}<span class="badge badge-ppu">$${ppu}/ud</span> ${saveBadge}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Ayuda visual del ticket mínimo
  const note = document.createElement('p');
  note.className = 'promo-note';
  note.textContent = `Piso de ticket: $${TICKET_MIN} MXN · Precio suelto: $${UNIT_PRICE} MXN/ud`;

  container.appendChild(grid);
  container.appendChild(note);
  root.appendChild(container);
}
