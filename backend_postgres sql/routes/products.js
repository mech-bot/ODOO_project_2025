const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../utils/auth'); // if you stored it here
const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.username AS seller_username
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// CREATE product (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, price, image_url } = req.body;
    const seller_id = req.user.id;
    const q = `INSERT INTO products (title, description, category, price, image_url, seller_id)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const values = [title, description, category, price, image_url, seller_id];
    const r = await pool.query(q, values);
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// EDIT product - only seller can edit
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    // check owner
    const ownerRes = await pool.query('SELECT seller_id FROM products WHERE id=$1', [id]);
    if (!ownerRes.rows[0]) return res.status(404).json({ error: 'Not found' });
    if (ownerRes.rows[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const { title, description, category, price, image_url } = req.body;
    const q = `UPDATE products SET title=$1, description=$2, category=$3, price=$4, image_url=$5 WHERE id=$6 RETURNING *`;
    const r = await pool.query(q, [title, description, category, price, image_url, id]);
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// DELETE product (seller only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    // check owner
    const ownerRes = await pool.query('SELECT seller_id FROM products WHERE id=$1', [id]);
    if (!ownerRes.rows[0]) return res.status(404).json({ error: 'Not found' });
    if (ownerRes.rows[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await pool.query('DELETE FROM products WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
