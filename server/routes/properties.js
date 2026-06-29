const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').trim();

// GET /api/properties (public with search & filters)
router.get('/', async (req, res) => {
  try {
    const { search, location, category, bedrooms, bathrooms, min_price, max_price, min_area, max_area, facing, status = 'available', featured, project_id, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let where = ['p.is_published = true'];
    const params = [];
    if (search) { params.push(`%${search}%`); where.push(`(p.title ILIKE $${params.length} OR p.code ILIKE $${params.length})`); }
    if (location) { params.push(`%${location}%`); where.push(`pr.location ILIKE $${params.length}`); }
    if (category) { params.push(category); where.push(`p.category = $${params.length}`); }
    if (bedrooms) { params.push(parseInt(bedrooms)); where.push(`p.bedrooms = $${params.length}`); }
    if (bathrooms) { params.push(parseInt(bathrooms)); where.push(`p.bathrooms = $${params.length}`); }
    if (min_price) { params.push(parseFloat(min_price)); where.push(`p.price >= $${params.length}`); }
    if (max_price) { params.push(parseFloat(max_price)); where.push(`p.price <= $${params.length}`); }
    if (facing) { params.push(facing); where.push(`p.facing = $${params.length}`); }
    if (status) { params.push(status); where.push(`p.status = $${params.length}`); }
    if (featured === 'true') where.push('p.is_featured = true');
    if (project_id) { params.push(parseInt(project_id)); where.push(`p.project_id = $${params.length}`); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM properties p LEFT JOIN projects pr ON p.project_id = pr.id ${whereClause}`, params);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT p.*, pr.name as project_name, pr.location as project_location,
       COALESCE((SELECT json_agg(pi2.image_url ORDER BY pi2.sort_order) FROM property_images pi2 WHERE pi2.property_id = p.id LIMIT 3), '[]') as images
       FROM properties p
       LEFT JOIN projects pr ON p.project_id = pr.id
       ${whereClause} ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/admin
router.get('/admin', protect, async (req, res) => {
  try {
    const { search, status, category, project_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    const params = [];
    if (search) { params.push(`%${search}%`); where.push(`(p.title ILIKE $${params.length} OR p.code ILIKE $${params.length})`); }
    if (status) { params.push(status); where.push(`p.status = $${params.length}`); }
    if (category) { params.push(category); where.push(`p.category = $${params.length}`); }
    if (project_id) { params.push(parseInt(project_id)); where.push(`p.project_id = $${params.length}`); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM properties p ${whereClause}`, params);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT p.*, pr.name as project_name FROM properties p LEFT JOIN projects pr ON p.project_id = pr.id
       ${whereClause} ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, pr.name as project_name, pr.location as project_location FROM properties p
       LEFT JOIN projects pr ON p.project_id = pr.id WHERE p.id = $1 OR p.slug = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Property not found' });
    const prop = result.rows[0];
    const [images, videos] = await Promise.all([
      pool.query('SELECT * FROM property_images WHERE property_id = $1 ORDER BY sort_order', [prop.id]),
      pool.query('SELECT * FROM property_videos WHERE property_id = $1 ORDER BY sort_order', [prop.id]),
    ]);
    const related = await pool.query(
      `SELECT p.*, COALESCE((SELECT json_agg(pi2.image_url ORDER BY pi2.sort_order) FROM property_images pi2 WHERE pi2.property_id = p.id LIMIT 1), '[]') as images
       FROM properties p WHERE p.is_published = true AND p.id != $1 AND (p.category = $2 OR p.project_id = $3) LIMIT 4`,
      [prop.id, prop.category, prop.project_id]
    );
    res.json({ success: true, data: { ...prop, images: images.rows, videos: videos.rows, related: related.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/properties
router.post('/', protect, async (req, res) => {
  const { title, code, project_id, category, price, offer_price, area, bedrooms, bathrooms, facing, parking, description, amenities, floor_plan, google_map, nearby_places, status, is_featured, is_published, meta_title, meta_description, meta_keywords } = req.body;
  try {
    const slug = slugify(title) + '-' + Date.now();
    const result = await pool.query(
      `INSERT INTO properties (title, code, slug, project_id, category, price, offer_price, area, bedrooms, bathrooms, facing, parking, description, amenities, floor_plan, google_map, nearby_places, status, is_featured, is_published, meta_title, meta_description, meta_keywords)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING *`,
      [title, code, slug, project_id || null, category, price, offer_price, area, bedrooms, bathrooms, facing, parking || 0, description, amenities, floor_plan, google_map, nearby_places, status || 'available', is_featured || false, is_published || false, meta_title, meta_description, meta_keywords]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/properties/:id
router.put('/:id', protect, async (req, res) => {
  const { title, code, project_id, category, price, offer_price, area, bedrooms, bathrooms, facing, parking, description, amenities, floor_plan, google_map, nearby_places, status, is_featured, is_published, meta_title, meta_description, meta_keywords } = req.body;
  try {
    const result = await pool.query(
      `UPDATE properties SET title=$1, code=$2, project_id=$3, category=$4, price=$5, offer_price=$6, area=$7, bedrooms=$8, bathrooms=$9, facing=$10, parking=$11, description=$12, amenities=$13, floor_plan=$14, google_map=$15, nearby_places=$16, status=$17, is_featured=$18, is_published=$19, meta_title=$20, meta_description=$21, meta_keywords=$22, updated_at=NOW()
       WHERE id=$23 RETURNING *`,
      [title, code, project_id || null, category, price, offer_price, area, bedrooms, bathrooms, facing, parking || 0, description, amenities, floor_plan, google_map, nearby_places, status, is_featured, is_published, meta_title, meta_description, meta_keywords, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/properties/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/properties/:id/images
router.post('/:id/images', protect, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });
    const inserts = req.files.map((f, i) =>
      pool.query('INSERT INTO property_images (property_id, image_url, sort_order) VALUES ($1, $2, $3) RETURNING *', [req.params.id, `/uploads/${f.filename}`, i])
    );
    const results = await Promise.all(inserts);
    res.json({ success: true, data: results.map(r => r.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/properties/:id/images/:imageId
router.delete('/:id/images/:imageId', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM property_images WHERE id = $1 AND property_id = $2', [req.params.imageId, req.params.id]);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
