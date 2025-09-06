const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// GET cart items for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const q = `
      SELECT ci.quantity, p.id as product_id, p.title, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
    `;
    const r = await pool.query(q, [userId]);
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Add to cart (or increment)
router.post('/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const existing = await pool.query('SELECT id, quantity FROM cart_items WHERE user_id=$1 AND product_id=$2', [userId, productId]);
    if (existing.rows.length) {
      await pool.query('UPDATE cart_items SET quantity = quantity + 1 WHERE id = $1', [existing.rows[0].id]);
    } else {
      await pool.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1,$2,1)', [userId, productId]);
    }
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Remove from cart
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    await pool.query('DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2', [userId, productId]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Checkout: create order from cart (transaction)
router.post('/checkout', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userId = req.user.id;

    const cartRes = await client.query(`
      SELECT ci.product_id, ci.quantity, p.price
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
    `, [userId]);

    if (cartRes.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartRes.rows.reduce((s, r) => s + Number(r.price) * r.quantity, 0);

    const orderRes = await client.query('INSERT INTO orders (user_id, total) VALUES ($1,$2) RETURNING id, created_at', [userId, total]);
    const orderId = orderRes.rows[0].id;

    const insertPromises = cartRes.rows.map(r => {
      return client.query('INSERT INTO order_items (order_id, product_id, price, quantity) VALUES ($1,$2,$3,$4)', [orderId, r.product_id, r.price, r.quantity]);
    });
    await Promise.all(insertPromises);

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    await client.query('COMMIT');
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
