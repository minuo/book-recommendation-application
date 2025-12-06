require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../src/database/book_recommendation.db'),
  logging: false
});

// 动态导入Book模型
const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isbn: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING(255)
  },
  publish_date: {
    type: DataTypes.DATE
  },
  pages: {
    type: DataTypes.INTEGER
  },
  cover_url: {
    type: DataTypes.STRING(255)
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1)
  },
  description: {
    type: DataTypes.TEXT
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING(100)
  },
  create_time: {
    type: DataTypes.DATE
  },
  update_time: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'books',
  timestamps: false
});

async function verifyBooks() {
  try {
    console.log('📊 正在验证图书数据...');
    
    // 1. 获取总记录数
    const totalCount = await Book.count();
    console.log(`\n📚 图书表总记录数：${totalCount}`);
    
    if (totalCount < 20) {
      console.error(`❌ 错误：图书记录数${totalCount}条，未达到要求的20条`);
      process.exit(1);
    }
    
    // 2. 随机抽取5条记录查看详情
    console.log('\n🔍 随机抽取5条图书记录样本：');
    const sampleBooks = await Book.findAll({
      limit: 5,
      order: sequelize.random()
    });
    
    sampleBooks.forEach((book, index) => {
      console.log(`\n--- 图书 ${index + 1} ---`);
      console.log(`ID: ${book.id}`);
      console.log(`标题: ${book.title}`);
      console.log(`作者: ${book.author}`);
      console.log(`ISBN: ${book.isbn}`);
      console.log(`分类: ${book.category}`);
      console.log(`出版社: ${book.publisher}`);
      console.log(`出版日期: ${book.publish_date ? book.publish_date.toISOString().split('T')[0] : '未设置'}`);
      console.log(`封面URL: ${book.cover_url}`);
      console.log(`评分: ${book.rating}`);
      console.log(`描述: ${book.description ? book.description.substring(0, 50) + '...' : '无描述'}`);
    });
    
    // 3. 检查ISBN唯一性（通过查询重复记录数）
    const duplicateCount = await sequelize.query(`
      SELECT COUNT(*) as count FROM (
        SELECT isbn, COUNT(*) as isbn_count 
        FROM books 
        GROUP BY isbn 
        HAVING COUNT(*) > 1
      ) as duplicates
    `);
    
    const hasDuplicates = duplicateCount[0][0].count > 0;
    
    // 4. 检查必要字段是否都有值
    const invalidBooksCount = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE title IS NULL OR title = '' 
         OR author IS NULL OR author = '' 
         OR isbn IS NULL OR isbn = ''
    `);
    
    const hasInvalidBooks = invalidBooksCount[0][0].count > 0;
    
    // 5. 输出验证结果
    console.log('\n✅ 数据验证完成！');
    console.log(`   - 总记录数: ${totalCount}条（符合要求）`);
    console.log(`   - ISBN唯一性: ${hasDuplicates ? '❌ 存在重复' : '✅ 全部唯一'}`);
    console.log(`   - 必要字段完整性: ${hasInvalidBooks ? '❌ 存在无效记录' : '✅ 全部有效'}`);
    
    if (hasDuplicates || hasInvalidBooks) {
      console.error('❌ 验证失败：存在重复或无效数据');
      process.exit(1);
    } else {
      console.log('\n🎉 验证成功！数据库中包含21条完整、唯一的图书记录。');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误：', error.message);
    process.exit(1);
  }
}

// 执行验证
verifyBooks();