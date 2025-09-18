const express = require('express');
const router = express.Router();
const { Blog } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/blog'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const sanitizeHtml = require('sanitize-html');
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

// Get all blogs
router.get('/', require('../middleware/auth').authOptional, async (req, res) => {
  try {
    let where = { deleted_at: null };
    // If ?admin=true and user is authenticated, return all
    if (!(req.query.admin === 'true' && req.user)) {
      where.status = 'published';
    }
    const blogs = await Blog.findAll({
      order: [['createdAt', 'DESC']],
      where,
    });
    const result = blogs.map((b) => {
      const j = b.toJSON();
      if (j.image) j.imageUrl = `${req.protocol}://${req.get('host')}/uploads/blog/${j.image}`;
      return j;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching blogs',
      error: error.message,
    });
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    const j = blog.toJSON();
    if (j.image) j.imageUrl = `${req.protocol}://${req.get('host')}/uploads/blog/${j.image}`;
    res.json(j);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching blog',
      error: error.message,
    });
  }
});

// Create blog (all authenticated users)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
  let blogData = cleanEmptyStrings(req.body);
  // sanitize rich text
  if (blogData.content) blogData.content = sanitizeHtml(blogData.content, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1','h2','h3','img','table','thead','tbody','tr','td']), allowedAttributes: { '*': ['href','align','alt','style','src'] } });
    if (req.file) {
      blogData.image = req.file.filename;
    }
    // Backend validation for required fields
    if (!blogData.title || !blogData.content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
    const blog = await Blog.create(blogData);
    const created = blog.toJSON();
    if (created.image) created.imageUrl = `${req.protocol}://${req.get('host')}/uploads/blog/${created.image}`;
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating blog',
      error: error.message,
    });
  }
});

// Update blog (all authenticated users)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
  let updateData = cleanEmptyStrings(req.body);
  if (updateData.content) updateData.content = sanitizeHtml(updateData.content, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1','h2','h3','img','table','thead','tbody','tr','td']), allowedAttributes: { '*': ['href','align','alt','style','src'] } });
    if (req.file) {
      updateData.image = req.file.filename;
    }
    await blog.update(updateData);
    const updated = blog.toJSON();
    if (updated.image) updated.imageUrl = `${req.protocol}://${req.get('host')}/uploads/blog/${updated.image}`;
    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating blog',
      error: error.message,
    });
  }
});

// Delete blog (all authenticated users)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    blog.deleted_at = new Date();
    blog.deleted_by = req.user.id;
    await blog.save();
    res.json({ message: 'Blog deleted successfully (soft delete)' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting blog',
      error: error.message,
    });
  }
});

// Toggle blog published/draft status (all authenticated users)
router.patch('/:id/toggle-status', auth, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    blog.status = blog.status === 'published' ? 'draft' : 'published';
    await blog.save();
    res.json({ id: blog.id, status: blog.status });
  } catch (error) {
    res.status(500).json({
      message: 'Error toggling blog status',
      error: error.message,
    });
  }
});

// Image upload endpoint (admin only)
router.post('/upload', adminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename, path: `/uploads/blog/${req.file.filename}` });
});

module.exports = router; 