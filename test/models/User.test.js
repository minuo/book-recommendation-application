// 在测试环境中使用内存数据库
process.env.DB_NAME = ':memory:';

const sequelize = require('../../src/config/database').sequelize;
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  test('should create a new user', async () => {
    // 手动哈希密码
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await User.create({
      nickname: 'testuser',
      email: 'test@example.com',
      phone: '13800138000',
      password_hash: hashedPassword
    });

    expect(user).toHaveProperty('id');
    expect(user.nickname).toBe('testuser');
    expect(user.email).toBe('test@example.com');
    expect(user.phone).toBe('13800138000');
    expect(user.password_hash).not.toBe('password123'); // 密码应该已经被哈希
  });

  test('should validate password correctly', async () => {
    // 手动哈希密码
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await User.create({
      nickname: 'testuser2',
      email: 'test2@example.com',
      phone: '13800138001',
      password_hash: hashedPassword
    });

    const isPasswordValid = await user.validatePassword('password123');
    const isPasswordInvalid = await user.validatePassword('wrongpassword');

    expect(isPasswordValid).toBe(true);
    expect(isPasswordInvalid).toBe(false);
  });

  test('should not allow duplicate email', async () => {
    // 手动哈希密码
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await User.create({
      nickname: 'testuser3',
      email: 'duplicate@example.com',
      phone: '13800138002',
      password_hash: hashedPassword
    });

    await expect(User.create({
      nickname: 'testuser4',
      email: 'duplicate@example.com',
      phone: '13800138003',
      password_hash: hashedPassword
    })).rejects.toThrow();
  });
});
