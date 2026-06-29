const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// POST /api/newsletter/subscribe (public)
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  try {
    await pool.query('INSERT INTO newsletter (email) VALUES ($1) ON CONFLICT (email) DO UPDATE SET is_active = true', [email]);
    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/newsletter (admin)
router.get('/', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM newsletter WHERE is_active = true ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/newsletter/:id (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    await pool.query('UPDATE newsletter SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
