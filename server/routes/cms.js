const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==================== BANNERS ====================
router.get('/banners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banners WHERE is_active = true ORDER BY sort_order, id');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.get('/banners/all', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banners ORDER BY sort_order, id');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/banners', protect, async (req, res) => {
  const { title, subtitle, button_text, button_link, sort_order, is_active } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO banners (title, subtitle, button_text, button_link, sort_order, is_active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, subtitle, button_text, button_link, sort_order || 0, is_active !== false]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/banners/:id', protect, async (req, res) => {
  const { title, subtitle, button_text, button_link, sort_order, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE banners SET title=$1, subtitle=$2, button_text=$3, button_link=$4, sort_order=$5, is_active=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [title, subtitle, button_text, button_link, sort_order, is_active, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.delete('/banners/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM banners WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/banners/:id/desktop-image', protect, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  await pool.query('UPDATE banners SET desktop_image=$1 WHERE id=$2', [url, req.params.id]);
  res.json({ success: true, url });
});
router.post('/banners/:id/mobile-image', protect, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  await pool.query('UPDATE banners SET mobile_image=$1 WHERE id=$2', [url, req.params.id]);
  res.json({ success: true, url });
});

// ==================== SERVICES ====================
router.get('/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE is_active = true ORDER BY sort_order, id');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.get('/services/all', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY sort_order, id');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/services', protect, async (req, res) => {
  const { title, description, icon, sort_order, is_active } = req.body;
  try {
    const result = await pool.query('INSERT INTO services (title, description, icon, sort_order, is_active) VALUES ($1,$2,$3,$4,$5) RETURNING *', [title, description, icon, sort_order || 0, is_active !== false]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/services/:id', protect, async (req, res) => {
  const { title, description, icon, sort_order, is_active } = req.body;
  try {
    const result = await pool.query('UPDATE services SET title=$1, description=$2, icon=$3, sort_order=$4, is_active=$5, updated_at=NOW() WHERE id=$6 RETURNING *', [title, description, icon, sort_order, is_active, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.delete('/services/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== GALLERY ====================
router.get('/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    let q = 'SELECT * FROM gallery WHERE is_active = true';
    const params = [];
    if (category) { params.push(category); q += ` AND category = $${params.length}`; }
    q += ' ORDER BY sort_order, id';
    const result = await pool.query(q, params);
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/gallery', protect, upload.array('images', 30), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files' });
    const { category, title } = req.body;
    const inserts = req.files.map((f, i) => pool.query('INSERT INTO gallery (title, image_url, category, sort_order) VALUES ($1,$2,$3,$4) RETURNING *', [title || f.originalname, `/uploads/${f.filename}`, category, i]));
    const results = await Promise.all(inserts);
    res.status(201).json({ success: true, data: results.map(r => r.rows[0]) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.delete('/gallery/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== TESTIMONIALS ====================
router.get('/testimonials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM testimonials WHERE is_active = true ORDER BY sort_order, id');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.get('/testimonials/all', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM testimonials ORDER BY sort_order, id');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/testimonials', protect, async (req, res) => {
  const { customer_name, designation, company, message, rating, sort_order, is_active } = req.body;
  try {
    const result = await pool.query('INSERT INTO testimonials (customer_name, designation, company, message, rating, sort_order, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [customer_name, designation, company, message, rating || 5, sort_order || 0, is_active !== false]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/testimonials/:id', protect, async (req, res) => {
  const { customer_name, designation, company, message, rating, sort_order, is_active } = req.body;
  try {
    const result = await pool.query('UPDATE testimonials SET customer_name=$1, designation=$2, company=$3, message=$4, rating=$5, sort_order=$6, is_active=$7 WHERE id=$8 RETURNING *', [customer_name, designation, company, message, rating, sort_order, is_active, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.delete('/testimonials/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM testimonials WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== FAQ ====================
router.get('/faqs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM faqs WHERE is_active = true ORDER BY sort_order, id');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/faqs', protect, async (req, res) => {
  const { question, answer, category, sort_order, is_active } = req.body;
  try {
    const result = await pool.query('INSERT INTO faqs (question, answer, category, sort_order, is_active) VALUES ($1,$2,$3,$4,$5) RETURNING *', [question, answer, category, sort_order || 0, is_active !== false]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/faqs/:id', protect, async (req, res) => {
  const { question, answer, category, sort_order, is_active } = req.body;
  try {
    const result = await pool.query('UPDATE faqs SET question=$1, answer=$2, category=$3, sort_order=$4, is_active=$5 WHERE id=$6 RETURNING *', [question, answer, category, sort_order, is_active, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.delete('/faqs/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM faqs WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== BLOG ====================
const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').trim();
router.get('/blog', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const count = await pool.query('SELECT COUNT(*) FROM blog_posts WHERE is_published = true');
    const result = await pool.query(`SELECT bp.*, au.name as author_name FROM blog_posts bp LEFT JOIN admin_users au ON bp.author_id = au.id WHERE bp.is_published = true ORDER BY bp.created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.get('/blog/all', protect, async (req, res) => {
  try {
    const result = await pool.query(`SELECT bp.*, au.name as author_name FROM blog_posts bp LEFT JOIN admin_users au ON bp.author_id = au.id ORDER BY bp.created_at DESC`);
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.get('/blog/:slug', async (req, res) => {
  try {
    const result = await pool.query(`SELECT bp.*, au.name as author_name FROM blog_posts bp LEFT JOIN admin_users au ON bp.author_id = au.id WHERE bp.slug = $1`, [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/blog', protect, async (req, res) => {
  const { title, content, excerpt, is_published, meta_title, meta_description, tags } = req.body;
  try {
    const slug = slugify(title) + '-' + Date.now();
    const result = await pool.query('INSERT INTO blog_posts (title, slug, content, excerpt, is_published, meta_title, meta_description, tags, author_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [title, slug, content, excerpt, is_published || false, meta_title, meta_description, tags, req.user.id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/blog/:id', protect, async (req, res) => {
  const { title, content, excerpt, is_published, meta_title, meta_description, tags } = req.body;
  try {
    const result = await pool.query('UPDATE blog_posts SET title=$1, content=$2, excerpt=$3, is_published=$4, meta_title=$5, meta_description=$6, tags=$7, updated_at=NOW() WHERE id=$8 RETURNING *', [title, content, excerpt, is_published, meta_title, meta_description, tags, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.delete('/blog/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM blog_posts WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/blog/:id/image', protect, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  await pool.query('UPDATE blog_posts SET featured_image=$1 WHERE id=$2', [url, req.params.id]);
  res.json({ success: true, url });
});

module.exports = router;
