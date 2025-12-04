# 图书推荐应用部署指南

## 1. 环境准备要求

### 1.1 本地开发环境
- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器
- Git 版本控制工具

### 1.2 阿里云服务器要求
- 操作系统：Ubuntu 20.04 LTS 或更高版本
- CPU：1核或以上
- 内存：2GB或以上
- 磁盘：20GB或以上
- 网络：公网IP地址，开放必要端口（默认3000）

### 1.3 必要软件
- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器
- Git 版本控制工具
- PM2 进程管理器（用于生产环境）

## 2. 阿里云服务器配置步骤

### 2.1 服务器初始化

1. **连接服务器**
   ```bash
   ssh root@your-server-ip
   ```

2. **更新系统包**
   ```bash
   apt update && apt upgrade -y
   ```

3. **创建非root用户**
   ```bash
   adduser deploy
   usermod -aG sudo deploy
   ```

4. **切换到新用户**
   ```bash
   su - deploy
   ```

### 2.2 安装Node.js和npm

```bash
# 使用NodeSource安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 2.3 安装Git

```bash
sudo apt install git -y

# 验证安装
git --version
```

### 2.4 安装PM2进程管理器

```bash
npm install -g pm2

# 验证安装
pm2 -v
```

### 2.5 配置防火墙

```bash
# 允许SSH连接
sudo ufw allow ssh

# 允许应用端口（默认3000）
sudo ufw allow 3000

# 启用防火墙
sudo ufw enable

# 查看防火墙状态
sudo ufw status
```

### 2.6 CentOS操作系统特有配置

#### 2.6.1 CentOS服务器初始化

1. **连接服务器**
   ```bash
   ssh root@your-server-ip
   ```

2. **更新系统包（CentOS 7）**
   ```bash
   yum update -y
   ```

   或者（CentOS 8+，使用dnf）
   ```bash
   dnf update -y
   ```

3. **创建非root用户**
   ```bash
   useradd deploy
   passwd deploy
   ```

4. **添加用户到wheel组（用于sudo权限）**
   ```bash
   usermod -aG wheel deploy
   ```

5. **切换到新用户**
   ```bash
   su - deploy
   ```

#### 2.6.2 安装Node.js和npm（CentOS）

```bash
# 使用NodeSource安装Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# CentOS 7
sudo yum install -y nodejs

# 或者 CentOS 8+
sudo dnf install -y nodejs

# 验证安装
node -v
npm -v
```

#### 2.6.3 安装Git（CentOS）

```bash
# CentOS 7
sudo yum install git -y

# 或者 CentOS 8+
sudo dnf install git -y

# 验证安装
git --version
```

#### 2.6.4 安装PM2进程管理器（CentOS）

```bash
npm install -g pm2

# 验证安装
pm2 -v
```

#### 2.6.5 配置防火墙（firewalld，CentOS）

```bash
# 启用并启动firewalld服务
sudo systemctl enable firewalld
sudo systemctl start firewalld

# 允许SSH连接
sudo firewall-cmd --permanent --add-service=ssh

# 允许应用端口（默认3000）
sudo firewall-cmd --permanent --add-port=3000/tcp

# 重新加载防火墙规则
sudo firewall-cmd --reload

# 查看防火墙状态
sudo firewall-cmd --list-all
```

#### 2.6.6 SELinux设置（CentOS）

```bash
# 查看SELinux状态
getenforce

# 如果SELinux处于Enforcing模式，可以临时切换到Permissive模式进行测试
sudo setenforce 0

# 永久设置SELinux模式（可选，不建议完全关闭）
# 编辑/etc/selinux/config文件，将SELINUX=enforcing改为SELINUX=permissive或SELINUX=disabled
sudo vi /etc/selinux/config

# 允许Node.js访问网络（如果SELinux处于Enforcing模式）
sudo semanage port -a -t http_port_t -p tcp 3000
```

#### 2.6.7 配置systemd服务（CentOS）

1. **创建systemd服务文件**
   ```bash
   sudo vi /etc/systemd/system/book-recommendation.service
   ```

2. **添加以下内容到服务文件**
   ```ini
   [Unit]
   Description=Book Recommendation Application
   After=network.target
   
   [Service]
   Type=simple
   User=deploy
   WorkingDirectory=/home/deploy/book-recommendation-application
   ExecStart=/usr/bin/node /home/deploy/book-recommendation-application/src/app.js
   Restart=on-failure
   
   [Install]
   WantedBy=multi-user.target
   ```

3. **重新加载systemd配置**
   ```bash
   sudo systemctl daemon-reload
   ```

4. **启用并启动服务**
   ```bash
   sudo systemctl enable book-recommendation
