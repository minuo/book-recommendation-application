const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// 用户偏好表
const Preference = sequelize.define('preference', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  favorite_categories: {
    type: Sequelize.JSON,
    allowNull: true
  },
  favorite_authors: {
    type: Sequelize.JSON,
    allowNull: true
  },
  preferred_language: {
    type: Sequelize.STRING(20),
    allowNull: true
  },
  reading_time: {
    type: Sequelize.ENUM('morning', 'afternoon', 'evening', 'night'),
    allowNull: true
  },
  reading_goal: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'preferences',
  timestamps: true,
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

// 建立关联
User.hasOne(Preference);
Preference.belongsTo(User);

module.exports = Preference;