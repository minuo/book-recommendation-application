const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Book = require('../src/models/Book');

// 加载环境变量
dotenv.config();

// 初始化默认数据
const initDefaultData = async () => {
  try {
    console.log('\n=== 开始初始化默认数据 ===');
    
    // 1. 初始化默认用户
    console.log('开始初始化默认用户...');
    
    // 先清除现有用户数据
    await User.destroy({ where: {} });
    
    // 创建默认管理员用户
    const adminNickname = process.env.ADMIN_NICKNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminSalt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash(adminPassword, adminSalt);
    
    await User.create({
      nickname: adminNickname,
      email: adminEmail,
      password_hash: adminHashedPassword,
      status: 'active',
      role: 'admin' // 设置为管理员角色
    });
    console.log('✅ 默认管理员用户创建成功');
    
    // 创建默认普通用户
    const regularUserNickname = process.env.REGULAR_USER_NICKNAME || 'user';
    const regularUserEmail = process.env.REGULAR_USER_EMAIL || 'user@example.com';
    const regularUserPassword = process.env.REGULAR_USER_PASSWORD || 'user123';
    const userSalt = await bcrypt.genSalt(10);
    const userHashedPassword = await bcrypt.hash(regularUserPassword, userSalt);
    
    await User.create({
      nickname: regularUserNickname,
      email: regularUserEmail,
      password_hash: userHashedPassword,
      status: 'active',
      role: 'user' // 设置为普通用户角色
    });
    console.log('✅ 默认普通用户创建成功');
    
    console.log('默认用户初始化完成');
    
    // 2. 初始化测试图书数据
    const bookCount = await Book.count();
    if (bookCount === 0) {
      await Book.bulkCreate([
        {
          title: 'JavaScript高级程序设计',
          author: 'Nicholas C. Zakas',
          isbn: '9787115546081',
          publisher: '人民邮电出版社',
          publish_date: '2020-07-01',
          pages: 952,
          cover_url: 'https://example.com/covers/js-advanced.jpg',
          rating: 4.8,
          description: '本书是JavaScript领域的经典著作，全面介绍了JavaScript语言的核心概念和高级特性。',
          view_count: 1000,
          category: '前端开发'
        },
        {
          title: 'React实战',
          author: 'Alex Banks',
          isbn: '9787115461119',
          publisher: '人民邮电出版社',
          publish_date: '2018-03-01',
          pages: 428,
          cover_url: 'https://example.com/covers/react-in-action.jpg',
          rating: 4.6,
          description: '本书通过实际项目深入讲解React框架的核心概念和最佳实践。',
          view_count: 800,
          category: '前端开发'
        },
        {
          title: 'Node.js实战',
          author: 'Mike Cantelon',
          isbn: '9787115397910',
          publisher: '人民邮电出版社',
          publish_date: '2015-08-01',
          pages: 396,
          cover_url: 'https://example.com/covers/node-in-action.jpg',
          rating: 4.5,
          description: '本书全面介绍了Node.js的核心概念和实际应用开发。',
          view_count: 600,
          category: '后端开发'
        },
        {
          title: 'Python编程：从入门到实践',
          author: 'Eric Matthes',
          isbn: '9787115428028',
          publisher: '人民邮电出版社',
          publish_date: '2016-07-01',
          pages: 442,
          cover_url: 'https://example.com/covers/python-crash-course.jpg',
          rating: 4.7,
          description: '本书是Python入门的经典教材，通过实际项目帮助读者快速掌握Python编程。',
          view_count: 1200,
          category: '编程语言'
        },
        {
          title: '算法导论',
          author: 'Thomas H. Cormen',
          isbn: '9787111407010',
          publisher: '机械工业出版社',
          publish_date: '2013-01-01',
          pages: 1312,
          cover_url: 'https://example.com/covers/introduction-to-algorithms.jpg',
          rating: 4.9,
          description: '本书是算法领域的经典著作，全面介绍了各种算法的设计和分析方法。',
          view_count: 1500,
          category: '计算机科学'
        }
      ]);
      console.log('✅ 测试图书数据创建成功');
    } else {
      console.log('⚠️ 图书数据已存在，跳过创建');
    }
    
    console.log('=== 默认数据初始化完成 ===\n');
  } catch (error) {
    console.error('默认数据初始化失败:', error);
    throw error;
  }
};

// 连接数据库并执行初始化
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database connected and models synced successfully');
    await initDefaultData();
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection or model sync failed:', err);
    process.exit(1);
  });