sudo systemctl start book-recommendation
   ```

5. **查看服务状态**
   ```bash
   sudo systemctl status book-recommendation
   ```

## 3. Gitee仓库设置

### 3.1 创建Gitee仓库

1. 登录Gitee账号
2. 创建新仓库，命名为`book-recommendation-application`
3. 将本地代码推送到Gitee仓库

### 3.2 配置SSH密钥

1. **在服务器上生成SSH密钥**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

2. **查看公钥**
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

3. **将公钥添加到Gitee**
   - 登录Gitee账号
   - 进入"设置" > "SSH公钥"
   - 添加服务器生成的公钥

### 3.3 克隆仓库到服务器

```bash
cd /home/deploy
git clone git@gitee.com:your-username/book-recommendation-application.git
```

## 4. 项目配置

### 4.1 安装依赖

```bash
cd book-recommendation-application
npm install
```

### 4.2 配置环境变量

1. **创建.env文件**
   ```bash
   cp .env.example .env
   ```

2. **编辑.env文件**
   ```bash
   nano .env
   ```

3. **添加必要的环境变量**
   ```
   # 应用配置
   PORT=3000
   NODE_ENV=production
   
   # JWT配置
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=7d
   
   # 数据库配置（项目默认使用SQLite）
   DB_NAME=book_recommendation
   DB_USER=
   DB_PASSWORD=
   DB_HOST=
   DB_PORT=
   
   # 可选：如果使用MySQL
   # DB_DIALECT=mysql
   ```

## 5. 部署脚本编写指南

### 5.1 创建基本部署脚本

在项目根目录创建`deploy.sh`文件：
```bash
vi deploy.sh
```

```bash
#!/bin/bash

# 部署脚本

echo "开始部署图书推荐应用..."

# 1. 拉取最新代码
echo "1. 拉取最新代码..."
git pull origin main

# 2. 安装依赖
echo "2. 安装依赖..."
npm install --production

# 3. 重启PM2进程
echo "3. 重启应用..."
pm2 restart book-recommendation

