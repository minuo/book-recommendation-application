const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// 加载环境变量
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// 导入路由
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const linkRoutes = require('./routes/linkRoutes');
const historyRoutes = require('./routes/historyRoutes');

// Swagger配置选项
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Recommendation API',
      version: '1.0.0',
      description: 'RESTful API for book recommendation application supporting web and WeChat mini-program',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

// 初始化Swagger文档
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// 配置Swagger UI路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 添加明确的swagger.json路由
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// 配置路由
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/links', linkRoutes);
app.use('/api/v1/history', historyRoutes);

// 404路由处理 - Express 5.x不再支持单独的'*'通配符，使用无路径中间件捕获所有未匹配路由
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    code: 'ENDPOINT_NOT_FOUND'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

// 导入所有模型
const User = require('./models/User');
const Book = require('./models/Book');
const DownloadLink = require('./models/DownloadLink');
const Favorite = require('./models/Favorite');
const Order = require('./models/Order');
const Preference = require('./models/Preference');
const PurchaseChannel = require('./models/PurchaseChannel');
const ReadingHistory = require('./models/ReadingHistory');

// 所有模型列表
const models = [
  User,
  Book,
  DownloadLink,
  Favorite,
  Order,
  Preference,
  PurchaseChannel,
  ReadingHistory
];

// 重置数据库函数
const resetDatabase = async () => {
  try {
    console.log('\n🔄 执行数据库重置操作...');
    
    // 清除所有表数据
    for (const model of models) {
      await model.destroy({ where: {}, truncate: false });
    }
    console.log('✅ 所有表数据已清除');
    
    // 重置SQLite自增序列
    for (const model of models) {
      await sequelize.query(`DELETE FROM sqlite_sequence WHERE name = '${model.tableName}'`);
    }
    console.log('✅ 所有表id自增序列已重置');
    
  } catch (error) {
    console.error('❌ 数据库重置失败:', error);
    throw error;
  }
};

// 数据库连接和模型同步
(async () => {
  try {
    // 只有在非测试环境中执行数据库备份操作
    if (process.env.NODE_ENV !== 'test') {
      // 检查并备份现有表
      const existingTables = await sequelize.getQueryInterface().showAllTables();
      
      // 如果存在users表，创建备份
      if (existingTables.includes('users')) {
        await sequelize.query('CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;');
      }
      
      // 如果存在books表，创建备份
      if (existingTables.includes('books')) {
        await sequelize.query('CREATE TABLE IF NOT EXISTS books_backup AS SELECT * FROM books;');
      }
      
      // 如果存在reading_history表，创建备份
      if (existingTables.includes('reading_history')) {
        await sequelize.query('CREATE TABLE IF NOT EXISTS reading_history_backup AS SELECT * FROM reading_history;');
      }
      
      // 如果存在recommendations表，创建备份
      if (existingTables.includes('recommendations')) {
        await sequelize.query('CREATE TABLE IF NOT EXISTS recommendations_backup AS SELECT * FROM recommendations;');
      }
      
      // 如果存在book_ratings表，创建备份
      if (existingTables.includes('book_ratings')) {
        await sequelize.query('CREATE TABLE IF NOT EXISTS book_ratings_backup AS SELECT * FROM book_ratings;');
      }
    }
    
    // 同步所有模型
    await sequelize.sync({
      alter: {
        drop: false // 不删除现有的表
      }
    });
    
    console.log('Database connected and models synced successfully');
    
    // 检查是否需要执行数据库重置
    const shouldReset = process.argv.includes('--reset-db') || process.env.RESET_DATABASE === 'true';
    if (shouldReset) {
      // 检查环境
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ 禁止在生产环境中执行数据库重置操作！');
        process.exit(1);
      }
      
      await resetDatabase();
      console.log('\n📝 数据库重置操作已完成');
    }
    
    // 只有在直接运行该文件时才启动服务器
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
      });
    }
  } catch (err) {
    console.error('Database connection or model sync failed:', err);
    // 只有在直接运行该文件时才调用process.exit()
    if (require.main === module) {
      process.exit(1);
    } else {
      // 在测试环境中，将错误传递给调用者
      throw err;
    }
  }
})();

module.exports = app;