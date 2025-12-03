# 图书推荐应用 RESTful API 设计

## 1. API概述

本API设计符合RESTful规范，为支持WEB和微信小程序的图书推荐应用提供服务。API采用版本控制，便于未来扩展和维护。

## 2. 基础URL

```
https://api.book-recommend.com/v1
```

## 3. 资源命名规范

- 使用复数形式命名资源（如`/books`而不是`/book`）
- 使用小写字母和连字符（`-`）分隔单词
- 使用嵌套路径表示资源之间的关系（如`/users/123/favorites`）

## 4. HTTP方法使用

| HTTP方法 | 用途 |
|---------|------|
| GET     | 获取资源 |
| POST    | 创建资源 |
| PUT     | 更新资源 |
| DELETE  | 删除资源 |
| PATCH   | 部分更新资源 |

## 5. 状态码使用

| 状态码 | 描述 |
|-------|------|
| 200 OK | 请求成功 |
| 201 Created | 资源创建成功 |
| 204 No Content | 请求成功但无响应体 |
| 400 Bad Request | 请求参数错误 |
| 401 Unauthorized | 未授权访问 |
| 403 Forbidden | 禁止访问 |
| 404 Not Found | 资源不存在 |
| 500 Internal Server Error | 服务器内部错误 |

## 6. 资源设计

### 6.1 用户资源（Users）

#### 获取当前用户信息
```
GET /users/me
```

#### 更新用户信息
```
PUT /users/me
```

#### 获取用户阅读历史
```
GET /users/me/reading-history
```

#### 获取用户收藏
```
GET /users/me/favorites
```

#### 获取用户订单
```
GET /users/me/orders
```

### 6.2 图书资源（Books）

#### 获取图书列表
```
GET /books
```

#### 获取图书详情
```
GET /books/{id}
```

#### 获取图书详情（按ISBN）
```
GET /books/isbn/{isbn}
```

#### 获取热门图书
```
GET /books/popular
```

#### 获取新书推荐
```
GET /books/new
```

#### 获取分类图书
```
GET /books/categories/{category}
```

### 6.3 搜索资源（Search）

#### 搜索图书
```
GET /search/books
```

#### 获取搜索历史
```
GET /search/history
```

#### 清空搜索历史
```
DELETE /search/history
```

### 6.4 下载链接资源（DownloadLinks）

#### 获取图书下载链接
```
GET /books/{id}/download-links
```

#### 报告无效链接
```
POST /download-links/{id}/report
```

### 6.5 购买渠道资源（PurchaseChannels）

#### 获取图书购买渠道
```
GET /books/{id}/purchase-channels
```

#### 获取最低价格购买渠道
```
GET /books/{id}/purchase-channels/cheapest
```

### 6.6 用户偏好资源（Preferences）

#### 获取用户偏好
```
GET /users/me/preferences
```

#### 更新用户偏好
```
PUT /users/me/preferences
```

## 7. 请求参数规范

### 7.1 分页参数

```
GET /books?page=1&limit=20
```

- `page`: 当前页码（默认1）
- `limit`: 每页记录数（默认20，最大100）

### 7.2 排序参数

```
GET /books?sort=published_date&order=desc
```

- `sort`: 排序字段
- `order`: 排序方向（asc/desc）

### 7.3 过滤参数

```
GET /books?category=小说&author=村上春树
```

## 8. 响应格式规范

### 8.1 成功响应

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "挪威的森林",
    "author": "村上春树",
    "isbn": "9787544247173",
    "publisher": "南海出版公司",
    "published_date": "2011-08-01",
    "pages": 384,
    "cover_url": "https://example.com/cover.jpg",
    "rating": 8.6,
    "description": "这是一本关于成长的小说..."
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 8.2 错误响应

```json
{
  "status": "error",
  "message": "图书不存在",
  "code": "BOOK_NOT_FOUND",
  "timestamp": "2023-06-15T10:30:00Z"
}
```

## 9. 认证与授权

- 使用JWT进行认证
- API请求需要在`Authorization`头中包含JWT令牌
- 部分API允许匿名访问（如图书搜索、图书详情）

```
Authorization: Bearer {token}
```

## 10. 跨域支持

API支持跨域资源共享（CORS），允许来自WEB和微信小程序的请求。

## 11. 缓存策略

- 使用ETag和Last-Modified头进行缓存验证
- 对热门图书和搜索结果进行服务器端缓存
- 缓存时间根据资源类型和更新频率动态调整

## 12. API版本控制

API使用URL路径进行版本控制，如`/v1/books`。未来版本将使用新的版本号，如`/v2/books`。