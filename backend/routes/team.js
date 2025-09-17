const express = require('express');
const router = express.Router();
const { Team } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/team'));
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

// Get all team members
router.get('/', async (req, res) => {
  try {
    let where = {};
    // If ?admin=true and user is authenticated, return all
    if (!(req.query.admin === 'true' && req.user)) {
      where.status = 'active';
    }
    const team = await Team.findAll({
      where,
      order: [['order', 'ASC']],
    });
    const result = team.map((m) => {
      const j = m.toJSON();
      if (j.image) j.imageUrl = `${req.protocol}://${req.get('host')}/uploads/team/${j.image}`;
      return j;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching team members',
      error: error.message,
    });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const member = await Team.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    const j = member.toJSON();
    if (j.image) j.imageUrl = `${req.protocol}://${req.get('host')}/uploads/team/${j.image}`;
    res.json(j);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching team member',
      error: error.message,
    });
  }
});

// Create team member (all authenticated users)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    let memberData = cleanEmptyStrings(req.body);
    if (memberData.biography) memberData.biography = sanitizeHtml(memberData.biography, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1','h2','h3','img','table','thead','tbody','tr','td']), allowedAttributes: { '*': ['href','align','alt','style','src'] } });
    if (req.file) {
      memberData.image = req.file.filename;
    }
    const member = await Team.create(memberData);
    const created = member.toJSON();
    if (created.image) created.imageUrl = `${req.protocol}://${req.get('host')}/uploads/team/${created.image}`;
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating team member',
      error: error.message,
    });
  }
});

// Update team member (all authenticated users)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const member = await Team.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    let updateData = cleanEmptyStrings(req.body);
    if (updateData.biography) updateData.biography = sanitizeHtml(updateData.biography, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1','h2','h3','img','table','thead','tbody','tr','td']), allowedAttributes: { '*': ['href','align','alt','style','src'] } });
    if (req.file) {
      updateData.image = req.file.filename;
    }
    await member.update(updateData);
    const updated = member.toJSON();
    if (updated.image) updated.imageUrl = `${req.protocol}://${req.get('host')}/uploads/team/${updated.image}`;
    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating team member',
      error: error.message,
    });
  }
});

// Delete team member (all authenticated users)
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await Team.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    await member.destroy();
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting team member',
      error: error.message,
    });
  }
});

// Toggle team member active/inactive status (all authenticated users)
router.patch('/:id/toggle-status', auth, async (req, res) => {
  try {
    const member = await Team.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    member.status = member.status === 'active' ? 'inactive' : 'active';
    await member.save();
    res.json({ id: member.id, status: member.status });
  } catch (error) {
    res.status(500).json({
      message: 'Error toggling team member status',
      error: error.message,
    });
  }
});

// Image upload endpoint (admin only)
router.post('/upload', adminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename, path: `/uploads/team/${req.file.filename}` });
});

module.exports = router; 