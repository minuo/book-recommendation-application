const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');

// 购买记录表
const Order = sequelize.define('order', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  platform: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  order_no: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('pending', 'paid', 'shipped', 'completed'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

// 建立关联
User.hasMany(Order);
Order.belongsTo(User);
Book.hasMany(Order);
Order.belongsTo(Book);

module.exports = Order;