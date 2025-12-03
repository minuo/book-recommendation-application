const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('book', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  author: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  isbn: {
    type: Sequelize.STRING(13),
    allowNull: true,
    unique: true
  },
  publisher: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  publish_date: {
    type: Sequelize.DATE,
    allowNull: true
  },
  pages: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  cover_url: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  rating: {
    type: Sequelize.DECIMAL(3, 1),
    allowNull: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  view_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  category: {
    type: Sequelize.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'books',
  timestamps: true,
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

module.exports = Book;