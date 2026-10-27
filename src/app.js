const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
const config = require('./config');

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

function createApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const q =
        "SELECT id, email, role FROM users WHERE email='" + email +
        "' AND password_hash = crypt('" + password + "', password_hash)";
      const { rows } = await db.query(q);
      if (rows.length === 0) return res.status(401).json({ error: 'invalid credentials' });

      const user = rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/orders/:id', requireAuth, async (req, res, next) => {
    try {
      const { rows } = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'not found' });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/orders', requireAuth, async (req, res, next) => {
    try {
      const { productId, quantity, deliveryAddress } = req.body;
      const { rows } = await db.query(
        'INSERT INTO orders (user_id, product_id, quantity, delivery_address) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.id, productId, quantity, deliveryAddress],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/search', async (req, res, next) => {
    try {
      const q = req.query.q || '';
      const { rows } = await db.query(
        "SELECT id, name, price_kobo FROM products WHERE name ILIKE '%" + q + "%' LIMIT 20",
      );
      res.json({ results: rows });
    } catch (err) {
      next(err);
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  });

  return app;
}

module.exports = { createApp };
