const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Book = require('./Book');

// 下载链接表
const DownloadLink = sequelize.define('download_link', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  url: {
    type: Sequelize.STRING(500),
    allowNull: false
  },
  platform: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  file_size: {
    type: Sequelize.STRING(20),
    allowNull: true
  },
  file_format: {
    type: Sequelize.STRING(10),
    allowNull: true
  },
  is_valid: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  last_check_time: {
    type: Sequelize.DATE,
    allowNull: true
  },
  download_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'download_links',
  timestamps: true,
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

// 建立关联
Book.hasMany(DownloadLink);
DownloadLink.belongsTo(Book);

module.exports = DownloadLink;