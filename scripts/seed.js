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
    // 总是清除现有图书数据并重新生成，确保数据量充足
    await Book.destroy({ where: {} });
    
    // 生成至少20条完整的图书记录
    const booksData = [
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
      },
      {
        title: '设计模式：可复用面向对象软件的基础',
        author: 'Erich Gamma',
        isbn: '9787115222312',
        publisher: '人民邮电出版社',
        publish_date: '2010-10-01',
        pages: 395,
        cover_url: 'https://example.com/covers/design-patterns.jpg',
        rating: 4.8,
        description: '本书是设计模式领域的经典著作，介绍了23种设计模式及其应用场景。',
        view_count: 1300,
        category: '软件工程'
      },
      {
        title: '代码整洁之道',
        author: 'Robert C. Martin',
        isbn: '9787115216878',
        publisher: '人民邮电出版社',
        publish_date: '2010-01-01',
        pages: 388,
        cover_url: 'https://example.com/covers/clean-code.jpg',
        rating: 4.7,
        description: '本书介绍了编写高质量代码的原则和实践，帮助开发者提高代码质量。',
        view_count: 950,
        category: '软件工程'
      },
      {
        title: '深入理解计算机系统',
        author: 'Randal E. Bryant',
        isbn: '9787111544245',
        publisher: '机械工业出版社',
        publish_date: '2017-02-01',
        pages: 768,
        cover_url: 'https://example.com/covers/csapp.jpg',
        rating: 4.9,
        description: '本书深入讲解了计算机系统的各个层次，从硬件到软件，帮助读者理解程序的运行机制。',
        view_count: 1400,
        category: '计算机科学'
      },
      {
        title: 'MySQL技术内幕：InnoDB存储引擎',
        author: '姜承尧',
        isbn: '9787115341243',
        publisher: '人民邮电出版社',
        publish_date: '2014-01-01',
        pages: 452,
        cover_url: 'https://example.com/covers/mysql-innodb.jpg',
        rating: 4.6,
        description: '本书详细介绍了MySQL中InnoDB存储引擎的内部实现原理和使用技巧。',
        view_count: 850,
        category: '数据库'
      },
      {
        title: 'Redis实战',
        author: 'Josiah L. Carlson',
        isbn: '9787115353059',
        publisher: '人民邮电出版社',
        publish_date: '2014-07-01',
        pages: 278,
        cover_url: 'https://example.com/covers/redis-in-action.jpg',
        rating: 4.5,
        description: '本书通过实际案例介绍了Redis的各种应用场景和使用方法。',
        view_count: 750,
        category: '数据库'
      },
      {
        title: 'Spring Boot实战',
        author: 'Josh Long',
        isbn: '9787115483544',
        publisher: '人民邮电出版社',
        publish_date: '2018-08-01',
        pages: 508,
        cover_url: 'https://example.com/covers/spring-boot-in-action.jpg',
        rating: 4.7,
        description: '本书详细介绍了Spring Boot框架的核心特性和实际应用开发。',
        view_count: 1100,
        category: '后端开发'
      },
      {
        title: '深入理解Java虚拟机',
        author: '周志明',
        isbn: '9787111546081',
        publisher: '机械工业出版社',
        publish_date: '2019-01-01',
        pages: 474,
        cover_url: 'https://example.com/covers/understanding-jvm.jpg',
        rating: 4.8,
        description: '本书深入讲解了Java虚拟机的工作原理和调优方法。',
        view_count: 1250,
        category: '编程语言'
      },
      {
        title: '图解HTTP',
        author: '上野宣',
        isbn: '9787115351531',
        publisher: '人民邮电出版社',
        publish_date: '2014-09-01',
        pages: 256,
        cover_url: 'https://example.com/covers/http-illustrated.jpg',
        rating: 4.6,
        description: '本书通过图解方式生动地介绍了HTTP协议的基本原理和应用。',
        view_count: 900,
        category: '网络'
      },
      {
        title: 'Elasticsearch: 权威指南',
        author: 'Clinton Gormley',
        isbn: '9787115390728',
        publisher: '人民邮电出版社',
        publish_date: '2015-08-01',
        pages: 452,
        cover_url: 'https://example.com/covers/elasticsearch-definitive-guide.jpg',
        rating: 4.7,
        description: '本书全面介绍了Elasticsearch搜索引擎的使用方法和优化技巧。',
        view_count: 850,
        category: '搜索引擎'
      },
      {
        title: 'Docker实战',
        author: 'Jeff Nickoloff',
        isbn: '9787115423980',
        publisher: '人民邮电出版社',
        publish_date: '2016-06-01',
        pages: 376,
        cover_url: 'https://example.com/covers/docker-in-action.jpg',
        rating: 4.6,
        description: '本书通过实际案例介绍了Docker容器技术的使用方法和最佳实践。',
        view_count: 950,
        category: '云计算'
      },
      {
        title: '机器学习实战',
        author: 'Peter Harrington',
        isbn: '9787111423161',
        publisher: '机械工业出版社',
        publish_date: '2013-06-01',
        pages: 334,
        cover_url: 'https://example.com/covers/machine-learning-in-action.jpg',
        rating: 4.5,
        description: '本书通过Python代码实例介绍了机器学习算法的实现和应用。',
        view_count: 1150,
        category: '人工智能'
      },
      {
        title: '深度学习',
        author: 'Ian Goodfellow',
        isbn: '9787111576661',
        publisher: '机械工业出版社',
        publish_date: '2018-05-01',
        pages: 600,
        cover_url: 'https://example.com/covers/deep-learning.jpg',
        rating: 4.8,
        description: '本书全面介绍了深度学习的理论基础和实践应用，是深度学习领域的权威著作。',
        view_count: 1350,
        category: '人工智能'
      },
      {
        title: '微服务架构设计模式',
        author: 'Chris Richardson',
        isbn: '9787115485197',
        publisher: '人民邮电出版社',
        publish_date: '2018-01-01',
        pages: 518,
        cover_url: 'https://example.com/covers/microservice-patterns.jpg',
        rating: 4.7,
        description: '本书详细介绍了微服务架构的设计模式和最佳实践。',
        view_count: 1000,
        category: '软件工程'
      },
      {
        title: 'Kubernetes实战',
        author: 'Joe Beda',
        isbn: '9787115487405',
        publisher: '人民邮电出版社',
        publish_date: '2018-05-01',
        pages: 420,
        cover_url: 'https://example.com/covers/kubernetes-in-action.jpg',
        rating: 4.6,
        description: '本书通过实际案例介绍了Kubernetes容器编排平台的使用方法和最佳实践。',
        view_count: 950,
        category: '云计算'
      },
      {
        title: '软件测试技术实战',
        author: 'Markus Gärtner',
        isbn: '9787115423874',
        publisher: '人民邮电出版社',
        publish_date: '2016-05-01',
        pages: 358,
        cover_url: 'https://example.com/covers/software-testing.jpg',
        rating: 4.5,
        description: '本书详细介绍了软件测试的各种技术和方法，帮助开发者提高软件质量。',
        view_count: 850,
        category: '软件工程'
      },
      {
        title: '区块链技术指南',
        author: 'Antonopoulos Andreas M.',
        isbn: '9787115443549',
        publisher: '人民邮电出版社',
        publish_date: '2017-07-01',
        pages: 432,
        cover_url: 'https://example.com/covers/blockchain-guide.jpg',
        rating: 4.6,
        description: '本书全面介绍了区块链技术的基本原理和应用场景。',
        view_count: 900,
        category: '区块链'
      }
    ];
    
    // 使用bulkCreate批量创建图书记录
    await Book.bulkCreate(booksData);
    console.log(`✅ ${booksData.length}条图书数据创建成功`);
    
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