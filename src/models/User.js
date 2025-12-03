const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nickname: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  avatar: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: true,
    unique: true
  },
  phone: {
    type: Sequelize.STRING(20),
    allowNull: true,
    unique: true
  },
  password_hash: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  wx_openid: {
    type: Sequelize.STRING(100),
    allowNull: true,
    unique: true
  },
  status: {
    type: Sequelize.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  role: {
    type: Sequelize.ENUM('admin', 'user'),
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

// 为User模型添加密码验证方法
User.prototype.validatePassword = async function(password) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User;