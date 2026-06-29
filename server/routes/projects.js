const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').trim();

// GET /api/projects (public)
router.get('/', async (req, res) => {
  try {
    const { status, featured, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    let where = ['is_published = true'];
    const params = [];
    if (status) { params.push(status); where.push(`status = $${params.length}`); }
    if (featured === 'true') where.push('is_featured = true');
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM projects ${whereClause}`, params);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT p.*, COALESCE(
        (SELECT json_agg(pg2.image_url ORDER BY pg2.sort_order) FROM project_gallery pg2 WHERE pg2.project_id = p.id LIMIT 1), '[]'
      ) as gallery_images
      FROM projects p ${whereClause} ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/admin (admin - all projects)
router.get('/admin', protect, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    const params = [];
    if (search) { params.push(`%${search}%`); where.push(`(p.name ILIKE $${params.length} OR p.code ILIKE $${params.length})`); }
    if (status) { params.push(status); where.push(`p.status = $${params.length}`); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM projects p ${whereClause}`, params);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT p.*, (SELECT COUNT(*) FROM properties WHERE project_id = p.id) as property_count
       FROM projects p ${whereClause} ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1 OR slug = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
    const project = result.rows[0];
    const [gallery, videos, floorPlans, properties] = await Promise.all([
      pool.query('SELECT * FROM project_gallery WHERE project_id = $1 ORDER BY sort_order', [project.id]),
      pool.query('SELECT * FROM project_videos WHERE project_id = $1 ORDER BY sort_order', [project.id]),
      pool.query('SELECT * FROM project_floor_plans WHERE project_id = $1 ORDER BY sort_order', [project.id]),
      pool.query('SELECT * FROM properties WHERE project_id = $1 AND is_published = true LIMIT 6', [project.id]),
    ]);
    res.json({ success: true, data: { ...project, gallery: gallery.rows, videos: videos.rows, floor_plans: floorPlans.rows, properties: properties.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects
router.post('/', protect, async (req, res) => {
  const { name, code, description, location, google_map, price_starting_from, status, possession_date, amenities, is_featured, is_published, meta_title, meta_description, meta_keywords } = req.body;
  try {
    const slug = slugify(name) + '-' + Date.now();
    const result = await pool.query(
      `INSERT INTO projects (name, code, slug, description, location, google_map, price_starting_from, status, possession_date, amenities, is_featured, is_published, meta_title, meta_description, meta_keywords)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [name, code, slug, description, location, google_map, price_starting_from, status || 'upcoming', possession_date || null, amenities, is_featured || false, is_published || false, meta_title, meta_description, meta_keywords]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', protect, async (req, res) => {
  const { name, code, description, location, google_map, price_starting_from, status, possession_date, amenities, brochure, is_featured, is_published, meta_title, meta_description, meta_keywords } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects SET name=$1, code=$2, description=$3, location=$4, google_map=$5, price_starting_from=$6, status=$7, possession_date=$8, amenities=$9, brochure=$10, is_featured=$11, is_published=$12, meta_title=$13, meta_description=$14, meta_keywords=$15, updated_at=NOW()
       WHERE id=$16 RETURNING *`,
      [name, code, description, location, google_map, price_starting_from, status, possession_date || null, amenities, brochure, is_featured, is_published, meta_title, meta_description, meta_keywords, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:id/gallery
router.post('/:id/gallery', protect, upload.array('images', 20), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });
    const inserts = files.map((f, i) =>
      pool.query('INSERT INTO project_gallery (project_id, image_url, sort_order) VALUES ($1, $2, $3) RETURNING *', [req.params.id, `/uploads/${f.filename}`, i])
    );
    const results = await Promise.all(inserts);
    res.json({ success: true, data: results.map(r => r.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id/gallery/:imageId
router.delete('/:id/gallery/:imageId', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM project_gallery WHERE id = $1 AND project_id = $2', [req.params.imageId, req.params.id]);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:id/brochure
router.post('/:id/brochure', protect, upload.single('brochure'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE projects SET brochure = $1 WHERE id = $2', [url, req.params.id]);
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
