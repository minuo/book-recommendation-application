// 在测试环境中使用内存数据库
process.env.DB_NAME = ':memory:';
// 设置JWT_SECRET环境变量
process.env.JWT_SECRET = 'test-jwt-secret';

const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/config/database');

describe('User Routes', () => {
  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/users/register')
      .send({
        nickname: 'testuser',
        email: 'test@example.com',
        phone: '13800138000',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('token');
  });

  test('should login a user', async () => {
    // 先注册一个用户
    await request(app)
      .post('/api/v1/users/register')
      .send({
        nickname: 'loginuser',
        email: 'login@example.com',
        phone: '13800138001',
        password: 'password123'
      });

    // 然后尝试登录
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Login successful');
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('token');
  });

  test('should get user information with valid token', async () => {
    // 先注册一个用户
    const registerResponse = await request(app)
      .post('/api/v1/users/register')
      .send({
        nickname: 'meuser',
        email: 'me@example.com',
        phone: '13800138002',
        password: 'password123'
      });

    const token = registerResponse.body.data.token;

    // 使用token获取用户信息
    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('User information retrieved successfully');
    expect(response.body.data.user.email).toBe('me@example.com');
  });

  test('should not get user information with invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Invalid token');
  });
});
