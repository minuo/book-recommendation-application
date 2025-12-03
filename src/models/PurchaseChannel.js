const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Book = require('./Book');

// 购买渠道表
const PurchaseChannel = sequelize.define('purchase_channel', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  platform: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  url: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  is_promotion: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  promotion_price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true
  },
  shipping_info: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  stock_status: {
    type: Sequelize.ENUM('in_stock', 'out_of_stock', 'pre_order'),
    defaultValue: 'in_stock'
  },
  last_update_time: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  tableName: 'purchase_channels',
  timestamps: true,
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

// 建立关联
Book.hasMany(PurchaseChannel);
PurchaseChannel.belongsTo(Book);

module.exports = PurchaseChannel;