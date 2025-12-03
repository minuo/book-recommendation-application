const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');

// 阅读历史表
const ReadingHistory = sequelize.define('reading_history', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  page: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'reading_history',
  timestamps: true,
  createdAt: 'view_time',
  updatedAt: false
});

// 建立关联
User.hasMany(ReadingHistory);
ReadingHistory.belongsTo(User);
Book.hasMany(ReadingHistory);
ReadingHistory.belongsTo(Book);

module.exports = ReadingHistory;