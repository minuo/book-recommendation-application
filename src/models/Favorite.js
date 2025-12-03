const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');

// 收藏表
const Favorite = sequelize.define('favorite', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  createdAt: 'add_time',
  updatedAt: false
});

// 建立关联
User.hasMany(Favorite);
Favorite.belongsTo(User);
Book.hasMany(Favorite);
Favorite.belongsTo(Book);

module.exports = Favorite;