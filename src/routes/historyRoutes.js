const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const ReadingHistory = require('../models/ReadingHistory');
const Favorite = require('../models/Favorite');
const Order = require('../models/Order');
const Preference = require('../models/Preference');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * /api/v1/user/reading-history:
 *   get:
 *     summary: Get user's reading history
 *     description: Retrieve the reading history for the authenticated user
 *     tags:
 *       - Reading History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Reading history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'success'
 *                 message:
 *                   type: string
 *                   example: 'Reading history retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     reading_history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           book:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               title:
 *                                 type: string
 *                                 example: 'Book Title'
 *                               author:
 *                                 type: string
 *                                 example: 'Author Name'
 *                               cover_url:
 *                                 type: string
 *                                 example: 'https://example.com/cover.jpg'
 *                               category:
 *                                 type: string
 *                                 example: 'Fiction'
 *                               rating:
 *                                 type: number
 *                                 example: 4.5
 *                           page:
 *                             type: integer
 *                             example: 120
 *                           view_time:
 *                             type: string
 *                             format: date-time
 *                             example: '2023-01-01T00:00:00.000Z'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total_pages:
 *                           type: integer
 *                           example: 5
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'error'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *                 code:
 *                   type: string
 *                   example: 'UNAUTHORIZED'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'error'
 *                 message:
 *                   type: string
 *                   example: 'Internal server error'
 *                 code:
 *                   type: string
 *                   example: 'INTERNAL_SERVER_ERROR'
 */
