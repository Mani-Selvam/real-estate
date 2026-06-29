const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// POST /api/enquiries/property (public)
router.post('/property', async (req, res) => {
  const { name, mobile, email, property_id, message } = req.body;
  if (!name || !mobile) return res.status(400).json({ success: false, message: 'Name and mobile are required' });
  try {
    const lead = await pool.query(
      `INSERT INTO leads (name, mobile, email, source, property_id, notes, status) VALUES ($1,$2,$3,'website',$4,$5,'new') RETURNING *`,
      [name, mobile, email, property_id || null, message]
    );
    await pool.query(
      'INSERT INTO lead_timeline (lead_id, action, note) VALUES ($1,$2,$3)',
      [lead.rows[0].id, 'Lead Created', 'Property enquiry submitted from website']
    );
    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', lead_id: lead.rows[0].id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/enquiries/site-visit (public)
router.post('/site-visit', async (req, res) => {
  const { name, mobile, email, property_id, preferred_date, preferred_time, remarks } = req.body;
  if (!name || !mobile) return res.status(400).json({ success: false, message: 'Name and mobile are required' });
  try {
    const lead = await pool.query(
      `INSERT INTO leads (name, mobile, email, source, property_id, notes, status) VALUES ($1,$2,$3,'website',$4,$5,'new') RETURNING *`,
      [name, mobile, email, property_id || null, remarks]
    );
    const visit = await pool.query(
      `INSERT INTO site_visits (lead_id, name, mobile, email, property_id, preferred_date, preferred_time, remarks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [lead.rows[0].id, name, mobile, email, property_id || null, preferred_date || null, preferred_time || null, remarks]
    );
    await pool.query(
      'INSERT INTO lead_timeline (lead_id, action, note) VALUES ($1,$2,$3)',
      [lead.rows[0].id, 'Site Visit Requested', `Site visit requested for ${preferred_date || 'TBD'}`]
    );
    res.status(201).json({ success: true, message: 'Site visit request submitted', data: visit.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/enquiries/contact (public)
router.post('/contact', async (req, res) => {
  const { name, mobile, email, subject, message } = req.body;
  if (!name || !message) return res.status(400).json({ success: false, message: 'Name and message required' });
  try {
    const result = await pool.query(
      `INSERT INTO contact_enquiries (name, mobile, email, subject, message) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, mobile, email, subject, message]
    );
    res.status(201).json({ success: true, message: 'Message sent successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/enquiries/contact (admin)
router.get('/contact', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const count = await pool.query('SELECT COUNT(*) FROM contact_enquiries');
    const result = await pool.query('SELECT * FROM contact_enquiries ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ success: true, data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/enquiries/site-visits (admin)
router.get('/site-visits', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sv.*, p.title as property_title FROM site_visits sv LEFT JOIN properties p ON sv.property_id = p.id ORDER BY sv.created_at DESC LIMIT 100`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/enquiries/contact/:id/read
router.put('/contact/:id/read', protect, async (req, res) => {
  try {
    await pool.query('UPDATE contact_enquiries SET is_read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
