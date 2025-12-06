const express = require('express');
const Book = require('../models/Book');
const authenticate = require('../middleware/authenticate');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Get default book list
 *     description: Returns a default list of books with pagination support
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: 
 *                   type: string
 *                   example: success
 *                 message: 
 *                   type: string
 *                   example: Default books list retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           author:
 *                             type: string
 *                           isbn:
 *                             type: string
 *                           category:
 *                             type: string
 *                           publisher:
 *                             type: string
 *                           publish_date:
 *                             type: string
 *                             format: date
 *                           cover_url:
 *                             type: string
 *                           description:
 *                             type: string
 *                           view_count:
 *                             type: integer
 *                           create_time:
 *                             type: string
 *                             format: date-time
 *                     totalBooks:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: 
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Server error
 */

// Get default book list with pagination
router.get('/', async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pagination parameters'
      });
    }

    // Get total count of books
    const totalBooks = await Book.count();
    
    // Calculate total pages
    const totalPages = Math.ceil(totalBooks / limit);

    // Fetch books with pagination
    const books = await Book.findAll({
      attributes: [
        'id', 'title', 'author', 'isbn', 'category', 'publisher', 
        'publish_date', 'cover_url', 'description', 'view_count', 
        'create_time'
      ],
      limit,
      offset,
      order: [['create_time', 'DESC']] // Order by creation time descending
    });

    // Return the response
    res.status(200).json({
      status: 'success',
      message: 'Default books list retrieved successfully',
      data: {
        books,
        totalBooks,
        totalPages,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error fetching default books list:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});


/**
 * @swagger
 * /api/v1/books/search:
 *   get:
 *     summary: Search for books
 *     description: Search books by keyword, category, author, publisher, or ISBN with pagination support
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search in title or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Book category
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Book author
 *       - in: query
 *         name: publisher
 *         schema:
 *           type: string
 *         description: Book publisher
 *       - in: query
 *         name: isbn
 *         schema:
 *           type: string
 *         description: Book ISBN
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Books found successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           author:
 *                             type: string
 *                           isbn:
 *                             type: string
 *                           category:
 *                             type: string
 *                           publisher:
 *                             type: string
 *                           publish_date:
 *                             type: string
 *                             format: date
 *                           cover_image:
 *                             type: string
 *                           description:
 *                             type: string
 *                           view_count:
 *                             type: integer
 *                           download_count:
 *                             type: integer
 *                           create_time:
 *                             type: string
 *                             format: date-time
 *                     totalBooks:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
// 图书搜索
router.get('/search', async (req, res) => {
  try {
    const { keyword, category, author, publisher, isbn, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (category) where.category = category;
    if (author) where.author = { [Op.like]: `%${author}%` };
    if (publisher) where.publisher = { [Op.like]: `%${publisher}%` };
    if (isbn) where.isbn = isbn;
    
    // 分页计算
    const offset = (page - 1) * limit;
    
    // 执行查询
    const { count, rows: books } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['create_time', 'DESC']]
    });
    
    // 计算总页数
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      message: 'Books found successfully',
      data: {
        books: books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publisher: book.publisher,
          cover_url: book.cover_url,
          category: book.category,
          rating: book.rating,
          description: book.description,
          publish_date: book.publish_date,
          view_count: book.view_count,
          create_time: book.create_time
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: totalPages
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 获取热门图书列表
router.get('/popular/list', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // 查询热门图书（按访问量排序）
    const books = await Book.findAll({
      limit: parseInt(limit),
      order: [['view_count', 'DESC']]
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Popular books retrieved successfully',
      data: {
        books: books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          category: book.category,
          rating: book.rating,
          view_count: book.view_count
        }))
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/books/latest:
 *   get:
 *     summary: Get latest added books
 *     description: Returns the latest books added to the system, sorted by creation time
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of books to return
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Latest books retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           author:
 *                             type: string
 *                           isbn:
 *                             type: string
 *                           category:
 *                             type: string
 *                           publisher:
 *                             type: string
 *                           publish_date:
 *                             type: string
 *                             format: date
 *                           cover_url:
 *                             type: string
 *                           description:
 *                             type: string
 *                           view_count:
 *                             type: integer
 *                           create_time:
 *                             type: string
 *                             format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Server error
 */

/**
 * @swagger
 * /api/v1/books/latest: 
 *   get:
 *     summary: 获取最新添加的图书
 *     description: 根据创建时间降序排序，返回系统中最新添加的图书列表
 *     tags: [Books]
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: 返回图书数量限制，默认10条，最大不超过100条
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: 成功获取最新图书列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Latest books retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: JavaScript高级程序设计
 *                           author:
 *                             type: string
 *                             example: Nicholas C. Zakas
 *                           isbn:
 *                             type: string
 *                             example: 9787115421889
 *                           category:
 *                             type: string
 *                             example: 计算机
 *                           publisher:
 *                             type: string
 *                             example: 人民邮电出版社
 *                           publish_date:
 *                             type: string
 *                             format: date-time
 *                             example: 2016-09-01T00:00:00.000Z
 *                           cover_url:
 *                             type: string
 *                             example: https://example.com/cover.jpg
 *                           description:
 *                             type: string
 *                             example: 图书描述信息
 *                           view_count:
 *                             type: integer
 *                             example: 123
 *                           create_time:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-05-20T14:30:00.000Z
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.get('/latest', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 查询最新添加的图书（按创建时间降序）
    const books = await Book.findAll({
      attributes: [
        'id', 'title', 'author', 'isbn', 'category', 'publisher', 
        'publish_date', 'cover_url', 'description', 'view_count', 
        'create_time'
      ],
      limit: parseInt(limit, 10),
      order: [['create_time', 'DESC']] // 按创建时间降序排列
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Latest books retrieved successfully',
      data: {
        books
      }
    });
  } catch (error) {
    console.error('Error fetching latest books:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// 获取新书推荐列表
router.get('/new/list', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // 查询新书（按发布日期排序）
    const books = await Book.findAll({
      limit: parseInt(limit),
      order: [['publish_date', 'DESC']]
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'New books retrieved successfully',
      data: {
        books: books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          category: book.category,
          rating: book.rating,
          publish_date: book.publish_date,
          view_count: book.view_count
        }))
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 获取图书分类列表
router.get('/categories', async (req, res) => {
  try {
    // 查询所有分类
    const categories = await Book.findAll({
      attributes: [
        [Book.sequelize.fn('DISTINCT', Book.sequelize.col('category')), 'category']
      ],
      where: { category: { [Op.not]: null } },
      order: [['category', 'ASC']]
    });
    
    // 转换结果格式
    const categoryList = categories.map(item => item.category);
    
    return res.status(200).json({
      status: 'success',
      message: 'Book categories retrieved successfully',
      data: {
        categories: categoryList
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 获取分类下的图书列表
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // 分页计算
    const offset = (page - 1) * limit;
    
    // 查询分类下的图书
    const { count, rows: books } = await Book.findAndCountAll({
      where: { category },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['view_count', 'DESC']]
    });
    
    // 计算总页数
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      message: `Books in category '${category}' retrieved successfully`,
      data: {
        books: books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          category: book.category,
          rating: book.rating
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: totalPages
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 获取图书详情 (动态路由放在最后)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找图书
    const book = await Book.findByPk(id);
    
    // 检查图书是否存在
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found',
        code: 'BOOK_NOT_FOUND'
      });
    }
    
    // 更新访问量
    book.view_count += 1;
    await book.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'Book details retrieved successfully',
      data: {
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publisher: book.publisher,
          cover_url: book.cover_url,
          category: book.category,
          rating: book.rating,
          view_count: book.view_count,
          description: book.description,
          publish_date: book.publish_date,
          create_time: book.create_time,
          update_time: book.update_time
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;