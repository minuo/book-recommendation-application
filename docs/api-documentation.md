# 图书推荐应用API文档

## 1. 概述

本API是一个支持WEB和微信小程序的图书推荐应用的后端接口，遵循RESTful API设计规范，提供用户管理、图书搜索、下载链接获取、购买渠道推荐、用户偏好和历史记录管理等功能。

## 2. 快速开始

### 2.1 环境要求

- Node.js >= 14.0.0
- MySQL >= 5.7.0
- Redis (可选，用于缓存)

### 2.2 安装和运行

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置数据库连接和其他参数

# 启动开发服务器
npm run dev

# 启动生产服务器
npm run start
```

### 2.3 基础URL

```
http://localhost:3000/api/v1
```

## 3. 认证机制

本API使用JWT (JSON Web Token) 进行认证。用户注册或登录后会获得一个token，在请求需要认证的接口时，需要在请求头中携带该token：

```
Authorization: Bearer {token}
```

## 4. API端点详细说明

### 4.1 用户相关API

#### 4.1.1 用户注册

**请求**
```
POST /api/v1/users/register
Content-Type: application/json

{
  "nickname": "用户名",
  "email": "user@example.com",
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "nickname": "用户名",
      "email": "user@example.com",
      "phone": "13800138000",
      "avatar": null,
      "status": "active",
      "created_at": "2023-05-20T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4.1.2 用户登录

**请求**
```
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

或者使用手机号登录：

```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "nickname": "用户名",
      "email": "user@example.com",
      "phone": "13800138000",
      "avatar": null,
      "status": "active",
      "created_at": "2023-05-20T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4.1.3 获取用户信息

**请求**
```
GET /api/v1/users/me
Authorization: Bearer {token}
```

**响应**
```json
{
  "status": "success",
  "message": "User information retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "nickname": "用户名",
      "email": "user@example.com",
      "phone": "13800138000",
      "avatar": null,
      "status": "active",
      "created_at": "2023-05-20T10:00:00.000Z"
    }
  }
}
```

#### 4.1.4 更新用户信息

**请求**
```
PUT /api/v1/users/me
Content-Type: application/json
Authorization: Bearer {token}

{
  "nickname": "新用户名",
  "avatar": "https://example.com/avatar.jpg"
}
```

**响应**
```json
{
  "status": "success",
  "message": "User information updated successfully",
  "data": {
    "user": {
      "id": 1,
      "nickname": "新用户名",
      "email": "user@example.com",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar.jpg",
      "status": "active",
      "created_at": "2023-05-20T10:00:00.000Z"
    }
  }
}
```

#### 4.1.5 重置密码

**请求**
```
PUT /api/v1/users/password
Content-Type: application/json
Authorization: Bearer {token}

{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**响应**
```json
{
  "status": "success",
  "message": "Password updated successfully"
}
```

#### 4.1.6 微信登录

**请求**
```
POST /api/v1/users/wechat/login
Content-Type: application/json

{
  "code": "微信登录code"
}
```

**响应**
```json
{
  "status": "success",
  "message": "WeChat login successful",
  "data": {
    "user": {
      "id": 2,
      "nickname": "WeChat User abc12",
      "email": null,
      "phone": null,
      "avatar": null,
      "status": "active",
      "created_at": "2023-05-20T11:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4.2 图书相关API

#### 4.2.1 图书搜索

**请求**
```
GET /api/v1/books/search?keyword=技术&category=计算机&page=1&limit=10
```

**参数说明**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| keyword | string | 否 | 搜索关键词 |
| category | string | 否 | 图书分类 |
| author | string | 否 | 作者名 |
| publisher | string | 否 | 出版社 |
| isbn | string | 否 | ISBN号 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |

**响应**
```json
{
  "status": "success",
  "message": "Books found successfully",
  "data": {
    "books": [
      {
        "id": 1,
        "title": "JavaScript高级程序设计",
        "author": "Nicholas C. Zakas",
        "isbn": "9787115421889",
        "publisher": "人民邮电出版社",
        "cover_image": "https://example.com/cover1.jpg",
        "category": "计算机",
        "price": 109.00,
        "rating": 4.8,
        "rating_count": 15234,
        "description": "本书是JavaScript领域的经典之作...",
        "published_date": "2016-09-01T00:00:00.000Z",
        "created_at": "2023-05-18T10:00:00.000Z"
      },
      // 更多图书...
    ],
    "pagination": {
      "total": 156,
      "page": 1,
      "limit": 10,
      "total_pages": 16
    }
  }
}
```

#### 4.2.2 获取图书详情

**请求**
```
GET /api/v1/books/1
```

**响应**
```json
{
  "status": "success",
  "message": "Book details retrieved successfully",
  "data": {
    "book": {
      "id": 1,
      "title": "JavaScript高级程序设计",
      "author": "Nicholas C. Zakas",
      "isbn": "9787115421889",
      "publisher": "人民邮电出版社",
      "cover_image": "https://example.com/cover1.jpg",
      "category": "计算机",
      "price": 109.00,
      "rating": 4.8,
      "rating_count": 15234,
      "view_count": 89234,
      "description": "本书是JavaScript领域的经典之作...",
      "published_date": "2016-09-01T00:00:00.000Z",
      "created_at": "2023-05-18T10:00:00.000Z",
      "updated_at": "2023-05-20T14:30:00.000Z"
    }
  }
}
```

#### 4.2.3 获取热门图书列表

**请求**
```
GET /api/v1/books/popular/list?limit=20
```

**响应**
```json
{
  "status": "success",
  "message": "Popular books retrieved successfully",
  "data": {
    "books": [
      {
        "id": 1,
        "title": "JavaScript高级程序设计",
        "author": "Nicholas C. Zakas",
        "cover_image": "https://example.com/cover1.jpg",
        "category": "计算机",
        "rating": 4.8,
        "view_count": 89234
      },
      // 更多图书...
    ]
  }
}
```

#### 4.2.4 获取新书推荐列表

**请求**
```
GET /api/v1/books/new/list?limit=20
```

**响应**
```json
{
  "status": "success",
  "message": "New books retrieved successfully",
  "data": {
    "books": [
      {
        "id": 2,
        "title": "Python编程：从入门到实践",
        "author": "Eric Matthes",
        "cover_image": "https://example.com/cover2.jpg",
        "category": "计算机",
        "rating": 4.7,
        "published_date": "2022-10-01T00:00:00.000Z"
      },
      // 更多图书...
    ]
  }
}
```

#### 4.2.5 获取最新添加的图书列表

**请求**
```
GET /api/v1/books/latest?limit=10
```

**参数说明**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| limit | number | 否 | 返回数量，默认10条，最大不超过100条 |

**响应**
```json
{
  "status": "success",
  "message": "Latest books retrieved successfully",
  "data": {
    "books": [
      {
        "id": 21,
        "title": "最新添加的图书",
        "author": "作者名称",
        "isbn": "9787115123456",
        "category": "计算机",
        "publisher": "出版社名称",
        "publish_date": "2023-05-01T00:00:00.000Z",
        "cover_url": "https://example.com/cover.jpg",
        "description": "图书描述信息...",
        "view_count": 123,
        "create_time": "2023-05-20T14:30:00.000Z"
      },
      // 更多图书...
    ]
  }
}
```

#### 4.2.6 获取图书分类列表

**请求**
```
GET /api/v1/books/categories
```

**响应**
```json
{
  "status": "success",
  "message": "Book categories retrieved successfully",
  "data": {
    "categories": [
      "计算机",
      "文学",
      "历史",
      "哲学",
      "经济",
      "管理",
      "艺术"
    ]
  }
}
```

#### 4.2.7 获取分类下的图书列表

**请求**
```
GET /api/v1/books/category/计算机?page=1&limit=10
```

**响应**
```json
{
  "status": "success",
  "message": "Books in category '计算机' retrieved successfully",
  "data": {
    "books": [
      {
        "id": 1,
        "title": "JavaScript高级程序设计",
        "author": "Nicholas C. Zakas",
        "cover_image": "https://example.com/cover1.jpg",
        "category": "计算机",
        "rating": 4.8,
        "view_count": 89234
      },
      // 更多图书...
    ],
    "pagination": {
      "total": 56,
      "page": 1,
      "limit": 10,
      "total_pages": 6
    }
  }
}
```

### 4.3 下载和购买链接API

#### 4.3.1 获取图书的下载链接列表

**请求**
```
GET /api/v1/links/download/1
```

**响应**
```json
{
  "status": "success",
  "message": "Download links retrieved successfully",
  "data": {
    "download_links": [
      {
        "id": 1,
        "url": "https://pan.baidu.com/s/1abcdefg12345",
        "platform": "百度网盘",
        "file_size": "30MB",
        "file_format": "PDF",
        "is_valid": true,
        "download_count": 1234,
        "last_check_time": "2023-05-20T10:00:00.000Z",
        "create_time": "2023-05-18T10:00:00.000Z"
      },
      {
        "id": 2,
        "url": "https://www.aliyundrive.com/s/xyz789",
        "platform": "阿里云盘",
        "file_size": "35MB",
        "file_format": "EPUB",
        "is_valid": true,
        "download_count": 567,
        "last_check_time": "2023-05-20T10:00:00.000Z",
        "create_time": "2023-05-18T10:00:00.000Z"
      }
    ]
  },
  "copyright_notice": "请遵守版权法律法规，仅下载和使用符合版权规定的图书资源"
}
```

#### 4.3.2 验证下载链接的有效性

**请求**
```
GET /api/v1/links/download/1/validate
Authorization: Bearer {token}
```

**响应**
```json
{
  "status": "success",
  "message": "Download link validation completed",
  "data": {
    "link": {
      "id": 1,
      "url": "https://pan.baidu.com/s/1abcdefg12345",
      "platform": "百度网盘",
      "is_valid": true,
      "last_check_time": "2023-05-20T15:30:00.000Z"
    }
  }
}
```

#### 4.3.3 增加下载计数

**请求**
```
PUT /api/v1/links/download/1/count
```

**响应**
```json
{
  "status": "success",
  "message": "Download count updated successfully",
  "data": {
    "link": {
      "id": 1,
      "download_count": 1235
    }
  }
}
```

#### 4.3.4 获取图书的购买渠道列表

**请求**
```
GET /api/v1/links/purchase/1
```

**响应**
```json
{
  "status": "success",
  "message": "Purchase channels retrieved successfully",
  "data": {
    "purchase_channels": [
      {
        "id": 1,
        "platform": "京东图书",
        "url": "https://item.jd.com/123456.html",
        "price": 109.00,
        "is_promotion": true,
        "promotion_price": 89.00,
        "shipping_info": "京东包邮",
        "stock_status": "in_stock",
        "last_update_time": "2023-05-20T10:00:00.000Z"
      },
      {
        "id": 2,
        "platform": "当当网",
        "url": "https://product.dangdang.com/123456.html",
        "price": 109.00,
        "is_promotion": true,
        "promotion_price": 92.00,
        "shipping_info": "当当包邮",
        "stock_status": "in_stock",
        "last_update_time": "2023-05-20T10:00:00.000Z"
      }
    ],
    "price_summary": {
      "min_price": 89.00,
      "avg_price": 90.50
    }
  }
}
```

#### 4.3.5 按价格排序获取购买渠道

**请求**
```
GET /api/v1/links/purchase/1/sort?order=asc
```

**参数说明**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| order | string | 否 | 排序方式，asc或desc，默认asc |

**响应**
```json
{
  "status": "success",
  "message": "Purchase channels sorted by price (asc) retrieved successfully",
  "data": {
    "purchase_channels": [
      {
        "id": 1,
        "platform": "京东图书",
        "url": "https://item.jd.com/123456.html",
        "price": 109.00,
        "is_promotion": true,
        "promotion_price": 89.00,
        "shipping_info": "京东包邮",
        "stock_status": "in_stock"
      },
      {
        "id": 2,
        "platform": "当当网",
        "url": "https://product.dangdang.com/123456.html",
        "price": 109.00,
        "is_promotion": true,
        "promotion_price": 92.00,
        "shipping_info": "当当包邮",
        "stock_status": "in_stock"
      },
      {
        "id": 3,
        "platform": "亚马逊",
        "url": "https://www.amazon.cn/dp/123456",
        "price": 109.00,
        "is_promotion": false,
        "promotion_price": null,
        "shipping_info": "满99包邮",
        "stock_status": "in_stock"
      }
    ]
  }
}
```

### 4.4 用户偏好和历史记录API

#### 4.4.1 获取用户的阅读历史记录

**请求**
```
GET /api/v1/history/reading-history?page=1&limit=10
Authorization: Bearer {token}
```

**响应**
```json
{
  "status": "success",
  "message": "Reading history retrieved successfully",
  "data": {
    "reading_history": [
      {
        "id": 1,
        "book": {
          "id": 1,
          "title": "JavaScript高级程序设计",
          "author": "Nicholas C. Zakas",
          "cover_image": "https://example.com/cover1.jpg",
          "category": "计算机",
          "rating": 4.8
        },
        "page": 150,
        "view_time": "2023-05-20T14:30:00.000Z"
      },
      // 更多历史记录...
    ],
    "pagination": {
      "total": 23,
      "page": 1,
      "limit": 10,
      "total_pages": 3
    }
  }
}
```

#### 4.4.2 添加阅读记录

**请求**
```
POST /api/v1/history/reading-history
Content-Type: application/json
Authorization: Bearer {token}

{
  "bookId": 1,
  "page": 150
}
```

**响应**
```json
{
  "status": "success",
  "message": "Reading history updated successfully",
  "data": {
    "reading_history": {
      "id": 1,
      "bookId": 1,
      "page": 150,
      "view_time": "2023-05-20T14:30:00.000Z"
    }
  }
}
```

#### 4.4.3 获取用户的收藏图书列表

**请求**
```
GET /api/v1/history/favorites?page=1&limit=10
Authorization: Bearer {token}
```

**响应**
```json
{
  "status": "success",
  "message": "Favorites retrieved successfully",
  "data": {
    "favorites": [
      {
        "id": 1,
        "book": {
          "id": 1,
          "title": "JavaScript高级程序设计",
          "author": "Nicholas C. Zakas",
          "cover_image": "https://example.com/cover1.jpg",
          "category": "计算机",
          "rating": 4.8,
          "description": "本书是JavaScript领域的经典之作..."
        },
        "created_at": "2023-05-19T10:00:00.000Z"
      },
      // 更多收藏...
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "total_pages": 2
    }
  }
}
```

#### 4.4.4 添加收藏

**请求**
```
POST /api/v1/history/favorites
Content-Type: application/json
Authorization: Bearer {token}

{
  "bookId": 1
}
```

**响应**
```json
{
  "status": "success",
  "message": "Book added to favorites successfully",
  "data": {
    "favorite": {
      "id": 1,
      "bookId": 1,
      "userId": 1,
      "created_at": "2023-05-19T10:00:00.000Z"
    }
  }
}
```

#### 4.4.5 删除收藏

**请求**
```
DELETE /api/v1/history/favorites/1
Authorization: Bearer {token}
```

**响应**
```json
{
  "status": "success",
  "message": "Book removed from favorites successfully"
}
```

#### 4.4.6 检查图书是否已收藏

**请求**
```
GET /api/v1/history/favorites/check/1
Authorization: Bearer {token}
```

**响应**
```json
{
  "status": "success",
  "message": "Favorite status checked successfully",
  "data": {
    "is_favorite": true
  }
}
```

#### 4.4.7 获取用户的购买记录

**请求**
```
GET /api/v1/history/purchases?page=1&limit=10
Authorization: Bearer {token}
```

**响应**
```json
{
  "status": "success",
  "message": "Purchase history retrieved successfully",
  "data": {
    "purchases": [
      {
        "id": 1,
        "book": {
          "id": 1,
          "title": "JavaScript高级程序设计",
          "author": "Nicholas C. Zakas",
          "cover_image": "https://example.com/cover1.jpg",
          "category": "计算机"
        },
        "price": 89.00,
        "platform": "京东图书",
        "order_no": "JD123456789",
        "status": "completed",
        "created_at": "2023-05-18T10:00:00.000Z"
      },
      // 更多购买记录...
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "total_pages": 1
    }
  }
}
```

#### 4.4.8 获取用户偏好设置

**请求**
```
GET /api/v1/history/preferences
Authorization: Bearer {token}
```

**响应**
```json
{
  "status": "success",
  "message": "User preferences retrieved successfully",
  "data": {
    "preferences": {
      "id": 1,
      "favorite_categories": ["计算机", "技术"],
      "favorite_authors": ["Nicholas C. Zakas", "Eric Matthes"],
      "preferred_language": "中文",
      "reading_time": "evening",
      "reading_goal": 30,
      "create_time": "2023-05-18T10:00:00.000Z",
      "update_time": "2023-05-19T10:00:00.000Z"
    }
  }
}
```

#### 4.4.9 更新用户偏好设置

**请求**
```
PUT /api/v1/history/preferences
Content-Type: application/json
Authorization: Bearer {token}

{
  "favorite_categories": ["计算机", "技术", "编程"],
  "preferred_language": "中文",
  "reading_time": "morning",
  "reading_goal": 60
}
```

**响应**
```json
{
  "status": "success",
  "message": "User preferences updated successfully",
  "data": {
    "preferences": {
      "id": 1,
      "favorite_categories": ["计算机", "技术", "编程"],
      "favorite_authors": ["Nicholas C. Zakas", "Eric Matthes"],
      "preferred_language": "中文",
      "reading_time": "morning",
      "reading_goal": 60,
      "create_time": "2023-05-18T10:00:00.000Z",
      "update_time": "2023-05-20T15:30:00.000Z"
    }
  }
}
```

## 5. 错误处理

### 5.1 错误响应格式

所有错误响应都遵循统一的格式：

```json
{
  "status": "error",
  "message": "错误描述",
  "code": "错误代码"
}
```

### 5.2 常见错误代码

| 错误代码 | 状态码 | 描述 |
|----------|--------|------|
| MISSING_REQUIRED_FIELDS | 400 | 缺少必填字段 |
| EMAIL_ALREADY_EXISTS | 400 | 邮箱已存在 |
| PHONE_ALREADY_EXISTS | 400 | 手机号已存在 |
| INVALID_CREDENTIALS | 401 | 用户名或密码错误 |
| USER_ACCOUNT_INACTIVE | 401 | 用户账户未激活 |
| AUTHORIZATION_HEADER_INVALID | 401 | 认证头缺失或无效 |
| TOKEN_EXPIRED | 401 | 令牌已过期 |
| TOKEN_INVALID | 401 | 令牌无效 |
| USER_NOT_FOUND | 404 | 用户不存在 |
| BOOK_NOT_FOUND | 404 | 图书不存在 |
| DOWNLOAD_LINK_NOT_FOUND | 404 | 下载链接不存在 |
| FAVORITE_NOT_FOUND | 404 | 收藏不存在 |
| ENDPOINT_NOT_FOUND | 404 | API端点不存在 |
| BOOK_ALREADY_IN_FAVORITES | 400 | 图书已在收藏列表中 |
| INVALID_SORT_ORDER | 400 | 无效的排序参数 |
| INTERNAL_SERVER_ERROR | 500 | 服务器内部错误 |

## 6. 响应格式

所有API响应都遵循统一的格式：

### 6.1 成功响应

```json
{
  "status": "success",
  "message": "操作成功描述",
  "data": {
    // 响应数据，根据接口不同而不同
  }
}
```

### 6.2 分页响应

```json
{
  "status": "success",
  "message": "操作成功描述",
  "data": {
    "items": [
      // 数据列表
    ],
    "pagination": {
      "total": 总记录数,
      "page": 当前页码,
      "limit": 每页数量,
      "total_pages": 总页数
    }
  }
}
```

## 7. 使用示例

### 7.1 JavaScript示例

```javascript
// 用户登录示例
fetch('http://localhost:3000/api/v1/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => {
  if (data.status === 'success') {
    // 保存token
    localStorage.setItem('token', data.data.token);
    
    // 使用token获取用户信息
    return fetch('http://localhost:3000/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${data.data.token}`
      }
    });
  }
})
.then(response => response.json())
.then(data => {
  console.log('用户信息:', data.data.user);
})
.catch(error => {
  console.error('错误:', error);
});
```

### 7.2 Python示例

```python
import requests
import json

