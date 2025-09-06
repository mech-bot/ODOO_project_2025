const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// Get all orders for current user with items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const ordersRes = await pool.query('SELECT id, total, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const orders = ordersRes.rows;

    // fetch items for each order
    for (let o of orders) {
      const itemsRes = await pool.query(`
        SELECT oi.product_id, oi.price, oi.quantity, p.title
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
      `, [o.id]);
      o.items = itemsRes.rows;
    }

    res.json(orders);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
