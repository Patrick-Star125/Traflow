# 后端文档

## 概述

后端基于Next.js API Routes实现，提供RESTful API接口，支持用户认证、交易记录管理、文件上传和AI点评功能。

## 技术栈

- **框架**: Next.js 14 API Routes
- **数据库**: SQLite + better-sqlite3
- **认证**: NextAuth.js
- **文件处理**: Multer + Sharp
- **AI服务**: Doubao-1.5-thinking-vision-pro
- **验证**: Zod
- **加密**: bcryptjs

## 目录结构

```
backend/
├── api/                # API路由
│   ├── auth/          # 认证相关API
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── logout.ts
│   ├── records/       # 交易记录API
│   │   ├── index.ts   # 获取记录列表
│   │   ├── [id].ts    # 单个记录操作
│   │   └── favorites.ts
│   ├── upload/        # 文件上传API
│   │   ├── image.ts
│   │   └── avatar.ts
│   ├── ai/           # AI相关API
│   │   └── review.ts
│   └── users/        # 用户管理API
│       ├── profile.ts
│       └── settings.ts
├── models/            # 数据模型
│   ├── User.ts
│   ├── TradingRecord.ts
│   ├── TradingNote.ts
│   └── AIReview.ts
├── services/          # 业务逻辑服务
│   ├── authService.ts
│   ├── recordService.ts
│   ├── uploadService.ts
│   └── aiService.ts
├── utils/            # 工具函数
│   ├── database.ts
│   ├── validation.ts
│   ├── encryption.ts
│   └── fileHandler.ts
└── middleware/       # 中间件
    ├── auth.ts
    ├── upload.ts
    └── errorHandler.ts
```

## 数据库设计

### 核心表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);
```

#### 交易记录表 (trading_records)
```sql
CREATE TABLE trading_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    review_date DATE NOT NULL,
    coin_symbol VARCHAR(20) NOT NULL,
    chart_image_url VARCHAR(255),
    profit_loss_ratio DECIMAL(10,4),
    thinking TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 关系设计
- 用户 1:N 交易记录
- 交易记录 1:N 备注
- 用户 M:N 收藏记录
- 交易记录 1:1 AI点评

## API接口设计

### 认证接口

#### POST /api/auth/register
注册新用户
```typescript
Request: {
  username: string;
  email: string;
  password: string;
}

Response: {
  success: boolean;
  user?: User;
  message: string;
}
```

#### POST /api/auth/login
用户登录
```typescript
Request: {
  email: string;
  password: string;
}

Response: {
  success: boolean;
  token?: string;
  user?: User;
  message: string;
}
```

### 交易记录接口

#### GET /api/records
获取交易记录列表
```typescript
Query: {
  page?: number;
  limit?: number;
  sort?: 'latest' | 'popular' | 'my' | 'favorites';
  coin?: string;
  userId?: number;
}

Response: {
  success: boolean;
  data: {
    records: TradingRecord[];
    total: number;
    page: number;
    limit: number;
  };
}
```

#### POST /api/records
创建交易记录
```typescript
Request: {
  reviewDate: string;
  coinSymbol: string;
  chartImageUrl?: string;
  profitLossRatio?: number;
  thinking?: string;
  notes?: TradingNote[];
}

Response: {
  success: boolean;
  data?: TradingRecord;
  message: string;
}
```

#### PUT /api/records/[id]
更新交易记录
```typescript
Request: {
  reviewDate?: string;
  coinSymbol?: string;
  chartImageUrl?: string;
  profitLossRatio?: number;
  thinking?: string;
  notes?: TradingNote[];
}

Response: {
  success: boolean;
  data?: TradingRecord;
  message: string;
}
```

#### DELETE /api/records/[id]
删除交易记录
```typescript
Response: {
  success: boolean;
  message: string;
}
```

### 收藏接口

#### POST /api/records/favorites
添加/取消收藏
```typescript
Request: {
  recordId: number;
  action: 'add' | 'remove';
}

Response: {
  success: boolean;
  message: string;
}
```

### 文件上传接口

#### POST /api/upload/image
上传图片
```typescript
Request: FormData {
  file: File;
  type: 'chart' | 'note' | 'avatar';
}

Response: {
  success: boolean;
  data?: {
    url: string;
    filename: string;
  };
  message: string;
}
```

