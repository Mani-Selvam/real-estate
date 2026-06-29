const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// GET /api/bookings
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    const params = [];
    if (status) { params.push(status); where.push(`b.status = $${params.length}`); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const count = await pool.query(`SELECT COUNT(*) FROM bookings b ${whereClause}`, params);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT b.*, c.name as customer_name, c.mobile as customer_mobile, p.title as property_title, p.code as property_code
       FROM bookings b
       LEFT JOIN customers c ON b.customer_id = c.id
       LEFT JOIN properties p ON b.property_id = p.id
       ${whereClause} ORDER BY b.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.name as customer_name, c.mobile as customer_mobile, c.email as customer_email, p.title as property_title
       FROM bookings b LEFT JOIN customers c ON b.customer_id = c.id LEFT JOIN properties p ON b.property_id = p.id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    const payments = await pool.query('SELECT * FROM payments WHERE booking_id = $1 ORDER BY payment_date', [req.params.id]);
    res.json({ success: true, data: { ...result.rows[0], payments: payments.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings
router.post('/', protect, async (req, res) => {
  const { customer_id, property_id, booking_date, total_price, discount, notes } = req.body;
  try {
    const booking_number = 'BK' + Date.now();
    const final_price = (parseFloat(total_price) - parseFloat(discount || 0)).toFixed(2);
    const result = await pool.query(
      `INSERT INTO bookings (booking_number, customer_id, property_id, booking_date, total_price, discount, final_price, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [booking_number, customer_id, property_id, booking_date || new Date(), total_price, discount || 0, final_price, notes, req.user.id]
    );
    await pool.query('UPDATE properties SET status = $1 WHERE id = $2', ['booked', property_id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id
router.put('/:id', protect, async (req, res) => {
  const { booking_date, agreement_date, total_price, discount, status, notes } = req.body;
  try {
    const final_price = (parseFloat(total_price) - parseFloat(discount || 0)).toFixed(2);
    const result = await pool.query(
      `UPDATE bookings SET booking_date=$1, agreement_date=$2, total_price=$3, discount=$4, final_price=$5, status=$6, notes=$7, updated_at=NOW() WHERE id=$8 RETURNING *`,
      [booking_date, agreement_date, total_price, discount || 0, final_price, status, notes, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings/:id/payments
router.post('/:id/payments', protect, async (req, res) => {
  const { payment_type, amount, payment_date, payment_mode, reference_number, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO payments (booking_id, payment_type, amount, payment_date, payment_mode, reference_number, status, notes) VALUES ($1,$2,$3,$4,$5,$6,'completed',$7) RETURNING *`,
      [req.params.id, payment_type, amount, payment_date || new Date(), payment_mode, reference_number, notes]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/customers/all
router.get('/customers/all', protect, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    if (search) { params.push(`%${search}%`); where = `WHERE name ILIKE $1 OR mobile ILIKE $1 OR email ILIKE $1`; }
    params.push(limit, offset);
    const result = await pool.query(`SELECT * FROM customers ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings/customers
router.post('/customers', protect, async (req, res) => {
  const { name, mobile, email, address, id_proof_type, id_proof_number, lead_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (name, mobile, email, address, id_proof_type, id_proof_number, lead_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, mobile, email, address, id_proof_type, id_proof_number, lead_id || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