// 获取用户的阅读历史记录
router.get('/reading-history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    // 分页计算
    const offset = (page - 1) * limit;
    
    // 获取用户的阅读历史
    const { count, rows: history } = await ReadingHistory.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Book,
          attributes: ['id', 'title', 'author', 'cover_url', 'category', 'rating']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['view_time', 'DESC']]
    });
    
    // 计算总页数
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      message: 'Reading history retrieved successfully',
      data: {
        reading_history: history.map(item => ({
          id: item.id,
          book: item.book,
          page: item.page,
          view_time: item.view_time
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

/**
 * @swagger
 * /api/v1/user/reading-history:
 *   post:
 *     summary: Add reading history record
 *     description: Add a new reading history record for the authenticated user
 *     tags:
 *       - Reading History
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: integer
 *                 description: Book ID
 *                 example: 1
 *               page:
 *                 type: integer
 *                 description: Current reading page
 *                 example: 120
 *             required:
 *               - book_id
 *               - page
 *     responses:
 *       201:
 *         description: Reading history record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'success'
 *                 message:
 *                   type: string
 *                   example: 'Reading history record created successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     reading_history:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         user_id:
 *                           type: integer
 *                           example: 1
 *                         book_id:
 *                           type: integer
 *                           example: 1
 *                         page:
 *                           type: integer
 *                           example: 120
 *                         view_time:
 *                           type: string
 *                           format: date-time
 *                           example: '2023-01-01T00:00:00.000Z'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'error'
 *                 message:
 *                   type: string
 *                   example: 'Invalid input data'
 *                 code:
 *                   type: string
 *                   example: 'INVALID_INPUT'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'error'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *                 code:
 *                   type: string
 *                   example: 'UNAUTHORIZED'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'error'
 *                 message:
 *                   type: string
 *                   example: 'Internal server error'
 *                 code:
 *                   type: string
 *                   example: 'INTERNAL_SERVER_ERROR'
 */
// 添加阅读历史记录
router.post('/reading-history', authenticate, async (req, res) => {
  try {
    const { bookId, page = 1 } = req.body;
    const userId = req.user.id;
    
    // 验证输入
    if (!bookId) {
      return res.status(400).json({
        status: 'error',
        message: 'Book ID is required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // 查找图书
    const book = await Book.findByPk(bookId);
    
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found',
        code: 'BOOK_NOT_FOUND'
      });
    }
    
    // 检查是否已存在阅读记录
    let readingHistory = await ReadingHistory.findOne({
      where: { userId, bookId }
    });
    
    if (readingHistory) {
      // 更新现有记录
      readingHistory.page = page;
      readingHistory.view_time = new Date();
      await readingHistory.save();
    } else {
      // 创建新记录
      readingHistory = await ReadingHistory.create({
        userId,
        bookId,
        page
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Reading history updated successfully',
      data: {
        reading_history: {
          id: readingHistory.id,
          bookId: readingHistory.bookId,
          page: readingHistory.page,
          view_time: readingHistory.view_time
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

// 获取用户的收藏图书列表
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    // 分页计算
    const offset = (page - 1) * limit;
    
    // 获取用户的收藏图书
    const { count, rows: favorites } = await Favorite.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Book,
          attributes: ['id', 'title', 'author', 'cover_url', 'category', 'rating', 'description']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    // 计算总页数
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      message: 'Favorites retrieved successfully',
      data: {
        favorites: favorites.map(item => ({
          id: item.id,
          book: item.book,
          created_at: item.created_at
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

// 添加收藏
router.post('/favorites', authenticate, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;
    
    // 验证输入
    if (!bookId) {
      return res.status(400).json({
        status: 'error',
        message: 'Book ID is required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // 查找图书
    const book = await Book.findByPk(bookId);
    
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found',
        code: 'BOOK_NOT_FOUND'
      });
    }
    
    // 检查是否已收藏
    const existingFavorite = await Favorite.findOne({
      where: { userId, bookId }
    });
    
    if (existingFavorite) {
      return res.status(400).json({
        status: 'error',
        message: 'Book already in favorites',
        code: 'BOOK_ALREADY_IN_FAVORITES'
      });
    }
    
    // 创建收藏记录
    const favorite = await Favorite.create({
      userId,
      bookId
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Book added to favorites successfully',
      data: {
        favorite: {
          id: favorite.id,
          bookId: favorite.bookId,
          userId: favorite.userId,
          created_at: favorite.created_at
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

// 删除收藏
router.delete('/favorites/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 查找收藏记录
    const favorite = await Favorite.findOne({
      where: { id, userId }
    });
    
    if (!favorite) {
      return res.status(404).json({
        status: 'error',
        message: 'Favorite not found',
        code: 'FAVORITE_NOT_FOUND'
      });
    }
    
    // 删除收藏记录
    await favorite.destroy();
    
    return res.status(200).json({
      status: 'success',
      message: 'Book removed from favorites successfully'
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

// 检查图书是否已收藏
router.get('/favorites/check/:bookId', authenticate, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    
    // 检查是否已收藏
    const favorite = await Favorite.findOne({
      where: { userId, bookId }
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Favorite status checked successfully',
      data: {
        is_favorite: favorite !== null
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

// 获取用户的购买记录
router.get('/purchases', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    // 分页计算
    const offset = (page - 1) * limit;
    
    // 获取用户的购买记录
    const { count, rows: orders } = await Order.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Book,
          attributes: ['id', 'title', 'author', 'cover_url', 'category']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    // 计算总页数
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      message: 'Purchase history retrieved successfully',
      data: {
        purchases: orders.map(order => ({
          id: order.id,
          book: order.book,
          price: order.price,
          platform: order.platform,
          order_no: order.order_no,
          status: order.status,
          created_at: order.created_at
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

// 获取用户偏好设置
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 获取用户偏好
    let preference = await Preference.findOne({ where: { userId } });
    
    // 如果不存在，创建默认偏好
    if (!preference) {
      preference = await Preference.create({
        userId,
        favorite_categories: [],
        favorite_authors: [],
        preferred_language: '中文',
        reading_time: 'evening',
        reading_goal: 30
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'User preferences retrieved successfully',
      data: {
        preferences: {
          id: preference.id,
          favorite_categories: preference.favorite_categories,
          favorite_authors: preference.favorite_authors,
          preferred_language: preference.preferred_language,
          reading_time: preference.reading_time,
          reading_goal: preference.reading_goal,
          create_time: preference.create_time,
          update_time: preference.update_time
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

// 更新用户偏好设置
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { favorite_categories, favorite_authors, preferred_language, reading_time, reading_goal } = req.body;
    const userId = req.user.id;
    
    // 获取用户偏好
    let preference = await Preference.findOne({ where: { userId } });
    
    // 如果不存在，创建新偏好
    if (!preference) {
      preference = await Preference.create({
        userId
      });
    }
    
    // 更新偏好设置
    if (favorite_categories !== undefined) preference.favorite_categories = favorite_categories;
    if (favorite_authors !== undefined) preference.favorite_authors = favorite_authors;
    if (preferred_language !== undefined) preference.preferred_language = preferred_language;
    if (reading_time !== undefined) preference.reading_time = reading_time;
    if (reading_goal !== undefined) preference.reading_goal = reading_goal;
    
    await preference.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'User preferences updated successfully',
      data: {
        preferences: {
          id: preference.id,
          favorite_categories: preference.favorite_categories,
          favorite_authors: preference.favorite_authors,
          preferred_language: preference.preferred_language,
          reading_time: preference.reading_time,
          reading_goal: preference.reading_goal,
          create_time: preference.create_time,
          update_time: preference.update_time
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