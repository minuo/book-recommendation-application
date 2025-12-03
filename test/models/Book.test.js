// 在测试环境中使用内存数据库
process.env.DB_NAME = ':memory:';

const sequelize = require('../../src/config/database').sequelize;
const Book = require('../../src/models/Book');

describe('Book Model', () => {
  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  test('should create a new book', async () => {
    const book = await Book.create({
      title: '测试书籍',
      author: '测试作者',
      publisher: '测试出版社',
      isbn: '9787123456789',
      pages: 300,
      cover_url: 'https://example.com/cover1.jpg',
      description: '这是一本测试书籍',
      category: '计算机'
    });

    expect(book.id).toBeDefined();
    expect(book.title).toBe('测试书籍');
    expect(book.author).toBe('测试作者');
    expect(book.category).toBe('计算机');
  });

  test('should update a book', async () => {
    const book = await Book.create({
      title: '测试书籍2',
      author: '测试作者2',
      publisher: '测试出版社2',
      isbn: '9787123456790',
      pages: 450,
      cover_url: 'https://example.com/cover2.jpg',
      description: '这是第二本测试书籍',
      category: '科技'
    });

    await book.update({
      title: '更新后的测试书籍2',
      author: '更新后的测试作者2'
    });

    expect(book.title).toBe('更新后的测试书籍2');
    expect(book.author).toBe('更新后的测试作者2');
  });

  test('should filter books by category', async () => {
    // 创建不同分类的书籍
    await Book.create({
      title: '文学书籍',
      author: '作者B',
      publisher: '出版社B',
      isbn: '9787123456792',
      pages: 400,
      cover_url: 'https://example.com/cover4.jpg',
      description: '文学类书籍',
      category: '文学'
    });

    // 查询特定标题的文学书籍
    const literatureBooks = await Book.findAll({ 
      where: { 
        category: '文学',
        title: '文学书籍'
      } 
    });

    expect(literatureBooks).toHaveLength(1);
    expect(literatureBooks[0].title).toBe('文学书籍');
  });
});
