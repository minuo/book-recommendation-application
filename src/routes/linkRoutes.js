const express = require('express');
const Book = require('../models/Book');
const DownloadLink = require('../models/DownloadLink');
const PurchaseChannel = require('../models/PurchaseChannel');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * /api/v1/links/download/{bookId}:
 *   get:
 *     summary: Get book download links
 *     description: Retrieve all download links for a specific book
 *     tags:
 *       - Links
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Book download links retrieved successfully
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
 *                   example: 'Download links retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     download_links:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           url:
 *                             type: string
 *                             example: 'https://example.com/books/book1.epub'
 *                           platform:
 *                             type: string
 *                             example: 'EPUB Library'
 *                           file_size:
 *                             type: string
 *                             example: '2.5MB'
 *                           file_format:
 *                             type: string
 *                             example: 'EPUB'
 *                           is_valid:
 *                             type: boolean
 *                             example: true
 *                           download_count:
 *                             type: integer
 *                             example: 42
 *                           last_check_time:
 *                             type: string
 *                             format: date-time
 *                             example: '2023-01-01T00:00:00.000Z'
 *                           create_time:
 *                             type: string
 *                             format: date-time
 *                             example: '2023-01-01T00:00:00.000Z'
 *                 copyright_notice:
 *                   type: string
 *                   example: '请遵守版权法律法规，仅下载和使用符合版权规定的图书资源'
 *       404:
 *         description: Book not found
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
 *                   example: 'Book not found'
 *                 code:
 *                   type: string
 *                   example: 'BOOK_NOT_FOUND'
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
// 获取图书的下载链接列表
router.get('/download/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // 查找图书
    const book = await Book.findByPk(bookId);
    
    // 检查图书是否存在
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found',
        code: 'BOOK_NOT_FOUND'
      });
    }
    
    // 获取图书的下载链接
    const downloadLinks = await DownloadLink.findAll({
      where: { bookId },
      order: [['platform', 'ASC']]
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Download links retrieved successfully',
      data: {
        download_links: downloadLinks.map(link => ({
          id: link.id,
          url: link.url,
          platform: link.platform,
          file_size: link.file_size,
          file_format: link.file_format,
          is_valid: link.is_valid,
          download_count: link.download_count,
          last_check_time: link.last_check_time,
          create_time: link.create_time
        }))
      },
      copyright_notice: '请遵守版权法律法规，仅下载和使用符合版权规定的图书资源'
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
 * /api/v1/links/download/{linkId}/validate:
 *   get:
 *     summary: Validate download link
 *     description: Check if a download link is still valid
 *     tags:
 *       - Links
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Download link ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Download link validation completed
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
 *                   example: 'Download link validation completed'
 *                 data:
 *                   type: object
 *                   properties:
 *                     link:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         url:
 *                           type: string
 *                           example: 'https://example.com/books/book1.epub'
 *                         platform:
 *                           type: string
 *                           example: 'EPUB Library'
 *                         is_valid:
 *                           type: boolean
 *                           example: true
 *                         last_check_time:
 *                           type: string
 *                           format: date-time
 *                           example: '2023-01-01T00:00:00.000Z'
 *       404:
 *         description: Download link not found
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
 *                   example: 'Download link not found'
 *                 code:
 *                   type: string
 *                   example: 'DOWNLOAD_LINK_NOT_FOUND'
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
// 验证下载链接的有效性
router.get('/download/:linkId/validate', authenticate, async (req, res) => {
  try {
    const { linkId } = req.params;
    
    // 查找下载链接
    const link = await DownloadLink.findByPk(linkId);
    
    // 检查链接是否存在
    if (!link) {
      return res.status(404).json({
        status: 'error',
        message: 'Download link not found',
        code: 'DOWNLOAD_LINK_NOT_FOUND'
      });
    }
    
    // 这里应该实现链接有效性检测逻辑
    // 为了演示，我们假设链接是有效的
    const is_valid = Math.random() > 0.1; // 90%的概率链接有效
    
    // 更新链接状态
    link.is_valid = is_valid;
    link.last_check_time = new Date();
    await link.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'Download link validation completed',
      data: {
        link: {
          id: link.id,
          url: link.url,
          platform: link.platform,
          is_valid: link.is_valid,
          last_check_time: link.last_check_time
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
 * /api/v1/links/download/{linkId}/count:
 *   put:
 *     summary: Increment download count
 *     description: Increase the download count for a specific link
 *     tags:
 *       - Links
 *     parameters:
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Download link ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Download count updated successfully
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
 *                   example: 'Download count updated successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     link:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         download_count:
 *                           type: integer
 *                           example: 43
 *       404:
 *         description: Download link not found
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
 *                   example: 'Download link not found'
 *                 code:
 *                   type: string
 *                   example: 'DOWNLOAD_LINK_NOT_FOUND'
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
// 增加下载计数
router.put('/download/:linkId/count', async (req, res) => {
  try {
    const { linkId } = req.params;
    
    // 查找下载链接
    const link = await DownloadLink.findByPk(linkId);
    
    // 检查链接是否存在
    if (!link) {
      return res.status(404).json({
        status: 'error',
        message: 'Download link not found',
        code: 'DOWNLOAD_LINK_NOT_FOUND'
      });
    }
    
    // 增加下载计数
    link.download_count += 1;
    await link.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'Download count updated successfully',
      data: {
        link: {
          id: link.id,
          download_count: link.download_count
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
 * /api/v1/links/purchase/{bookId}:
 *   get:
 *     summary: Get book purchase channels
 *     description: Retrieve all purchase channels for a specific book
 *     tags:
 *       - Links
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Purchase channels retrieved successfully
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
 *                   example: 'Purchase channels retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase_channels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           platform:
 *                             type: string
 *                             example: 'Amazon'
 *                           url:
 *                             type: string
 *                             example: 'https://amazon.com/book1'
 *                           price:
 *                             type: string
 *                             example: '29.99'
 *                           is_promotion:
 *                             type: boolean
 *                             example: true
 *                           promotion_price:
 *                             type: string
 *                             example: '19.99'
 *                           shipping_info:
 *                             type: string
 *                             example: 'Free shipping'
 *                           stock_status:
 *                             type: string
 *                             example: 'in_stock'
 *                           last_update_time:
 *                             type: string
 *                             format: date-time
 *                             example: '2023-01-01T00:00:00.000Z'
 *                     price_summary:
 *                       type: object
 *                       properties:
 *                         min_price:
 *                           type: number
 *                           example: 19.99
 *                         avg_price:
 *                           type: string
 *                           example: '24.99'
 *       404:
 *         description: Book not found
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
 *                   example: 'Book not found'
 *                 code:
 *                   type: string
 *                   example: 'BOOK_NOT_FOUND'
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
// 获取图书的购买渠道列表
router.get('/purchase/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // 查找图书
    const book = await Book.findByPk(bookId);
    
    // 检查图书是否存在
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found',
        code: 'BOOK_NOT_FOUND'
      });
    }
    
    // 获取图书的购买渠道
    const purchaseChannels = await PurchaseChannel.findAll({
      where: { bookId },
      order: [['price', 'ASC']]
    });
    
    // 计算最低价格和平均价格
    const prices = purchaseChannels.map(channel => 
      channel.is_promotion ? parseFloat(channel.promotion_price) : parseFloat(channel.price)
    );
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    return res.status(200).json({
      status: 'success',
      message: 'Purchase channels retrieved successfully',
      data: {
        purchase_channels: purchaseChannels.map(channel => ({
          id: channel.id,
          platform: channel.platform,
          url: channel.url,
          price: channel.price,
          is_promotion: channel.is_promotion,
          promotion_price: channel.promotion_price,
          shipping_info: channel.shipping_info,
          stock_status: channel.stock_status,
          last_update_time: channel.last_update_time
        })),
        price_summary: {
          min_price: minPrice,
          avg_price: avgPrice.toFixed(2)
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
 * /api/v1/links/purchase/{bookId}/sort:
 *   get:
 *     summary: Get purchase channels sorted by price
 *     description: Retrieve purchase channels for a book sorted by price
 *     tags:
 *       - Links
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *         example: 1
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (ascending or descending)
 *         example: desc
 *     responses:
 *       200:
 *         description: Purchase channels sorted by price retrieved successfully
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
 *                   example: 'Purchase channels sorted by price (desc) retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase_channels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           platform:
 *                             type: string
 *                             example: 'Amazon'
 *                           url:
 *                             type: string
 *                             example: 'https://amazon.com/book1'
 *                           price:
 *                             type: string
 *                             example: '29.99'
 *                           is_promotion:
 *                             type: boolean
 *                             example: true
 *                           promotion_price:
 *                             type: string
 *                             example: '19.99'
 *                           shipping_info:
 *                             type: string
 *                             example: 'Free shipping'
 *                           stock_status:
 *                             type: string
 *                             example: 'in_stock'
 *       400:
 *         description: Invalid sort order parameter
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
 *                   example: 'Invalid sort order parameter'
 *                 code:
 *                   type: string
 *                   example: 'INVALID_SORT_ORDER'
 *       404:
 *         description: Book not found
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
 *                   example: 'Book not found'
 *                 code:
 *                   type: string
 *                   example: 'BOOK_NOT_FOUND'
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
// 按价格排序获取购买渠道
router.get('/purchase/:bookId/sort', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { order = 'asc' } = req.query;
    
    // 验证排序参数
    const validOrders = ['asc', 'desc'];
    if (!validOrders.includes(order.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid sort order parameter',
        code: 'INVALID_SORT_ORDER'
      });
    }
    
    // 查找图书
    const book = await Book.findByPk(bookId);
    
    // 检查图书是否存在
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found',
        code: 'BOOK_NOT_FOUND'
      });
    }
    
    // 获取图书的购买渠道并排序
    const purchaseChannels = await PurchaseChannel.findAll({
      where: { bookId },
      order: [['price', order.toUpperCase()]]
    });
    
    return res.status(200).json({
      status: 'success',
      message: `Purchase channels sorted by price (${order}) retrieved successfully`,
      data: {
        purchase_channels: purchaseChannels.map(channel => ({
          id: channel.id,
          platform: channel.platform,
          url: channel.url,
          price: channel.price,
          is_promotion: channel.is_promotion,
          promotion_price: channel.promotion_price,
          shipping_info: channel.shipping_info,
          stock_status: channel.stock_status
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

module.exports = router;