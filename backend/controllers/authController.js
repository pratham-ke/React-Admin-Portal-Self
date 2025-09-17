// authController.js
// Controller for authentication-related routes in the backend of the admin portal.
// Handles user signup, login, password reset, and current user profile.
// Used by routes/auth.js to process authentication requests.

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');
const { validateSignup, validateLogin, validateForgotPassword, validateResetPassword } = require('../validators/authValidator');
const { sendPasswordResetEmail } = require('../services/emailService');
const { generateResetToken, verifyResetToken } = require('../services/tokenService');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const privateKey = fs.readFileSync(path.join(__dirname, '../config/private.pem'), 'utf8');

/**
 * Register a new user
 * @route POST /api/auth/signup
 * @access Public
 */
const signup = async (req, res) => {
  try {
    // Validate input using the signup validator
    const { error } = validateSignup(req.body);
    if (error) {
      // Respond with validation errors
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { username, email, password } = req.body;

    // Check if a user with the same email or username already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      // Respond if user already exists
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Create a new user record
    const user = await User.create({
      username,
      email,
      password,
      role: 'user' // Default role
    });

    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    // Respond with user info and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: (function(){
        const u = user.toJSON();
        if (u.image) u.imageUrl = `${req.protocol}://${req.get('host')}/uploads/user/${u.image}`;
        return { id: u.id, username: u.username, email: u.email, role: u.role, imageUrl: u.imageUrl };
      })(),
    });
  } catch (error) {
    // Log and handle errors
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    // Validate input using the login validator
    const { error } = validateLogin(req.body);
    if (error) {
      // Respond with validation errors
      return res.status(400).json({
        success: false,
        message: error.details[0]?.message || 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, password } = req.body;
    let decryptedPassword = password;
    try {
      // Try to decrypt the password (if not encrypted, will fail and use plain)
      const buffer = Buffer.from(password, 'base64');
      decryptedPassword = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        buffer
      ).toString('utf8');
    } catch (e) {
      // If decryption fails, assume password is plain (for backward compatibility)
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Respond if user is not found
      return res.status(401).json({
        success: false,
        message: 'Please enter valid details.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      // Respond if user is inactive
      return res.status(403).json({
        success: false,
        message: 'User is not active, please contact the admin.'
      });
    }

    // Validate password using the model's method
    const isValidPassword = await user.validatePassword(decryptedPassword);
    if (!isValidPassword) {
      // Respond if password is incorrect
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      });
    }

    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    // Respond with user info and token
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: (function(){
        const u = user.toJSON();
        if (u.image) u.imageUrl = `${req.protocol}://${req.get('host')}/uploads/user/${u.image}`;
        return { id: u.id, username: u.username, email: u.email, role: u.role, imageUrl: u.imageUrl };
      })(),
    });
  } catch (error) {
    // Log and handle errors
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // Find user by primary key, exclude password from attributes
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      // Respond if user is not found
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Respond with user info
    const u = user.toJSON();
    if (u.image) u.imageUrl = `${req.protocol}://${req.get('host')}/uploads/user/${u.image}`;
    res.json({
      success: true,
      user: u
    });
  } catch (error) {
    // Log and handle errors
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Forgot password - send reset email
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res) => {
  try {
    // Validate input
    const { error } = validateForgotPassword(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid user.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken(user.id);
    
    // Store reset token in user record (you might want to add resetToken and resetTokenExpiry fields to User model)
    await user.update({
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
    });

    // Send email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    // Validate input
    const { error } = validateResetPassword(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { token, password } = req.body;

    // Verify token and get user ID
    const userId = verifyResetToken(token);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user || user.resetToken !== token || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    await user.update({
      password,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You might want to implement a blacklist for tokens if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  signup,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logout
}; 