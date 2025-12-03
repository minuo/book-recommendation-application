const express = require('express');
const Book = require('../models/Book');
const authenticate = require('../middleware/authenticate');
const { Op } = require('sequelize');

const router = express.Router();

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