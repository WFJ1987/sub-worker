
# Subscription Management System

这是一个简单的订阅管理系统，部署在Cloudflare Workers上。它允许用户管理和查看订阅信息。

## 演示

您可以在这里查看演示: [https://subtest.oneworking.workers.dev](https://subtest.oneworking.workers.dev)

## 功能

- 主页 (`/`): 显示欢迎信息
- 订阅页面 (`/123`): 显示特定订阅的信息
- 管理页面 (`/123/manage`): 允许管理订阅信息

## 截图

### 主页
![image](https://github.com/user-attachments/assets/f8852b6a-fa72-4d7e-811f-25d60145800d)

### 订阅页面
![image](https://github.com/user-attachments/assets/d9fbc275-0db3-4502-8837-d403c2ed848d)

### 管理页面
![image](https://github.com/user-attachments/assets/e8dae338-c7ab-4dbf-bb79-2eda7a419f7f)

## 部署教程

1. 在Cloudflare Workers中创建一个新的Worker。

2. 在Cloudflare Workers中添加一个KV命名空间并绑定到您的Worker。
   - 在Workers界面中，选择您的Worker
   - 点击"设置"标签
   - 滚动到"变量"部分
   - 在"KV命名空间绑定"下，点击"添加绑定"
   - 选择您创建的KV命名空间，并为绑定命名（例如：SUBSCRIPTIONS）

3. 复制 `_worker.js` 文件的内容到您的Worker。

4. 修改代码开头的以下内容：
   ```javascript
   const MY_TOKEN = '123';  // 将'123'替换为您想要的密码
   const KV_NAMESPACE = KV; // 确保 KV 是您在 Cloudflare Workers 设置中绑定的变量名
