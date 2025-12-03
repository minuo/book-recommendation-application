const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.header('Authorization');
    
    // 检查Authorization头是否存在且格式正确
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization header missing or invalid',
        code: 'AUTHORIZATION_HEADER_INVALID'
      });
    }
    
    // 提取token
    const token = authHeader.replace('Bearer ', '');
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findByPk(decoded.id);
    
    // 检查用户是否存在
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
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
    
    // 将用户信息附加到请求对象
    req.user = user;
    
    // 继续处理请求
    next();
  } catch (error) {
    // 处理token过期或无效
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    
    // 其他错误
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = authenticate;