echo "部署完成！"
```

### 5.2 为脚本添加执行权限

```bash
chmod +x deploy.sh
```

### 5.3 创建PM2启动脚本

在项目根目录创建`ecosystem.config.js`文件：

```javascript
module.exports = {
  apps : [{
    name: 'book-recommendation',
    script: './src/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## 6. 自动化部署流程说明

### 6.1 使用PM2启动应用

```bash
# 首次启动应用
pm2 start ecosystem.config.js

# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs book-recommendation
```

### 6.2 配置Webhook实现自动部署

1. **在服务器上创建Webhook处理脚本**

   在项目根目录创建`webhook.js`文件：

   ```javascript
   const http = require('http');
   const { exec } = require('child_process');
   const crypto = require('crypto');

   // 配置
   const PORT = 3001;
   const SECRET = 'your-webhook-secret'; // 与Gitee设置的secret一致
   const DEPLOY_SCRIPT_PATH = './deploy.sh';

   const server = http.createServer((req, res) => {
     if (req.method === 'POST' && req.url === '/webhook') {
       let body = '';

       req.on('data', chunk => {
         body += chunk.toString();
       });

       req.on('end', () => {
         // 验证签名
         const signature = req.headers['x-gitee-token'];
         const hmac = crypto.createHmac('sha256', SECRET).update(body).digest('hex');

         if (signature === hmac) {
           // 执行部署脚本
           exec(`bash ${DEPLOY_SCRIPT_PATH}`, (error, stdout, stderr) => {
             if (error) {
               console.error(`部署错误: ${error.message}`);
               res.statusCode = 500;
               res.end('部署失败');
               return;
             }

             console.log(`部署输出: ${stdout}`);
             if (stderr) {
               console.error(`部署错误输出: ${stderr}`);
             }

             res.statusCode = 200;
             res.end('部署成功');
           });
         } else {
           res.statusCode = 401;
           res.end('签名验证失败');
         }
       });
     } else {
       res.statusCode = 404;
       res.end('Not Found');
     }
   });

   server.listen(PORT, () => {
     console.log(`Webhook服务器运行在 http://localhost:${PORT}`);
   });
   ```

2. **使用PM2启动Webhook服务**

   ```bash
   pm2 start webhook.js --name webhook-server
   ```

3. **在Gitee上配置Webhook**

   - 进入仓库 > 管理 > WebHooks
   - 点击"添加WebHook"
   - 填写URL：`http://your-server-ip:3001/webhook`
   - 选择触发事件：Push
   - 设置Secret：与webhook.js中的SECRET一致
   - 点击"添加"

## 7. 常见问题排查方案

### 7.1 应用无法启动

**问题**：PM2显示应用状态为errored

**排查步骤**：
1. 查看应用日志：`pm2 logs book-recommendation --lines 100`
2. 检查端口是否被占用：`lsof -i :3000`
3. 验证环境变量配置：`cat .env`
4. 手动启动应用测试：`node src/app.js`

### 7.2 数据库连接问题

**问题**：应用无法连接到数据库

**排查步骤**：
1. 检查数据库文件权限：`ls -la src/database/`
2. 验证数据库配置：`cat .env`
3. 检查数据库文件是否存在：`ls -la src/database/book_recommendation.db`

### 7.3 Webhook不触发

**问题**：推送代码后没有自动部署

**排查步骤**：
1. 检查Webhook服务状态：`pm2 status webhook-server`
2. 查看Webhook日志：`pm2 logs webhook-server --lines 100`
3. 验证Gitee Webhook配置是否正确
4. 检查服务器防火墙是否开放3001端口：`sudo ufw status`

### 7.4 依赖安装失败

**问题**：npm install 命令执行失败

**排查步骤**：
1. 检查网络连接：`ping gitee.com`
2. 清理npm缓存：`npm cache clean --force`
3. 更新npm版本：`npm install -g npm@latest`
4. 尝试使用yarn安装：`yarn install --production`

## 8. 成功验证方法

### 8.1 应用访问验证

1. **访问应用首页**
   ```
   http://your-server-ip:3000
   ```

2. **访问健康检查接口**
   ```
   http://your-server-ip:3000/health
   ```
   预期响应：
   ```json
   {
     "status": "success",
     "message": "API is running",
     "timestamp": "2023-12-01T10:30:00Z"
   }
   ```

3. **访问API文档**
   ```
   http://your-server-ip:3000/api-docs
   ```

### 8.2 PM2状态验证

```bash
pm2 status
```

预期输出：
```
┌─────┬──────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┐
│ id  │ name                     │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │
├─────┼──────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┤
│ 0   │ book-recommendation      │ default     │ 1.0.0   │ fork    │ 12345    │ 10h    │ 0    │ online    │ 0.1%     │
│ 1   │ webhook-server           │ default     │ N/A     │ fork    │ 12346    │ 10h    │ 0    │ online    │ 0.0%     │
└─────┴──────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┘
```

### 8.3 功能验证

1. **测试用户注册API**
   ```bash
   curl -X POST http://your-server-ip:3000/api/v1/users/register -H "Content-Type: application/json" -d '{"username":"test","password":"123456","email":"test@example.com"}'
   ```

2. **测试图书列表API**
   ```bash
   curl http://your-server-ip:3000/api/v1/books
   ```

## 9. 维护与更新

### 9.1 手动更新应用

```bash
cd book-recommendation-application
./deploy.sh
```

### 9.2 查看应用性能

```bash
# 查看PM2监控面板
pm2 monit

# 查看资源使用情况
pm2 show book-recommendation
```

### 9.3 数据库备份

```bash
# 备份SQLite数据库
cp src/database/book_recommendation.db src/database/book_recommendation_$(date +%Y%m%d_%H%M%S).db
```

## 10. 安全建议

1. **定期更新依赖**：`npm audit fix --production`
2. **使用HTTPS**：配置SSL证书（推荐使用Let's Encrypt）
3. **限制SSH访问**：修改默认端口，禁用root登录
4. **设置防火墙规则**：只开放必要的端口
5. **定期备份数据**：设置自动备份脚本
6. **使用环境变量**：不要在代码中硬编码敏感信息
7. **启用日志监控**：定期检查应用日志

## 11. 扩展建议

1. **使用Nginx作为反向代理**：提高性能和安全性
2. **配置负载均衡**：如果需要支持更多并发用户
3. **使用Redis缓存**：提高API响应速度
4. **迁移到MySQL**：如果数据量增大
5. **设置自动缩放**：根据流量自动调整服务器资源

---

本部署指南提供了将图书推荐应用从Gitee部署到阿里云服务器的完整流程。根据实际需求，您可能需要调整部分配置和步骤。