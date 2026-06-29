const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// GET /api/leads
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, source, assigned_to, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    const params = [];
    if (search) { params.push(`%${search}%`); where.push(`(l.name ILIKE $${params.length} OR l.mobile ILIKE $${params.length} OR l.email ILIKE $${params.length})`); }
    if (status) { params.push(status); where.push(`l.status = $${params.length}`); }
    if (source) { params.push(source); where.push(`l.source = $${params.length}`); }
    if (assigned_to) { params.push(parseInt(assigned_to)); where.push(`l.assigned_to = $${params.length}`); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM leads l ${whereClause}`, params);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT l.*, p.title as property_title, pr.name as project_name, au.name as assigned_name
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN projects pr ON l.project_id = pr.id
       LEFT JOIN admin_users au ON l.assigned_to = au.id
       ${whereClause} ORDER BY l.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leads/followups/today  ← must be before /:id
router.get('/followups/today', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, l.name as lead_name, l.mobile, l.email FROM followups f JOIN leads l ON f.lead_id = l.id WHERE f.follow_up_date = CURRENT_DATE AND f.status = 'pending' ORDER BY f.follow_up_time`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/leads/followups/:id/complete
router.put('/followups/:id/complete', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE followups SET status = 'completed', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Followup not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leads/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, p.title as property_title, pr.name as project_name, au.name as assigned_name
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN projects pr ON l.project_id = pr.id
       LEFT JOIN admin_users au ON l.assigned_to = au.id
       WHERE l.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Lead not found' });
    const timeline = await pool.query(
      `SELECT lt.*, au.name as created_by_name FROM lead_timeline lt LEFT JOIN admin_users au ON lt.created_by = au.id WHERE lt.lead_id = $1 ORDER BY lt.created_at DESC`,
      [req.params.id]
    );
    const followups = await pool.query('SELECT * FROM followups WHERE lead_id = $1 ORDER BY follow_up_date', [req.params.id]);
    res.json({ success: true, data: { ...result.rows[0], timeline: timeline.rows, followups: followups.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leads
router.post('/', protect, async (req, res) => {
  const { name, mobile, email, source, property_id, project_id, notes, assigned_to } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO leads (name, mobile, email, source, property_id, project_id, notes, assigned_to) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, mobile, email, source || 'manual', property_id || null, project_id || null, notes, assigned_to || null]
    );
    await pool.query(
      `INSERT INTO lead_timeline (lead_id, action, note, created_by) VALUES ($1, $2, $3, $4)`,
      [result.rows[0].id, 'Lead Created', `Lead created manually by admin`, req.user.id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/leads/:id
router.put('/:id', protect, async (req, res) => {
  const { name, mobile, email, source, property_id, project_id, status, notes, assigned_to } = req.body;
  try {
    const prev = await pool.query('SELECT status, assigned_to FROM leads WHERE id = $1', [req.params.id]);
    const result = await pool.query(
      `UPDATE leads SET name=$1, mobile=$2, email=$3, source=$4, property_id=$5, project_id=$6, status=$7, notes=$8, assigned_to=$9, updated_at=NOW() WHERE id=$10 RETURNING *`,
      [name, mobile, email, source, property_id || null, project_id || null, status, notes, assigned_to || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Lead not found' });
    const prevRow = prev.rows[0];
    if (prevRow.status !== status) {
      await pool.query('INSERT INTO lead_timeline (lead_id, action, note, created_by) VALUES ($1,$2,$3,$4)', [req.params.id, 'Status Changed', `Status changed from ${prevRow.status} to ${status}`, req.user.id]);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leads/:id/notes
router.post('/:id/notes', protect, async (req, res) => {
  const { note } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO lead_timeline (lead_id, action, note, created_by) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, 'Note Added', note, req.user.id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leads/:id/followups
router.post('/:id/followups', protect, async (req, res) => {
  const { follow_up_date, follow_up_time, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO followups (lead_id, follow_up_date, follow_up_time, notes, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, follow_up_date, follow_up_time || null, notes, req.user.id]
    );
    await pool.query('INSERT INTO lead_timeline (lead_id, action, note, created_by) VALUES ($1,$2,$3,$4)', [req.params.id, 'Follow-up Scheduled', `Follow-up scheduled for ${follow_up_date}`, req.user.id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
