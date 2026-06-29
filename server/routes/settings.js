const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/settings (public - for website)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json({ success: true, data: settings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/settings (admin)
router.put('/', protect, async (req, res) => {
  const updates = req.body;
  try {
    const queries = Object.entries(updates).map(([key, value]) =>
      pool.query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()', [key, value])
    );
    await Promise.all(queries);
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/settings/stats (public)
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, label, value FROM stats');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/settings/stats (admin)
router.put('/stats', protect, async (req, res) => {
  const { stats } = req.body;
  try {
    const queries = stats.map(s =>
      pool.query('INSERT INTO stats (key, label, value) VALUES ($1,$2,$3) ON CONFLICT (key) DO UPDATE SET label=$2, value=$3, updated_at=NOW()', [s.key, s.label, s.value])
    );
    await Promise.all(queries);
    res.json({ success: true, message: 'Stats updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/settings/logo
router.post('/logo', protect, upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  await pool.query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2', ['company_logo', url]);
  res.json({ success: true, url });
});

module.exports = router;
