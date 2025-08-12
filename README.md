# AI交易复盘账本

一个社区型的交易复盘账本系统，支持用户协作创建和分享交易复盘记录，并提供AI智能点评功能。

## 项目概述

本项目是一个基于Next.js的全栈Web应用，旨在为交易者提供一个共享的复盘记录平台。用户可以记录自己的交易复盘，查看他人的复盘记录，并获得AI智能点评。

## 主要功能

### 用户功能
- 用户登录/登出系统
- 明暗模式切换
- 个人交易记录管理（添加、编辑、删除）
- 查看所有用户的交易复盘记录
- 收藏/取消收藏交易记录
- 多维度筛选和排序（最近、最热门、我发布的、已收藏）

### 交易记录功能
- 复盘日期记录
- 币种信息
- K线/指标截图上传
- 盈亏比计算
- 思考记录
- 多个备注字段（最多10个，支持文本和图片）
- 图片粘贴功能（Ctrl+V）

### AI功能
- 热门前100复盘记录AI点评
- 基于Doubao-1.5-thinking-vision-pro模型
- 支持图片分析的深度点评

### 界面功能
- Notion风格的现代化设计
- 响应式表格展示
- 可调整显示行数（10/20/50）
- 弹窗式编辑/查看界面
- Markdown风格的单元格渲染

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (结构化数据)
- **文件存储**: 本地文件系统 (img目录)
- **AI服务**: Doubao-1.5-thinking-vision-pro
- **认证**: NextAuth.js
- **UI组件**: Radix UI, Lucide Icons

## 项目结构

```
traflow/
├── README.md                 # 项目总体介绍
├── package.json             # 项目依赖
├── next.config.js           # Next.js配置
├── tailwind.config.js       # Tailwind配置
├── frontend/                # 前端代码
│   ├── README.md           # 前端文档
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义Hooks
│   ├── utils/             # 工具函数
│   └── styles/            # 样式文件
├── backend/                # 后端代码
│   ├── README.md          # 后端文档
│   ├── api/               # API路由
│   ├── models/            # 数据模型
│   ├── services/          # 业务逻辑
│   └── utils/             # 工具函数
├── database/              # 数据库相关
│   ├── schema.sql         # 数据库结构
│   └── migrations/        # 数据库迁移
├── img/                   # 图片存储目录
└── docs/                  # 项目文档
    ├── deployment.md      # 部署指南
    ├── api.md            # API文档
    └── development.md     # 开发指南
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- SQLite 3

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd traflow
```

2. 安装依赖
```bash
npm install
```

3. 初始化数据库
```bash
npm run db:init
```

4. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，配置必要的环境变量
```

5. 启动开发服务器
```bash
npm run dev
```

6. 访问应用
打开浏览器访问 `http://localhost:3000`

## 部署指南

### 阿里云Ubuntu服务器部署

1. 服务器要求
   - 2核4G Ubuntu服务器
   - 公网IP
   - Node.js 18+ 环境

2. 部署步骤
```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装PM2
sudo npm install -g pm2

# 4. 克隆项目
git clone <repository-url>
cd traflow

# 5. 安装依赖
npm install

# 6. 构建项目
npm run build

# 7. 启动服务
pm2 start ecosystem.config.js

# 8. 配置Nginx反向代理
sudo apt install nginx
# 配置Nginx配置文件
```

详细部署指南请参考 [docs/deployment.md](./docs/deployment.md)

## 开发指南

### 前端开发
详细的前端开发指南请参考 [frontend/README.md](./frontend/README.md)

### 后端开发
详细的后端开发指南请参考 [backend/README.md](./backend/README.md)

### API文档
API接口文档请参考 [docs/api.md](./docs/api.md)

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至 [your-email@example.com]

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础功能实现
- AI点评功能集成