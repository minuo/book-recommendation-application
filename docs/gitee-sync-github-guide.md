# Gitee从GitHub拉取代码指南

本文档介绍了如何在Gitee上创建仓库并从GitHub拉取代码的详细步骤。

## 1. 在Gitee上创建新仓库

### 1.1 登录Gitee账号

1. 访问[Gitee官网](https://gitee.com/)并登录您的账号

### 1.2 创建新仓库

1. 点击右上角的"+"按钮，选择"新建仓库"
2. 填写仓库基本信息：
   - 仓库名称：建议与GitHub仓库名称保持一致，如`book-recommendation-application`
   - 路径：自动生成，可根据需要修改
   - 仓库介绍：可与GitHub仓库介绍保持一致
   - 可见性：根据需要选择公开或私有
3. 点击"创建仓库"

## 2. 配置Gitee仓库从GitHub拉取代码

### 2.1 方法一：使用Gitee的"导入仓库"功能（推荐）

Gitee提供了直接从GitHub导入仓库的功能，操作简单快捷。

1. 在Gitee首页点击右上角的"+"按钮，选择"导入仓库"
2. 在"导入仓库"页面：
   - 选择"从GitHub导入"
   - 输入GitHub仓库URL：`https://github.com/minuo/book-recommendation-application.git`
   - 点击"导入"
3. Gitee会自动导入GitHub仓库的代码、分支、提交历史等

### 2.2 方法二：手动配置远程仓库

如果导入功能不可用或出现问题，可以使用手动方法配置。

#### 2.2.1 配置本地项目的远程仓库

1. 确保您已经克隆了GitHub仓库到本地
   ```bash
   git clone https://github.com/minuo/book-recommendation-application.git
   cd book-recommendation-application
   ```

2. 添加Gitee作为第二个远程仓库
   ```bash
   git remote add gitee git@gitee.com:your-username/book-recommendation-application.git
   ```

3. 验证远程仓库配置
   ```bash
   git remote -v
   ```
   预期输出：
   ```
   origin  https://github.com/minuo/book-recommendation-application.git (fetch)
   origin  https://github.com/minuo/book-recommendation-application.git (push)
   gitee   git@gitee.com:your-username/book-recommendation-application.git (fetch)
   gitee   git@gitee.com:your-username/book-recommendation-application.git (push)
   ```

#### 2.2.2 从GitHub拉取最新代码并推送到Gitee

1. 确保本地仓库是最新的
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```

2. 将代码推送到Gitee
   ```bash
   git push -u gitee main
   ```

3. 如果有其他分支需要同步，也可以推送
   ```bash
   git checkout other-branch
   git pull origin other-branch
   git push -u gitee other-branch
   ```

## 3. 配置自动同步（可选）

如果需要Gitee仓库自动与GitHub仓库保持同步，可以使用以下方法：

### 3.1 使用Gitee的WebHook功能

1. 在GitHub仓库中配置WebHook：
   - 进入GitHub仓库 > Settings > Webhooks
   - 点击"Add webhook"
   - 填写Payload URL：`https://gitee.com/api/v5/repos/your-username/book-recommendation-application/mirror/pull?access_token=your-gitee-token`
   - 选择Content type为"application/json"
   - 选择触发事件：Push
   - 点击"Add webhook"

2. 在Gitee仓库中获取AccessToken：
   - 进入Gitee > 设置 > 私人令牌
   - 生成一个新的访问令牌，勾选必要的权限

### 3.2 使用GitHub Actions实现自动同步

1. 在GitHub仓库中创建`.github/workflows/sync-gitee.yml`文件：

```yaml
name: Sync to Gitee

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0
    
    - name: Sync to Gitee
      uses: wearerequired/git-mirror-action@master
      env:
        # 注意在 GitHub Secrets 中配置 GITEE_RSA_PRIVATE_KEY
        SSH_PRIVATE_KEY: ${{ secrets.GITEE_RSA_PRIVATE_KEY }}
      with:
        # 注意替换为你的 GitHub 仓库地址
        source-repo: git@github.com:minuo/book-recommendation-application.git
        # 注意替换为你的 Gitee 仓库地址
        destination-repo: git@gitee.com:your-username/book-recommendation-application.git
```

2. 在GitHub仓库的Settings > Secrets中添加以下密钥：
   - GITEE_RSA_PRIVATE_KEY：Gitee的SSH私钥

## 4. 常见问题与解决方案

### 4.1 SSH连接问题

如果使用SSH方式连接Gitee时出现权限问题，请确保：
1. 已经将本地SSH公钥添加到Gitee账户
2. SSH密钥对的权限设置正确（私钥权限应为600）

### 4.2 同步冲突

如果在同步过程中出现冲突，可以：
1. 先从GitHub拉取最新代码
2. 解决本地冲突
3. 再推送到Gitee

### 4.3 大型仓库导入失败

如果仓库较大导致导入失败，可以：
1. 使用git clone --depth=1命令创建浅克隆
2. 逐步推送代码到Gitee

## 5. 总结

通过以上步骤，您可以成功地在Gitee上从GitHub拉取代码，并根据需要配置自动同步。以下是主要方法的比较：

| 方法 | 优点 | 缺点 |
|------|------|------|
| Gitee导入功能 | 操作简单，自动同步所有内容 | 可能受网络影响 |
| 手动配置远程仓库 | 灵活，可控制同步内容 | 操作步骤较多 |
| WebHook自动同步 | 实时同步，无需手动操作 | 需要配置API令牌 |
| GitHub Actions | 自动化程度高，可自定义流程 | 需要配置密钥和工作流 |

根据您的需求选择合适的方法即可。