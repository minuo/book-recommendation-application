const dotenv = require('dotenv');
const sequelize = require('../src/config/database');

// 加载环境变量
dotenv.config();

// 导入所有模型
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const DownloadLink = require('../src/models/DownloadLink');
const Favorite = require('../src/models/Favorite');
const Order = require('../src/models/Order');
const Preference = require('../src/models/Preference');
const PurchaseChannel = require('../src/models/PurchaseChannel');
const ReadingHistory = require('../src/models/ReadingHistory');

// 所有模型列表（按依赖顺序排序，先删除有外键依赖的表）
const models = [
  ReadingHistory,  // 依赖于User和Book
  Favorite,       // 依赖于User和Book
  Order,          // 依赖于User和Book
  Preference,     // 依赖于User
  DownloadLink,   // 依赖于Book
  PurchaseChannel, // 依赖于Book
  Book,           // 主表
  User            // 主表
];

/**
 * 重置数据库：清除所有表数据并重置id自增序列
 * @returns {Promise<void>}
 */
async function resetDatabase() {
  try {
    // 1. 检查环境，避免在生产环境中误执行
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ 禁止在生产环境中执行数据库重置操作！');
      console.error('如需在生产环境执行此操作，请先将NODE_ENV设置为非production值。');
      process.exit(1);
    }

    // 2. 连接数据库
    console.log('🔄 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 3. 显示确认信息
    console.log('\n⚠️  警告：此操作将执行以下操作：');
    console.log('   - 清除数据库中所有表的现有数据');
    console.log('   - 将所有表的id自增序列重置为初始值(1)');
    console.log('\n执行前请确保已备份重要数据！');

    // 4. 等待用户确认（通过环境变量或命令行参数）
    const confirmReset = process.argv.includes('--force') || process.env.RESET_DATABASE === 'true';
    if (!confirmReset) {
      console.log('\n🚫 操作已取消。请使用以下命令之一来确认执行：');
      console.log('   node reset-database.js --force');
      console.log('   或设置环境变量：RESET_DATABASE=true node reset-database.js');
      process.exit(0);
    }

    console.log('\n🟡 开始执行数据库重置操作...');

    // 5. 清除所有表数据
    console.log('\n1. 清除所有表数据：');
    for (const model of models) {
      const tableName = model.tableName;
      try {
        await model.destroy({ where: {}, truncate: false });
        console.log(`   ✅ 清除表 ${tableName} 数据成功`);
      } catch (error) {
        console.error(`   ❌ 清除表 ${tableName} 数据失败：`, error.message);
        throw error;
      }
    }

    // 6. 重置SQLite自增序列
    console.log('\n2. 重置所有表的id自增序列：');
    for (const model of models) {
      const tableName = model.tableName;
      try {
        // 在SQLite中，自增序列由sqlite_sequence表管理
        await sequelize.query(`DELETE FROM sqlite_sequence WHERE name = '${tableName}'`);
        console.log(`   ✅ 重置表 ${tableName} 的id自增序列成功`);
      } catch (error) {
        console.error(`   ❌ 重置表 ${tableName} 的id自增序列失败：`, error.message);
        throw error;
      }
    }

    // 7. 验证数据清除结果
    console.log('\n3. 验证数据清除结果：');
    let allTablesEmpty = true;
    for (const model of models) {
      const tableName = model.tableName;
      try {
        const count = await model.count();
        if (count === 0) {
          console.log(`   ✅ 表 ${tableName} 数据已完全清除（记录数：${count}）`);
        } else {
          console.error(`   ❌ 表 ${tableName} 仍有数据（记录数：${count}）`);
          allTablesEmpty = false;
        }
      } catch (error) {
        console.error(`   ❌ 验证表 ${tableName} 数据失败：`, error.message);
        allTablesEmpty = false;
      }
    }

    // 8. 验证id自增序列重置结果（通过插入测试数据）
    console.log('\n4. 验证id自增序列重置结果：');
    let allSequencesReset = true;
    
    // 测试插入一个用户并检查id是否为1
    try {
      const testUser = await User.create({
        nickname: 'test_user',
        email: 'test@example.com',
        password_hash: 'test_hash',
        status: 'active',
        role: 'user'
      });
      
      if (testUser.id === 1) {
        console.log('   ✅ id自增序列重置成功（测试用户id：1）');
        // 删除测试用户
        await User.destroy({ where: { id: 1 } });
        // 再次重置序列
        await sequelize.query(`DELETE FROM sqlite_sequence WHERE name = 'users'`);
      } else {
        console.error(`   ❌ id自增序列未正确重置（测试用户id：${testUser.id}，预期：1）`);
        allSequencesReset = false;
        // 清理测试数据
        await User.destroy({ where: { id: testUser.id } });
        await sequelize.query(`DELETE FROM sqlite_sequence WHERE name = 'users'`);
      }
    } catch (error) {
      console.error(`   ❌ 验证id自增序列重置失败：`, error.message);
      allSequencesReset = false;
    }

    // 9. 输出最终结果
    console.log('\n=== 数据库重置操作完成 ===');
    if (allTablesEmpty && allSequencesReset) {
      console.log('✅ 数据库重置成功！');
      console.log('   - 所有表数据已完全清除');
      console.log('   - 所有表id自增序列已重置为初始值(1)');
      
      // 10. 自动执行seed.js重新填充数据库
      console.log('\n🔄 正在执行数据填充脚本...');
      const { execSync } = require('child_process');
      try {
        execSync('node scripts/seed.js', { stdio: 'inherit' });
        console.log('✅ 数据填充完成！');
        process.exit(0);
      } catch (error) {
        console.error('❌ 数据填充失败：', error);
        process.exit(1);
      }
    } else {
      console.error('❌ 数据库重置失败！');
      console.error('   - 数据清除状态：', allTablesEmpty ? '成功' : '失败');
      console.error('   - 序列重置状态：', allSequencesReset ? '成功' : '失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 数据库重置过程中发生错误：', error);
    process.exit(1);
  }
}

// 执行数据库重置操作
resetDatabase();