/**
 * Helpers de validación ligera para módulos, DOM y datos.
 */

export function collectIssues(scope) {
  const warnings = [];
  const errors = [];

  return {
    scope,
    warnings,
    errors,
    warn(message) {
      warnings.push(`${scope}: ${message}`);
    },
    error(message) {
      errors.push(`${scope}: ${message}`);
    },
    summary(summary = {}) {
      return { summary, warnings, errors };
    }
  };
}

export function requireElement(selector, root = document, bag) {
  const el = root.querySelector(selector);
  if (!el && bag) {
    bag.warn(`Elemento requerido no encontrado: ${selector}`);
  }
  return el;
}

export function requireArray(value, name, bag) {
  if (!Array.isArray(value) || value.length === 0) {
    if (bag) bag.error(`Arreglo inválido o vacío: ${name}`);
    return false;
  }
  return true;
}

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;
const isNumber = value => typeof value === 'number' && Number.isFinite(value);

const isValidUrl = value => {
  if (!isNonEmptyString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch (_) {
    return false;
  }
};

function sampleIds(items, key = 'id', limit = 6) {
  return items
    .map(item => item?.[key] || item?.titulo || item?.nombre || 'sin-id')
    .slice(0, limit)
    .join(', ');
}

export function validateCatalogData(items) {
  const bag = collectIssues('catalogo');
  const summary = {
    total: Array.isArray(items) ? items.length : 0,
    activos: 0,
    faltantes: 0,
    sinPrecio: 0,
    sinImagen: 0,
    sinEstado: 0,
    conTags: 0
  };

  if (!Array.isArray(items)) {
    bag.error('Datos de catálogo no son un arreglo.');
    return bag.summary(summary);
  }

  const missing = [];
  const noPrice = [];
  const noState = [];

  items.forEach(item => {
    if (item?.estado === 'activo') summary.activos += 1;
    if (!isNonEmptyString(item?.estado)) {
      noState.push(item);
      summary.sinEstado += 1;
    }
    if (
      !isNonEmptyString(item?.id) ||
      !isNonEmptyString(item?.nombre) ||
      !isNonEmptyString(item?.categoria)
    ) {
      missing.push(item);
      summary.faltantes += 1;
    }

    const hasPrice = isNumber(item?.precio_mxn) || isNumber(item?.precio_rango_mxn);
    if (!hasPrice) {
      noPrice.push(item);
      summary.sinPrecio += 1;
    }
    if (!isNonEmptyString(item?.imagen)) {
      summary.sinImagen += 1;
    }
    if (Array.isArray(item?.tags) && item.tags.length > 0) {
      summary.conTags += 1;
    }
  });

  if (missing.length) {
    bag.error(
      `Productos con campos requeridos incompletos (${missing.length}): ${sampleIds(missing)}`
    );
  }
  if (noPrice.length) {
    bag.warn(`Productos sin precio definido (${noPrice.length}): ${sampleIds(noPrice)}`);
  }
  if (noState.length) {
    bag.warn(`Productos sin estado definido (${noState.length}): ${sampleIds(noState)}`);
  }
  if (summary.sinImagen > 0) {
    bag.warn(`Productos sin imagen (${summary.sinImagen}).`);
  }

  return bag.summary(summary);
}

export function validatePromosData(items) {
  const bag = collectIssues('promos');
  const summary = {
    total: Array.isArray(items) ? items.length : 0,
    activas: 0,
    sinPrecio: 0,
    sinTipo: 0,
    sinEstado: 0,
    fechasInvalidas: 0
  };

  if (!Array.isArray(items)) {
    bag.error('Datos de promociones no son un arreglo.');
    return bag.summary(summary);
  }

  const missing = [];
  const noPrice = [];
  const invalidDates = [];
  const noType = [];

  items.forEach(item => {
    if (item?.estado === 'activo') summary.activas += 1;
    if (!isNonEmptyString(item?.id) || !isNonEmptyString(item?.titulo)) {
      missing.push(item);
    }
    if (!isNonEmptyString(item?.estado)) {
      summary.sinEstado += 1;
    }
    if (!isNonEmptyString(item?.tipo)) {
      noType.push(item);
      summary.sinTipo += 1;
    }

    const hasPrice =
      isNumber(item?.precio_regular) ||
      isNumber(item?.precio_especial) ||
      isNumber(item?.monto_minimo);
    if (!hasPrice) {
      noPrice.push(item);
      summary.sinPrecio += 1;
    }

    if (item?.desde || item?.hasta) {
      const start = item?.desde ? new Date(item.desde) : null;
      const end = item?.hasta ? new Date(item.hasta) : null;
      const invalid =
        (start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()));
      const inverted = start && end && start > end;
      if (invalid || inverted) {
        invalidDates.push(item);
        summary.fechasInvalidas += 1;
      }
    }
  });

  if (missing.length) {
    bag.error(
      `Promos con campos requeridos incompletos (${missing.length}): ${sampleIds(missing)}`
    );
  }
  if (noPrice.length) {
    bag.warn(`Promos sin precio definido (${noPrice.length}): ${sampleIds(noPrice)}`);
  }
  if (noType.length) {
    bag.warn(`Promos sin tipo definido (${noType.length}): ${sampleIds(noType)}`);
  }
  if (summary.sinEstado > 0) {
    bag.warn(`Promos sin estado definido (${summary.sinEstado}).`);
  }
  if (invalidDates.length) {
    bag.warn(`Promos con fechas inválidas (${invalidDates.length}): ${sampleIds(invalidDates)}`);
  }

  return bag.summary(summary);
}