### AI点评接口

#### POST /api/ai/review
生成AI点评
```typescript
Request: {
  recordId: number;
}

Response: {
  success: boolean;
  data?: {
    reviewContent: string;
    modelName: string;
  };
  message: string;
}
```

## 业务逻辑服务

### 认证服务 (authService)
```typescript
class AuthService {
  async register(userData: RegisterData): Promise<User>;
  async login(credentials: LoginData): Promise<AuthResult>;
  async validateToken(token: string): Promise<User | null>;
  async refreshToken(token: string): Promise<string>;
}
```

### 记录服务 (recordService)
```typescript
class RecordService {
  async getRecords(filters: RecordFilters): Promise<RecordList>;
  async getRecordById(id: number, userId?: number): Promise<TradingRecord>;
  async createRecord(data: CreateRecordData): Promise<TradingRecord>;
  async updateRecord(id: number, data: UpdateRecordData): Promise<TradingRecord>;
  async deleteRecord(id: number, userId: number): Promise<void>;
  async toggleFavorite(recordId: number, userId: number): Promise<void>;
}
```

### AI服务 (aiService)
```typescript
class AIService {
  async generateReview(record: TradingRecord): Promise<string>;
  async analyzeImage(imageUrl: string): Promise<string>;
  async batchReviewTopRecords(): Promise<void>;
}
```

## 数据验证

### Zod Schema定义
```typescript
// 用户注册验证
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

// 交易记录验证
export const recordSchema = z.object({
  reviewDate: z.string().datetime(),
  coinSymbol: z.string().min(1).max(20),
  profitLossRatio: z.number().optional(),
  thinking: z.string().optional(),
});
```

## 错误处理

### 错误类型定义
```typescript
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface APIError {
  code: ErrorCode;
  message: string;
  details?: any;
}
```

### 统一错误处理中间件
```typescript
export const errorHandler = (error: Error, req: NextRequest) => {
  console.error('API Error:', error);
  
  if (error instanceof ValidationError) {
    return NextResponse.json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: error.message,
        details: error.details,
      }
    }, { status: 400 });
  }
  
  // 其他错误处理...
};
```

## 安全措施

### 1. 认证授权
- JWT Token认证
- 密码加密存储
- 会话管理
- 权限控制

### 2. 数据验证
- 输入参数验证
- SQL注入防护
- XSS防护
- CSRF防护

### 3. 文件上传安全
- 文件类型验证
- 文件大小限制
- 文件名安全处理
- 病毒扫描

### 4. API限流
- 请求频率限制
- IP白名单
- 用户级别限制

## 性能优化

### 1. 数据库优化
- 索引优化
- 查询优化
- 连接池管理
- 缓存策略

### 2. 文件处理优化
- 图片压缩
- 异步处理
- CDN集成
- 缓存策略

### 3. API性能
- 响应缓存
- 数据分页
- 懒加载
- 批量操作

## 监控日志

### 1. 日志记录
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### 2. 性能监控
- API响应时间
- 数据库查询时间
- 错误率统计
- 用户行为分析

## 部署配置

### 1. 环境变量
```bash
# 数据库配置
DATABASE_URL=./database/traflow.db

# AI服务配置
DOUBAO_API_KEY=your-api-key
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3

# 文件上传配置
UPLOAD_DIR=./img
MAX_FILE_SIZE=10485760

# 安全配置
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12
```

### 2. PM2配置
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'traflow-backend',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

## 测试策略

### 1. 单元测试
- 服务层测试
- 工具函数测试
- 数据模型测试

### 2. 集成测试
- API接口测试
- 数据库操作测试
- 第三方服务测试

### 3. 性能测试
- 负载测试
- 压力测试
- 并发测试

## 常见问题

### 1. 数据库连接问题
- 检查数据库文件权限
- 验证连接字符串
- 确认SQLite版本

### 2. 文件上传失败
- 检查目录权限
- 验证文件大小
- 确认磁盘空间

### 3. AI服务调用失败
- 检查API密钥
- 验证网络连接
- 确认服务配额

## 更新日志

### v1.0.0
- 初始版本
- 基础API实现
- 用户认证系统
- 文件上传功能
- AI点评集成