const express = require('express');
const router = express.Router();
const { Portfolio } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/portfolio'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.test(ext)) return cb(new Error('Only image files are allowed'));
  cb(null, true);
} });

// Helper function to clean empty strings
const cleanEmptyStrings = (data) => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === '') {
      cleaned[key] = null;
    }
  });
  return cleaned;
};

// Get all portfolio items
router.get('/', require('../middleware/auth').authOptional, async (req, res) => {
  try {
    let where = {};
    // If ?admin=true and user is authenticated, return all
    if (!(req.query.admin === 'true' && req.user)) {
      where.isVisible = true;
    }
    const portfolio = await Portfolio.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    const result = portfolio.map((p) => {
      const j = p.toJSON();
      if (j.image) j.imageUrl = `${req.protocol}://${req.get('host')}/uploads/portfolio/${j.image}`;
      return j;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching portfolio items',
      error: error.message,
    });
  }
});

// Get single portfolio item
router.get('/:id', async (req, res) => {
  try {
    const item = await Portfolio.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    const j = item.toJSON();
    if (j.image) j.imageUrl = `${req.protocol}://${req.get('host')}/uploads/portfolio/${j.image}`;
    res.json(j);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching portfolio item',
      error: error.message,
    });
  }
});

// Create portfolio item (all authenticated users)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    let itemData = cleanEmptyStrings(req.body);
    if (itemData.description) itemData.description = sanitizeHtml(itemData.description, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1','h2','h3','img','table','thead','tbody','tr','td']), allowedAttributes: { '*': ['href','align','alt','style','src'] } });
    if (req.file) {
      itemData.image = req.file.filename;
    }
    // Backend validation for required fields
    if (!itemData.name) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    const item = await Portfolio.create(itemData);
    const created = item.toJSON();
    if (created.image) created.imageUrl = `${req.protocol}://${req.get('host')}/uploads/portfolio/${created.image}`;
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating portfolio item',
      error: error.message,
    });
  }
});

// Update portfolio item (all authenticated users)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const item = await Portfolio.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    let updateData = cleanEmptyStrings(req.body);
    if (updateData.description) updateData.description = sanitizeHtml(updateData.description, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1','h2','h3','img','table','thead','tbody','tr','td']), allowedAttributes: { '*': ['href','align','alt','style','src'] } });
    if (req.file) {
      updateData.image = req.file.filename;
    }
    await item.update(updateData);
    const updated = item.toJSON();
    if (updated.image) updated.imageUrl = `${req.protocol}://${req.get('host')}/uploads/portfolio/${updated.image}`;
    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating portfolio item',
      error: error.message,
    });
  }
});

// Delete portfolio item (all authenticated users)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Portfolio.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    await item.destroy();
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting portfolio item',
      error: error.message,
    });
  }
});

// Toggle portfolio item Active/Exit status (all authenticated users)
router.patch('/:id/toggle-status', auth, async (req, res) => {
  try {
    const item = await Portfolio.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    item.status = item.status === 'Active' ? 'Exit' : 'Active';
    await item.save();
    res.json({ id: item.id, status: item.status });
  } catch (error) {
    res.status(500).json({
      message: 'Error toggling portfolio item status',
      error: error.message,
    });
  }
});

// Toggle portfolio item visibility (all authenticated users)
router.patch('/:id/toggle-visibility', auth, async (req, res) => {
  try {
    const item = await Portfolio.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    item.isVisible = !item.isVisible;
    await item.save();
    res.json({ id: item.id, isVisible: item.isVisible });
  } catch (error) {
    res.status(500).json({
      message: 'Error toggling portfolio item visibility',
      error: error.message,
    });
  }
});

module.exports = router; 