export function validateFaqData(items) {
  const bag = collectIssues('faq');
  const summary = {
    total: Array.isArray(items) ? items.length : 0,
    faltantes: 0,
    categorias: 0
  };

  if (!Array.isArray(items)) {
    bag.error('Datos de FAQ no son un arreglo.');
    return bag.summary(summary);
  }

  const missing = items.filter(item => !isNonEmptyString(item?.q) || !isNonEmptyString(item?.a));
  const categories = new Set(items.map(item => (item?.categoria || '').trim()).filter(Boolean));
  summary.faltantes = missing.length;
  summary.categorias = categories.size;

  if (missing.length) {
    bag.error(`Preguntas sin campos requeridos (${missing.length}): ${sampleIds(missing, 'q')}`);
  }

  return bag.summary(summary);
}

export function validateBrandData(brand) {
  const bag = collectIssues('brand');
  const summary = {
    tieneSocial: false,
    tieneEmail: false,
    socialValidas: 0
  };

  if (!brand || typeof brand !== 'object') {
    bag.error('brand.json inválido o vacío.');
    return bag.summary(summary);
  }

  if (!isNonEmptyString(brand?.brand_name)) {
    bag.error('brand_name faltante en brand.json.');
  }

  const social = brand?.social || {};
  const socialValues = Object.values(social).filter(value => isNonEmptyString(value));
  summary.tieneSocial = socialValues.length > 0;
  summary.socialValidas = socialValues.filter(value => isValidUrl(value)).length;
  if (!summary.tieneSocial) {
    bag.warn('brand.social vacío o sin URLs válidas.');
  } else if (summary.socialValidas === 0) {
    bag.warn('brand.social contiene URLs con formato inválido.');
  }

  const email = brand?.contact?.email;
  summary.tieneEmail = isNonEmptyString(email);
  if (summary.tieneEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    bag.warn('brand.contact.email tiene formato inválido.');
  }

  return bag.summary(summary);
}

export function validateSocialData(social) {
  const bag = collectIssues('social');
  const summary = {
    total: 0,
    validas: 0
  };

  if (!social || typeof social !== 'object') {
    bag.error('Datos de redes inválidos o vacíos.');
    return bag.summary(summary);
  }

  const entries = Object.entries(social);
  summary.total = entries.length;

  entries.forEach(([key, value]) => {
    if (!isNonEmptyString(value)) return;
    if (!isValidUrl(value)) {
      bag.warn(`URL social inválida (${key}).`);
      return;
    }
    summary.validas += 1;
  });

  if (summary.validas === 0) {
    bag.warn('Sin URLs sociales válidas.');
  }

  return bag.summary(summary);
}

export function validateNewsletterConfig({ apiBase, formAction, turnstileSiteKey }) {
  const bag = collectIssues('newsletter');
  const summary = {
    apiBase: Boolean(apiBase),
    formAction: Boolean(formAction),
    turnstile: Boolean(turnstileSiteKey)
  };

  if (!summary.apiBase && !summary.formAction) {
    bag.warn('Sin NEWSLETTER_API_BASE ni fallback de form action.');
  }
  if (summary.apiBase && !isValidUrl(apiBase) && !String(apiBase).includes('localhost')) {
    bag.warn('NEWSLETTER_API_BASE no tiene formato de URL válido.');
  }
  if (
    summary.apiBase &&
    !String(apiBase).startsWith('https://') &&
    !String(apiBase).includes('localhost')
  ) {
    bag.warn('NEWSLETTER_API_BASE no usa HTTPS.');
  }
  if (summary.formAction && !isValidUrl(formAction) && !String(formAction).startsWith('/')) {
    bag.warn('El action del formulario no parece URL válida.');
  }
  if (!summary.turnstile) {
    bag.warn('Turnstile deshabilitado (modo sin verificación).');
  }

  return bag.summary(summary);
}

export function validateLeadConfig({ apiBase, formAction, turnstileSiteKey }) {
  const bag = collectIssues('lead');
  const summary = {
    apiBase: Boolean(apiBase),
    formAction: Boolean(formAction),
    turnstile: Boolean(turnstileSiteKey)
  };

  if (!summary.apiBase && !summary.formAction) {
    bag.warn('Sin LEADS_API_BASE ni fallback de form action.');
  }
  if (summary.apiBase && !isValidUrl(apiBase) && !String(apiBase).includes('localhost')) {
    bag.warn('LEADS_API_BASE no tiene formato de URL válido.');
  }
  if (
    summary.apiBase &&
    !String(apiBase).startsWith('https://') &&
    !String(apiBase).includes('localhost')
  ) {
    bag.warn('LEADS_API_BASE no usa HTTPS.');
  }
  if (summary.formAction && !isValidUrl(formAction) && !String(formAction).startsWith('/')) {
    bag.warn('El action del formulario de lead no parece URL válida.');
  }
  if (!summary.turnstile) {
    bag.warn('Turnstile deshabilitado en lead (modo sin verificación).');
  }

  return bag.summary(summary);
}
