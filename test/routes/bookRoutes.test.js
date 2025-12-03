// 在测试环境中使用内存数据库
process.env.DB_NAME = ':memory:';

const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/config/database');
const Book = require('../../src/models/Book');

// 测试数据
const testBooks = [
  {
    title: 'JavaScript高级程序设计',
    author: 'Nicholas C. Zakas',
    isbn: '9787115275790',
    publisher: '人民邮电出版社',
    cover_url: 'https://example.com/js-advanced.jpg',
    category: '计算机科学',
    rating: 4.8,
    view_count: 1000,
    description: 'JavaScript高级编程指南',
    publish_date: new Date('2012-03-01')
  },
  {
    title: 'Python编程从入门到实践',
    author: 'Eric Matthes',
    isbn: '9787115428028',
    publisher: '人民邮电出版社',
    cover_url: 'https://example.com/python-basics.jpg',
    category: '计算机科学',
    rating: 4.5,
    view_count: 800,
    description: 'Python入门经典教材',
    publish_date: new Date('2016-07-01')
  },
  {
    title: '红楼梦',
    author: '曹雪芹',
    isbn: '9787020002207',
    publisher: '人民文学出版社',
    cover_url: 'https://example.com/hongloumeng.jpg',
    category: '文学',
    rating: 4.9,
    view_count: 1500,
    description: '中国古典四大名著之一',
    publish_date: new Date('1791-12-01')
  },
  {
    title: '三体',
    author: '刘慈欣',
    isbn: '9787536692930',
    publisher: '重庆出版社',
    cover_url: 'https://example.com/santi.jpg',
    category: '科幻',
    rating: 4.7,
    view_count: 1200,
    description: '科幻小说三体三部曲第一部',
    publish_date: new Date('2008-01-01')
  },
  {
    title: '2023年机器学习实战',
    author: 'Peter Harrington',
    isbn: '9787111423161',
    publisher: '机械工业出版社',
    cover_url: 'https://example.com/ml-in-action.jpg',
    category: '计算机科学',
    rating: 4.6,
    view_count: 900,
    description: '机器学习实用指南',
    publish_date: new Date('2023-05-01')
  }
];

// 测试套件描述
describe('Book Routes', () => {
  // 在所有测试前设置数据库
  beforeAll(async () => {
    await sequelize.sync();
  });

  // 在每个测试前插入测试数据
  beforeEach(async () => {
    // 清空表但不删除表结构
    await Book.truncate();
    // 插入测试数据
    await Book.bulkCreate(testBooks);
  });

  // 在所有测试后关闭数据库连接
  afterAll(async () => {
    await sequelize.close();
  });

  // 测试图书搜索功能
  describe('GET /api/v1/books/search', () => {
    it('should search books by keyword', async () => {
      const response = await request(app)
        .get('/api/v1/books/search')
        .query({ keyword: 'JavaScript' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].title).toBe('JavaScript高级程序设计');
    });

    it('should filter books by category', async () => {
      const response = await request(app)
        .get('/api/v1/books/search')
        .query({ category: '计算机科学' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.books).toHaveLength(3);
      response.body.data.books.forEach(book => {
        expect(book.category).toBe('计算机科学');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/books/search')
        .query({ page: 2, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.books).toHaveLength(2);
      expect(response.body.data.pagination).toEqual({
        total: 5,
        page: 2,
        limit: 2,
        total_pages: 3
      });
    });

    it('should handle multiple filters', async () => {
      const response = await request(app)
        .get('/api/v1/books/search')
        .query({ category: '计算机科学', author: 'Eric Matthes' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].title).toBe('Python编程从入门到实践');
    });
  });

  // 测试热门图书列表
  describe('GET /api/v1/books/popular/list', () => {
    it('should return popular books sorted by view count', async () => {
      const response = await request(app)
        .get('/api/v1/books/popular/list')
        .query({ limit: 3 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.books).toHaveLength(3);
      // 验证按view_count降序排列
      expect(response.body.data.books[0].view_count).toBeGreaterThanOrEqual(response.body.data.books[1].view_count);
      expect(response.body.data.books[1].view_count).toBeGreaterThanOrEqual(response.body.data.books[2].view_count);
    });
  });

  // 测试新书推荐列表
  describe('GET /api/v1/books/new/list', () => {
    it('should return new books sorted by publish date', async () => {
      const response = await request(app)
        .get('/api/v1/books/new/list')
        .query({ limit: 3 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.books).toHaveLength(3);
      // 验证按publish_date降序排列
      expect(new Date(response.body.data.books[0].publish_date).getTime()).toBeGreaterThanOrEqual(new Date(response.body.data.books[1].publish_date).getTime());
      expect(new Date(response.body.data.books[1].publish_date).getTime()).toBeGreaterThanOrEqual(new Date(response.body.data.books[2].publish_date).getTime());
    });
  });

  // 测试图书分类列表
  describe('GET /api/v1/books/categories', () => {
    it('should return all book categories', async () => {
      const response = await request(app)
        .get('/api/v1/books/categories');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.categories).toEqual(expect.arrayContaining(['计算机科学', '文学', '科幻']));
      expect(response.body.data.categories).toHaveLength(3); // 去重后的分类数
    });
  });

  // 测试分类下的图书列表
  describe('GET /api/v1/books/category/:category', () => {
    it('should return books for a specific category', async () => {
        const response = await request(app)
        .get('/api/v1/books/category/' + encodeURIComponent('科幻'));

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].category).toBe('科幻');
      expect(response.body.data.books[0].title).toBe('三体');
    });

    it('should support pagination for category books', async () => {
        const response = await request(app)
        .get('/api/v1/books/category/' + encodeURIComponent('计算机科学'))
        .query({ page: 2, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.pagination).toEqual({
        total: 3,
        page: 2,
        limit: 1,
        total_pages: 3
      });
    });
  });

  // 测试获取图书详情
  describe('GET /api/v1/books/:id', () => {
    it('should return book details by id', async () => {
      // 首先获取一个图书的id
      const allBooks = await Book.findAll();
      const bookId = allBooks[0].id;

      const response = await request(app)
        .get(`/api/v1/books/${bookId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.book.id).toBe(bookId);
      expect(response.body.data.book.title).toBe(allBooks[0].title);
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .get('/api/v1/books/99999');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('BOOK_NOT_FOUND');
    });

    it('should increment view_count when book is viewed', async () => {
      // 首先获取一个图书的id和当前view_count
      const allBooks = await Book.findAll();
      const bookId = allBooks[0].id;
      const initialViewCount = allBooks[0].view_count;

      // 访问图书详情
      await request(app)
        .get(`/api/v1/books/${bookId}`);

      // 检查view_count是否增加了1
      const updatedBook = await Book.findByPk(bookId);
      expect(updatedBook.view_count).toBe(initialViewCount + 1);
    });
  });
});
