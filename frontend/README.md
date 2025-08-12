# 前端文档

## 概述

前端采用Next.js 14 + React + TypeScript + Tailwind CSS技术栈，实现现代化的交易复盘记录界面。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Radix UI
- **图标**: Lucide React
- **状态管理**: React Hooks + Context API
- **表单处理**: React Hook Form + Zod
- **HTTP客户端**: Axios
- **认证**: NextAuth.js

## 目录结构

```
frontend/
├── components/          # React组件
│   ├── ui/             # 基础UI组件
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Table.tsx
│   │   └── ...
│   ├── layout/         # 布局组件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── trading/        # 交易相关组件
│   │   ├── RecordTable.tsx
│   │   ├── RecordForm.tsx
│   │   ├── RecordDetail.tsx
│   │   └── FilterBar.tsx
│   └── common/         # 通用组件
│       ├── ImageUpload.tsx
│       ├── MarkdownRenderer.tsx
│       └── ThemeToggle.tsx
├── pages/              # 页面组件
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── ProfilePage.tsx
├── hooks/              # 自定义Hooks
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useTradingRecords.ts
│   └── useImageUpload.ts
├── utils/              # 工具函数
│   ├── api.ts
│   ├── auth.ts
│   ├── format.ts
│   └── validation.ts
└── styles/             # 样式文件
    ├── globals.css
    └── components.css
```

## 设计原则

### 1. Notion风格设计
- 简洁现代的界面设计
- 卡片式布局
- 柔和的阴影和圆角
- 清晰的层次结构

### 2. 响应式设计
- 移动端优先
- 断点适配：sm(640px), md(768px), lg(1024px), xl(1280px)
- 灵活的网格系统

### 3. 可访问性
- 键盘导航支持
- 屏幕阅读器友好
- 高对比度模式
- 语义化HTML

## 核心功能组件

### 1. 交易记录表格 (RecordTable)
- 支持分页显示（10/20/50条）
- 可排序和筛选
- 响应式列显示
- 行内编辑功能

### 2. 记录表单 (RecordForm)
- 表单验证
- 图片上传（拖拽/粘贴）
- 实时预览
- 自动保存草稿

### 3. 图片上传 (ImageUpload)
- 支持Ctrl+V粘贴
- 拖拽上传
- 图片压缩
- 预览功能

### 4. 主题切换 (ThemeToggle)
- 明暗模式切换
- 系统主题跟随
- 平滑过渡动画

## 状态管理

### Context Providers
```typescript
// AuthContext - 用户认证状态
// ThemeContext - 主题状态
// TradingContext - 交易记录状态
```

### 自定义Hooks
```typescript
// useAuth - 认证相关操作
// useTradingRecords - 交易记录CRUD
// useImageUpload - 图片上传处理
// useLocalStorage - 本地存储
```

## API集成

### 接口规范
- RESTful API设计
- 统一错误处理
- 请求/响应拦截器
- 自动重试机制

### 数据流
```
Component -> Hook -> API Service -> Backend
```

## 样式规范

### CSS变量
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
```

### 组件样式
- 使用Tailwind CSS类名
- 组件级CSS模块
- CSS-in-JS（styled-components）

## 性能优化

### 1. 代码分割
- 路由级别分割
- 组件懒加载
- 动态导入

### 2. 图片优化
- Next.js Image组件
- WebP格式支持
- 响应式图片

### 3. 缓存策略
- SWR数据获取
- 本地存储缓存
- 服务端缓存

## 开发指南

### 1. 组件开发
```typescript
// 组件模板
import React from 'react';
import { cn } from '@/utils/cn';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {children}
    </div>
  );
};
```

### 2. Hook开发
```typescript
// Hook模板
import { useState, useEffect } from 'react';

export const useCustomHook = (initialValue: any) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // 副作用逻辑
  }, []);
  
  return { state, setState };
};
```

### 3. 类型定义
```typescript
// types/index.ts
export interface TradingRecord {
  id: number;
  userId: number;
  reviewDate: string;
  coinSymbol: string;
  chartImageUrl?: string;
  profitLossRatio?: number;
  thinking?: string;
  notes: TradingNote[];
  createdAt: string;
  updatedAt: string;
}
```

## 测试策略

### 1. 单元测试
- Jest + React Testing Library
- 组件测试
- Hook测试

### 2. 集成测试
- API集成测试
- 用户流程测试

### 3. E2E测试
- Playwright
- 关键用户路径

## 部署配置

### 1. 构建优化
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### 2. 环境变量
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/img
```

## 常见问题

### 1. 图片上传失败
- 检查文件大小限制
- 验证文件格式
- 确认上传权限

### 2. 主题切换异常
- 检查localStorage权限
- 验证CSS变量定义
- 确认系统主题API

### 3. 表格性能问题
- 启用虚拟滚动
- 优化渲染逻辑
- 减少重复渲染

## 开发工具

### 1. VS Code插件
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer

### 2. 浏览器工具
- React Developer Tools
- Redux DevTools
- Lighthouse

## 贡献指南

1. 遵循代码规范
2. 编写测试用例
3. 更新文档
4. 提交PR前自测

## 更新日志

### v1.0.0
- 初始版本
- 基础组件实现
- 主题系统
- 图片上传功能