# 开发指南

## 开发环境搭建

### 1. 环境要求

- Node.js 18+
- npm 或 yarn
- Git
- VS Code (推荐)

### 2. 项目克隆和安装

```bash
# 克隆项目
git clone <repository-url>
cd traflow

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env.local

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev
```

### 3. 环境变量配置

编辑 `.env.local` 文件：

```bash
# 数据库配置
DATABASE_URL="./database/traflow.db"

# NextAuth配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret"

# AI服务配置
DOUBAO_API_KEY="your-doubao-api-key"
DOUBAO_API_URL="https://ark.cn-beijing.volces.com/api/v3"

# JWT配置
JWT_SECRET="your-jwt-secret"
BCRYPT_ROUNDS=10
```

## 项目结构

```
traflow/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── frontend/              # 前端代码
│   ├── components/        # React组件
│   ├── hooks/            # 自定义Hooks
│   ├── utils/            # 工具函数
│   └── styles/           # 样式文件
├── backend/              # 后端代码
│   ├── api/              # API路由处理
│   ├── models/           # 数据模型
│   ├── services/         # 业务逻辑
│   ├── utils/            # 工具函数
│   └── middleware/       # 中间件
├── pages/api/            # Next.js API路由
├── database/             # 数据库相关
├── types/                # TypeScript类型定义
├── docs/                 # 项目文档
└── img/                  # 图片存储
```

## 开发规范

### 1. 代码风格

- 使用TypeScript
- 遵循ESLint规则
- 使用Prettier格式化
- 组件使用PascalCase命名
- 文件使用camelCase命名

### 2. Git提交规范

```bash
# 功能开发
git commit -m "feat: 添加用户登录功能"

# 问题修复
git commit -m "fix: 修复图片上传失败问题"

# 文档更新
git commit -m "docs: 更新API文档"

# 样式调整
git commit -m "style: 调整按钮样式"

# 重构代码
git commit -m "refactor: 重构用户认证逻辑"
```

### 3. 分支管理

- `main`: 主分支，用于生产环境
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支

## 开发流程

### 1. 功能开发流程

```bash
# 1. 从develop分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 2. 开发功能
# ... 编写代码 ...

# 3. 提交代码
git add .
git commit -m "feat: 实现用户认证功能"

# 4. 推送分支
git push origin feature/user-authentication

# 5. 创建Pull Request
# 在GitHub/GitLab上创建PR，请求合并到develop分支
```

### 2. 本地开发

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 构建项目
npm run build
```

## 组件开发

### 1. 组件结构

```typescript
// frontend/components/example/ExampleComponent.tsx
import React from 'react'
import { cn } from '@/frontend/utils/cn'

interface ExampleComponentProps {
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function ExampleComponent({
  title,
  description,
  className,
  children
}: ExampleComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}
```

### 2. Hook开发

```typescript
// frontend/hooks/useExample.ts
import { useState, useEffect } from 'react'

export function useExample(initialValue: string) {
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 副作用逻辑
  }, [value])

  const updateValue = (newValue: string) => {
    setLoading(true)
    setValue(newValue)
    setLoading(false)
  }

  return {
    value,
    loading,
    updateValue
  }
}
```

## API开发

### 1. API路由结构

```typescript
// pages/api/example.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/backend/middleware/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      return await handleGet(req, res)
    } else if (req.method === 'POST') {
      return await handlePost(req, res)
    } else {
      return res.status(405).json({
        success: false,
        message: '方法不允许'
      })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // GET请求处理逻辑
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // 验证用户身份
  const user = await verifyToken(req)
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    })
  }

  // POST请求处理逻辑
}
```

### 2. 数据验证

```typescript
// backend/utils/validation.ts
import { z } from 'zod'

export const exampleSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  email: z.string().email('邮箱格式错误'),
  age: z.number().min(0, '年龄不能为负数')
})

// 在API中使用
const validatedData = exampleSchema.parse(req.body)
```

## 数据库操作

### 1. 查询示例

```typescript
// backend/services/exampleService.ts
import { getDatabase } from '@/backend/utils/database'

export class ExampleService {
  static async getAll() {
    const db = getDatabase()
    return db.prepare('SELECT * FROM examples').all()
  }

  static async getById(id: number) {
    const db = getDatabase()
    return db.prepare('SELECT * FROM examples WHERE id = ?').get(id)
  }

  static async create(data: any) {
    const db = getDatabase()
    const result = db.prepare(`
      INSERT INTO examples (name, description)
      VALUES (?, ?)
    `).run(data.name, data.description)
    
    return result.lastInsertRowid
  }

  static async update(id: number, data: any) {
    const db = getDatabase()
    return db.prepare(`
      UPDATE examples 
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(data.name, data.description, id)
  }

  static async delete(id: number) {
    const db = getDatabase()
    return db.prepare('DELETE FROM examples WHERE id = ?').run(id)
  }
}
```

### 2. 事务处理

```typescript
const db = getDatabase()
const transaction = db.transaction(() => {
  // 多个数据库操作
  const result1 = db.prepare('INSERT INTO table1 ...').run(...)
  const result2 = db.prepare('INSERT INTO table2 ...').run(...)
  return { result1, result2 }
})

const results = transaction()
```

## 测试

### 1. 单元测试

```typescript
// __tests__/components/ExampleComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { ExampleComponent } from '@/frontend/components/ExampleComponent'

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
```

### 2. API测试

```typescript
// __tests__/api/example.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/example'

describe('/api/example', () => {
  it('handles GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
  })
})
```

## 调试

### 1. 前端调试

- 使用浏览器开发者工具
- React Developer Tools
- 使用console.log和debugger
- VS Code断点调试

### 2. 后端调试

```typescript
// 添加调试日志
console.log('Debug info:', { variable, data })

// 使用VS Code调试
// 在.vscode/launch.json中配置调试选项
```

### 3. 数据库调试

```bash
# 使用SQLite命令行工具
sqlite3 database/traflow.db

# 查看表结构
.schema

# 执行查询
SELECT * FROM users;
```

## 性能优化

### 1. 前端优化

- 使用React.memo优化组件渲染
- 使用useMemo和useCallback缓存计算结果
- 图片懒加载
- 代码分割

### 2. 后端优化

- 数据库查询优化
- 添加适当的索引
- 使用连接池
- 缓存频繁查询的数据

### 3. 构建优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

## 常见问题

### 1. 依赖安装问题

```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### 2. 数据库连接问题

- 检查数据库文件路径
- 确认文件权限
- 验证数据库初始化

### 3. 类型错误

- 检查TypeScript配置
- 更新类型定义
- 使用类型断言（谨慎使用）

## 工具推荐

### 1. VS Code插件

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- GitLens
- Prettier
- ESLint

### 2. 浏览器工具

- React Developer Tools
- Redux DevTools
- Lighthouse
- Network面板

### 3. 命令行工具

```bash
# 代码格式化
npx prettier --write .

# 类型检查
npx tsc --noEmit

# 依赖分析
npx depcheck
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 编写代码和测试
4. 提交Pull Request
5. 代码审查
6. 合并到主分支

遵循以上开发指南，可以确保代码质量和项目的可维护性。