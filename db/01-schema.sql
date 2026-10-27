-- OrderDesk schema and seed data. Every password here is a workshop test value.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer',
  password_hash TEXT NOT NULL
);

CREATE TABLE products (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  price_kobo INTEGER NOT NULL
);

CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  product_id       INTEGER NOT NULL REFERENCES products(id),
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  delivery_address TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO users (id, email, name, role, password_hash) VALUES
  (1, 'admin@orderdesk.test',  'Site Admin',     'admin',    crypt('admin-password',  gen_salt('bf'))),
  (2, 'bola@orderdesk.test',   'Bola Adeyemi',   'customer', crypt('bola-password',   gen_salt('bf'))),
  (3, 'chidi@orderdesk.test',  'Chidi Okafor',   'customer', crypt('chidi-password',  gen_salt('bf'))),
  (4, 'dayo@orderdesk.test',   'Dayo Bakare',    'customer', crypt('dayo-password',   gen_salt('bf'))),
  (5, 'efe@orderdesk.test',    'Efe Omoregie',   'customer', crypt('efe-password',    gen_salt('bf'))),
  (6, 'funmi@orderdesk.test',  'Funmi Lawal',    'customer', crypt('funmi-password',  gen_salt('bf'))),
  (7, 'ada@orderdesk.test',    'Ada Nwosu',      'customer', crypt('ada-password',    gen_salt('bf')));
SELECT setval('users_id_seq', 7);

INSERT INTO products (name, price_kobo) VALUES
  ('Jollof Rice Tray', 1500000),
  ('Amala and Ewedu', 350000),
  ('Suya Platter', 800000),
  ('Puff-Puff Box', 200000),
  ('Zobo Bottle', 100000);
INSERT INTO products (name, price_kobo)
  SELECT 'Product ' || g, (g % 50 + 1) * 10000 FROM generate_series(1, 5000) AS g;

INSERT INTO orders (id, user_id, product_id, quantity, delivery_address) VALUES
  (1040, 2, 1, 2, '12 Ring Road, Ibadan'),
  (1041, 7, 3, 1, '4 Bodija Market Street, Ibadan'),
  (1042, 7, 5, 6, '4 Bodija Market Street, Ibadan'),
  (1043, 3, 1, 3, '27 Agodi GRA, Ibadan'),
  (1044, 5, 2, 1, '9 Mokola Hill, Ibadan'),
  (1045, 4, 4, 4, '15 Dugbe Road, Ibadan');
SELECT setval('orders_id_seq', 1045);
