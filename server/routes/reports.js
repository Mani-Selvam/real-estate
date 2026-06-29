const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// GET /api/reports/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [
      todayLeads, totalLeads, totalProperties, totalProjects,
      availableProps, bookings, todayFollowups, recentLeads,
      leadsBySource, propertyByStatus, monthlyLeads
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM leads WHERE DATE(created_at) = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM leads`),
      pool.query(`SELECT COUNT(*) FROM properties WHERE is_published = true`),
      pool.query(`SELECT COUNT(*) FROM projects WHERE is_published = true`),
      pool.query(`SELECT COUNT(*) FROM properties WHERE status = 'available' AND is_published = true`),
      pool.query(`SELECT COUNT(*) FROM bookings`),
      pool.query(`SELECT COUNT(*) FROM followups WHERE follow_up_date = CURRENT_DATE AND status = 'pending'`),
      pool.query(`SELECT l.*, p.title as property_title FROM leads l LEFT JOIN properties p ON l.property_id = p.id ORDER BY l.created_at DESC LIMIT 10`),
      pool.query(`SELECT source, COUNT(*) as count FROM leads GROUP BY source ORDER BY count DESC`),
      pool.query(`SELECT status, COUNT(*) as count FROM properties GROUP BY status`),
      pool.query(`SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count FROM leads WHERE created_at > NOW() - INTERVAL '6 months' GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at) ORDER BY DATE_TRUNC('month', created_at)`),
    ]);
    const revenue = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`);
    res.json({
      success: true,
      data: {
        stats: {
          today_leads: parseInt(todayLeads.rows[0].count),
          total_leads: parseInt(totalLeads.rows[0].count),
          total_properties: parseInt(totalProperties.rows[0].count),
          total_projects: parseInt(totalProjects.rows[0].count),
          available_properties: parseInt(availableProps.rows[0].count),
          total_bookings: parseInt(bookings.rows[0].count),
          today_followups: parseInt(todayFollowups.rows[0].count),
          total_revenue: parseFloat(revenue.rows[0].total),
        },
        recent_leads: recentLeads.rows,
        leads_by_source: leadsBySource.rows,
        property_by_status: propertyByStatus.rows,
        monthly_leads: monthlyLeads.rows,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/leads
router.get('/leads', protect, async (req, res) => {
  try {
    const { from, to } = req.query;
    let where = '';
    const params = [];
    if (from && to) {
      params.push(from, to);
      where = `WHERE l.created_at::date BETWEEN $1 AND $2`;
    }
    const result = await pool.query(
      `SELECT l.*, p.title as property_title, au.name as assigned_name FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN admin_users au ON l.assigned_to = au.id
       ${where} ORDER BY l.created_at DESC`,
      params
    );
    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/revenue
router.get('/revenue', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT py.*, b.booking_number, c.name as customer_name, p.title as property_title
       FROM payments py
       LEFT JOIN bookings b ON py.booking_id = b.id
       LEFT JOIN customers c ON b.customer_id = c.id
       LEFT JOIN properties p ON b.property_id = p.id
       WHERE py.status = 'completed' ORDER BY py.payment_date DESC`
    );
    const total = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`);
    res.json({ success: true, data: result.rows, total_revenue: parseFloat(total.rows[0].total) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
