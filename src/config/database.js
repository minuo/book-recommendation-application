const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 创建SQLite数据库存储目录
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建Sequelize实例（使用SQLite）
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'test' || process.env.DB_NAME === ':memory:' ? ':memory:' : path.join(dbDir, 'book_recommendation.db'),
  pool: {
    max: 10,          // 最大连接数
    min: 0,           // 最小连接数
    acquire: 30000,   // 连接超时时间（毫秒）
    idle: 10000       // 空闲连接超时时间（毫秒）
  },
  define: {
    timestamps: true,   // 自动添加created_at和updated_at字段
    underscored: true,  // 使用下划线命名法
    freezeTableName: true  // 使用真实表名（不自动复数化）
  },
  logging: false // 禁用SQL日志输出
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// 同时支持两种导出方式：直接导出sequelize实例（向后兼容）和通过对象导出
module.exports = sequelize;
module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.testConnection = testConnection;