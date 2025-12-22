-- Suscriptores
CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  source TEXT,
  referrer TEXT,
  landing_path TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  user_agent TEXT
);

-- Campañas (WELCOME es una campaña especial siempre activa)
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  discount_type TEXT NOT NULL, -- "percent" | "amount"
  discount_value INTEGER NOT NULL,
  stackable INTEGER NOT NULL DEFAULT 0,
  stack_group TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Cupones (único por email + campaña)
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  redeemed_at TEXT,
  UNIQUE(email, campaign_id),
  FOREIGN KEY (email) REFERENCES subscribers(email) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Eventos (analytics mínimo / auditoría)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- "subscribe" | "coupon_issued" | "coupon_redeemed" | "admin_action"
  email TEXT,
  campaign_id TEXT,
  ip TEXT,
  created_at TEXT NOT NULL,
  payload_json TEXT
);

-- Seed: campaña WELCOME
INSERT OR IGNORE INTO campaigns (
  id, name, prefix, discount_type, discount_value, stackable, stack_group, active, created_at, updated_at
) VALUES (
  'WELCOME',
  'Bienvenida',
  'WELCOME',
  'percent',
  10,
  1,
  'welcome_plus_campaign',
  1,
  datetime('now'),
  datetime('now')
);
