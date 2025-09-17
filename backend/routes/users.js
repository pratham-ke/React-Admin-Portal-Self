const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/user'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  // allow only jpg/jpeg/png
  const allowedExt = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExt.includes(ext)) return cb(new Error('Only JPG/JPEG/PNG image files are allowed'));
  cb(null, true);
} });

// Helper function to clean empty strings (only for optional fields)
const cleanEmptyStrings = (data) => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    // Only clean optional fields, not required ones like username, email, password
    if (cleaned[key] === '' && ['image'].includes(key)) {
      cleaned[key] = null;
    }
  });
  return cleaned;
};

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      where: { deleted_at: null },
    });
    // attach full image URLs when possible
    const result = users.map((u) => {
      const j = u.toJSON();
      if (j.image) j.imageUrl = `${req.protocol}://${req.get('host')}/uploads/user/${j.image}`;
      return j;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message,
    });
  }
});

// Get a single user by ID (admin only)
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user || user.deleted_at) {
      return res.status(404).json({ message: 'User not found' });
    }
    const j = user.toJSON();
    if (j.image) j.imageUrl = `${req.protocol}://${req.get('host')}/uploads/user/${j.image}`;
    res.json(j);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

// Create new user (admin only)
router.post('/', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
  const { username, email, password, confirmPassword, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists',
      });
    }

    // Validate password and confirmPassword
    const pwd = password || '';
    const confirm = confirmPassword || '';
    const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&!^*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!pwdRe.test(pwd)) {
      return res.status(400).json({ message: 'Password must be 8+ characters and include uppercase, lowercase, digit and special character' });
    }
    if (pwd !== confirm) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    // Create new user
    // sanitize username/email
    const userData = {
      username: sanitizeHtml(username || ''),
      email: sanitizeHtml(email || ''),
      password: pwd,
      role: role || 'user',
    };
    if (req.file) {
      userData.image = req.file.filename;
    }
    // Hash password before storing
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const user = await User.create(userData);

    // Return user without password and include imageUrl
    const created = user.toJSON();
    if (created.image) created.imageUrl = `${req.protocol}://${req.get('host')}/uploads/user/${created.image}`;
    const { password: _, ...userWithoutPassword } = created;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating user',
      error: error.message,
    });
  }
});

// Update user (admin only)
router.put('/:id', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
  const { username, email, role, password, confirmPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email or username is already taken by another user
    if (email !== user.email || username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
          id: { [Op.ne]: id },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email or username already exists',
        });
      }
    }

    // Update user
    let updateData = { username: sanitizeHtml(username || ''), email: sanitizeHtml(email || ''), role };
    if (req.file) {
      updateData.image = req.file.filename;
    }
    // If password provided, validate & hash
    if (password) {
      const pwd = password || '';
      const confirm = confirmPassword || '';
      const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&!^*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      if (!pwdRe.test(pwd)) {
        return res.status(400).json({ message: 'Password must be 8+ characters and include uppercase, lowercase, digit and special character' });
      }
      if (pwd !== confirm) {
        return res.status(400).json({ message: 'Password and confirm password do not match' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(pwd, salt);
    }
    await user.update(updateData);

    // Return updated user without password and include imageUrl
    const updated = user.toJSON();
    if (updated.image) updated.imageUrl = `${req.protocol}://${req.get('host')}/uploads/user/${updated.image}`;
    const { password: _, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating user',
      error: error.message,
    });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.deleted_at = new Date();
    user.deleted_by = req.user.id;
    await user.save();
    res.json({ message: 'User deleted successfully (soft delete)' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message,
    });
  }
});

// Toggle user active/inactive status (admin only)
router.patch('/:id/toggle-active', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ id: user.id, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({
      message: 'Error toggling user status',
      error: error.message,
    });
  }
});

// Change password (authenticated user)
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // Find the user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Decrypt passwords if needed (RSA)
    const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem'), 'utf8');
    let decryptedCurrent = currentPassword;
    let decryptedNew = newPassword;
    try {
      decryptedCurrent = crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(currentPassword, 'base64')).toString('utf8');
    } catch (e) {}
    try {
      decryptedNew = crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(newPassword, 'base64')).toString('utf8');
    } catch (e) {}

    // Validate current password
    const isValid = await user.validatePassword(decryptedCurrent);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update to new password
    user.password = decryptedNew;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

module.exports = router; 