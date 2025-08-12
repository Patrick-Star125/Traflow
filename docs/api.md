# API文档

## 概述

Traflow API 提供完整的交易复盘记录管理功能，包括用户认证、记录管理、文件上传和AI点评等功能。

## 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

## 认证接口

### 用户注册

**POST** `/auth/register`

注册新用户账户。

**请求体**:
```json
{
  "username": "string (3-50字符)",
  "email": "string (有效邮箱)",
  "password": "string (6-100字符)"
}
```

**响应**:
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "avatarUrl": null,
    "isActive": true
  },
  "message": "注册成功"
}
```

### 用户登录

**POST** `/auth/login`

用户登录获取访问令牌。

**请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "avatarUrl": "https://example.com/avatar.jpg",
    "isActive": true
  },
  "message": "登录成功"
}
```

## 交易记录接口

### 获取记录列表

**GET** `/records`

获取交易复盘记录列表，支持分页和筛选。

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `sort`: 排序方式 (`latest`, `popular`, `my`, `favorites`)
- `coin`: 币种筛选 (可选)
- `userId`: 用户ID筛选 (可选)

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 1,
        "reviewDate": "2024-01-15",
        "coinSymbol": "BTC",
        "chartImageUrl": "https://example.com/chart.jpg",
        "profitLossRatio": 15.5,
        "thinking": "这次交易的思考总结...",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "username": "testuser",
        "favoriteCount": 5,
        "hasAiReview": true,
        "notes": []
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "message": "获取成功"
}
```

### 创建交易记录

**POST** `/records`

创建新的交易复盘记录。

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "reviewDate": "2024-01-15",
  "coinSymbol": "BTC",
  "chartImageUrl": "https://example.com/chart.jpg",
  "profitLossRatio": 15.5,
  "thinking": "这次交易的思考总结...",
  "notes": [
    {
      "noteOrder": 1,
      "noteType": "text",
      "content": "备注内容"
    }
  ]
}
```

## 文件上传接口

### 上传图片

**POST** `/upload/image`

上传图片文件（头像、K线图、备注图片）。

**请求头**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体** (FormData):
- `file`: 图片文件
- `type`: 图片类型 (`avatar`, `chart`, `note`)

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "/img/charts/20240115_chart_abc123.jpg",
    "filename": "20240115_chart_abc123.jpg"
  },
  "message": "上传成功"
}
```

## AI点评接口

### 生成AI点评

**POST** `/ai/review`

为指定的交易记录生成AI点评。

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "recordId": 1
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "reviewContent": "根据您提供的交易记录和K线图分析...",
    "modelName": "Doubao-1.5-thinking-vision-pro"
  },
  "message": "AI点评生成成功"
}
```

## 错误处理

### 标准错误响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "error": {
    "code": "ERROR_CODE",
    "message": "详细错误信息"
  }
}
```

### 常见错误代码

- `VALIDATION_ERROR`: 请求数据验证失败
- `AUTHENTICATION_ERROR`: 认证失败
- `AUTHORIZATION_ERROR`: 权限不足
- `NOT_FOUND`: 资源不存在
- `INTERNAL_ERROR`: 服务器内部错误

### HTTP状态码

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误