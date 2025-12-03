const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with nickname, email/phone, and password
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: User's nickname
 *                 example: 'booklover'
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (optional if phone is provided)
 *                 example: 'user@example.com'
 *               phone:
 *                 type: string
 *                 description: User's phone number (optional if email is provided)
 *                 example: '13800138000'
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (minimum 6 characters)
 *                 example: 'password123'
 *             required:
 *               - nickname
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: 'User registered successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nickname:
 *                           type: string
 *                           example: 'booklover'
 *                         email:
 *                           type: string
 *                           example: 'user@example.com'
 *                         phone:
 *                           type: string
 *                           example: '13800138000'
 *                         avatar:
 *                           type: string
 *                           example: 'https://example.com/avatar.jpg'
 *                         status:
 *                           type: string
 *                           example: 'active'
 *                         role:
 *                           type: string
 *                           example: 'user'
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: '2023-01-01T00:00:00.000Z'
 *                     token:
 *                       type: string
 *                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
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
 *                   example: 'Nickname and password are required'
 *                 code:
 *                   type: string
 *                   example: 'MISSING_REQUIRED_FIELDS'
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
// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { nickname, email, phone, password } = req.body;
    
    // 验证输入
    if (!nickname || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Nickname and password are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }
    }
    
    // 检查手机号是否已存在
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({
          status: 'error',
          message: 'Phone number already exists',
          code: 'PHONE_ALREADY_EXISTS'
        });
      }
    }
    
    // 哈希密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建用户
    const user = await User.create({
      nickname,
      email,
      phone,
      password_hash: hashedPassword
    });
    
    // 生成JWT令牌
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          role: user.role,
          created_at: user.created_at
        },
        token
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
 * /api/v1/users/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email/phone and password to get JWT token
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (optional if phone is provided)
 *                 example: 'user@example.com'
 *               phone:
 *                 type: string
 *                 description: User's phone number (optional if email is provided)
 *                 example: '13800138000'
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: 'password123'
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: 'Login successful'
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nickname:
 *                           type: string
 *                           example: 'booklover'
 *                         email:
 *                           type: string
 *                           example: 'user@example.com'
 *                         phone:
 *                           type: string
 *                           example: '13800138000'
 *                         avatar:
 *                           type: string
 *                           example: 'https://example.com/avatar.jpg'
 *                         status:
 *                           type: string
 *                           example: 'active'
 *                         role:
 *                           type: string
 *                           example: 'user'
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: '2023-01-01T00:00:00.000Z'
 *                     token:
 *                       type: string
 *                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
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
 *                   example: 'Email or phone and password are required'
 *                 code:
 *                   type: string
 *                   example: 'MISSING_REQUIRED_FIELDS'
 *       401:
 *         description: Invalid credentials
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
 *                   example: 'Invalid email/phone or password'
 *                 code:
 *                   type: string
 *                   example: 'INVALID_CREDENTIALS'
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
// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    // 验证输入
    if (!password || (!email && !phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Email or phone and password are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // 查找用户
    const user = await User.findOne({
      where: email ? { email } : { phone }
    });
    
    // 检查用户是否存在
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email/phone or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // 检查密码是否正确
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email/phone or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'User account is inactive',
        code: 'USER_ACCOUNT_INACTIVE'
      });
    }
    
    // 生成JWT令牌
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          role: user.role,
          created_at: user.created_at
        },
        token
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
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user information
 *     description: Retrieve current user's details
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                   example: 'User information retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nickname:
 *                           type: string
 *                           example: 'booklover'
 *                         email:
 *                           type: string
 *                           example: 'user@example.com'
 *                         phone:
 *                           type: string
 *                           example: '13800138000'
 *                         avatar:
 *                           type: string
 *                           example: 'https://example.com/avatar.jpg'
 *                         status:
 *                           type: string
 *                           example: 'active'
 *                         role:
 *                           type: string
 *                           example: 'user'
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: '2023-01-01T00:00:00.000Z'
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
// 获取用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    // 从请求对象中获取用户信息
    const user = req.user;
    
    return res.status(200).json({
      status: 'success',
      message: 'User information retrieved successfully',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          created_at: user.created_at
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
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user information
 *     description: Update current user's details
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: User's nickname
 *                 example: 'bookworm'
 *               avatar:
 *                 type: string
 *                 description: User's avatar URL
 *                 example: 'https://example.com/newavatar.jpg'
 *     responses:
 *       200:
 *         description: User information updated successfully
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
 *                   example: 'User information updated successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nickname:
 *                           type: string
 *                           example: 'bookworm'
 *                         email:
 *                           type: string
 *                           example: 'user@example.com'
 *                         phone:
 *                           type: string
 *                           example: '13800138000'
 *                         avatar:
 *                           type: string
 *                           example: 'https://example.com/newavatar.jpg'
 *                         status:
 *                           type: string
 *                           example: 'active'
 *                         role:
 *                           type: string
 *                           example: 'user'
 *                         created_at:
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
// 更新用户信息
router.put('/me', authenticate, async (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    const user = req.user;
    
    // 更新用户信息
    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'User information updated successfully',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          created_at: user.created_at
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

// 重置密码
router.put('/password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;
    
    // 验证输入
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Old password and new password are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // 检查旧密码是否正确
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Old password is incorrect',
        code: 'INVALID_OLD_PASSWORD'
      });
    }
    
    // 哈希新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // 更新密码
    user.password_hash = hashedPassword;
    await user.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
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

// 微信登录
router.post('/wechat/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    // 验证输入
    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'WeChat code is required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // 这里应该调用微信API验证code并获取用户信息
    // 为了演示，我们假设已经获取到了openid
    const openid = 'test_openid_' + Math.random().toString(36).substr(2, 9);
    
    // 查找用户
    let user = await User.findOne({ where: { wx_openid: openid } });
    
    // 如果用户不存在，创建新用户
    if (!user) {
      user = await User.create({
        wx_openid: openid,
        nickname: 'WeChat User ' + openid.substring(0, 5),
        status: 'active'
      });
    }
    
    // 生成JWT令牌
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'WeChat login successful',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          created_at: user.created_at
        },
        token
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