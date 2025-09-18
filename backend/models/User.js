// User.js
// Sequelize model for the User entity in the admin portal backend.
// Handles fields, validation, password hashing, and password validation.

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Username cannot be empty' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Must be a valid email' },
          notEmpty: { msg: 'Email cannot be empty' },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        // Password is hashed in hooks below
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true, // Optional profile image
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  // Instance method to check password during login
  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