# 用户登录
login_url = 'http://localhost:3000/api/v1/users/login'
login_data = {
    'email': 'user@example.com',
    'password': 'password123'
}

response = requests.post(login_url, json=login_data)
if response.status_code == 200:
    data = response.json()
    token = data['data']['token']
    
    # 使用token获取用户信息
    user_url = 'http://localhost:3000/api/v1/users/me'
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    user_response = requests.get(user_url, headers=headers)
    if user_response.status_code == 200:
        user_data = user_response.json()
        print('用户信息:', user_data['data']['user'])
    else:
        print('获取用户信息失败:', user_response.json())
else:
    print('登录失败:', response.json())
```

## 8. 注意事项

1. 本API遵循RESTful设计规范，使用HTTP方法表示操作类型：
   - GET: 获取资源
   - POST: 创建资源
   - PUT: 更新资源
   - DELETE: 删除资源

2. 所有请求和响应都使用JSON格式。

3. 对于需要认证的接口，必须在请求头中携带有效的JWT token。

4. 分页接口默认返回10条数据，可通过limit参数调整。

5. 下载链接仅供学习和研究使用，请遵守版权法律法规，不要用于商业目的。

## 9. 版本控制

API使用URL路径进行版本控制，当前版本为v1：

```
http://localhost:3000/api/v1/
```

当API进行不兼容的重大变更时，会增加新的版本号（如v2）。