export const METHODS = [
  { code: 'CODI', label: 'CoDi (QR)', note: 'Costo cero para ti.' },
  { code: 'TRANSFER', label: 'Transferencia/SPEI', note: 'Sin comisiones.' },
  { code: 'CARD_CLIP', label: 'Tarjeta (Clip contactless)', note: 'Sin recargo al cliente.' },
  { code: 'CASH', label: 'Efectivo', note: 'Pickup/eventos.' }
];

export function renderPayments() {
  const root = document.getElementById('pagos');
  if (!root) return;

  const container = document.createElement('div');
  container.className = 'container payments-grid';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.id = 'pagos-title';
  title.textContent = 'Métodos de pago';
  container.appendChild(title);

  const note = document.createElement('p');
  note.className = 'payments-note';
  note.textContent =
    'Pagas como prefieras: QR CoDi y transferencia sin comisiones; tarjeta (Clip) sin recargo.';
  container.appendChild(note);

  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  METHODS.forEach(m => {
    const card = document.createElement('article');
    card.className = 'card payment-card';
    card.innerHTML = `
      <div class="card-body">
        <h3 class="payment-label">${m.label}</h3>
        <p class="payment-note">${m.note}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
  root.appendChild(container);
}
