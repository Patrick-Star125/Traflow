import { z } from 'zod'

// 用户相关验证
export const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(50, '用户名最多50个字符')
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文'),
  email: z.string()
    .email('请输入有效的邮箱地址')
    .max(100, '邮箱地址过长'),
  password: z.string()
    .min(6, '密码至少6个字符')
    .max(100, '密码最多100个字符')
})

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码')
})

// 交易记录相关验证
export const createRecordSchema = z.object({
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
  coinSymbol: z.string()
    .min(1, '币种不能为空')
    .max(20, '币种名称过长')
    .regex(/^[A-Z0-9]+$/, '币种只能包含大写字母和数字'),
  chartImageUrl: z.string().url('图片URL格式错误').optional(),
  profitLossRatio: z.number()
    .min(-100, '盈亏比不能小于-100%')
    .max(1000, '盈亏比不能大于1000%')
    .optional(),
  thinking: z.string().max(2000, '思考内容过长').optional(),
  notes: z.array(z.object({
    noteOrder: z.number().min(1).max(10),
    noteType: z.enum(['text', 'image']),
    content: z.string().max(1000).optional(),
    imageUrl: z.string().url().optional()
  })).max(10, '备注数量不能超过10个').optional()
})

export const updateRecordSchema = createRecordSchema.partial()

// 查询参数验证
export const recordFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['latest', 'popular', 'my', 'favorites']).default('latest'),
  coin: z.string().max(20).optional(),
  userId: z.coerce.number().positive().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hasAiReview: z.coerce.boolean().optional()
})

// 文件上传验证
export const uploadSchema = z.object({
  type: z.enum(['chart', 'note', 'avatar']),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp'])
})

// AI点评验证
export const aiReviewSchema = z.object({
  recordId: z.number().positive('记录ID必须为正整数')
})

// 收藏操作验证
export const favoriteSchema = z.object({
  recordId: z.number().positive('记录ID必须为正整数'),
  action: z.enum(['add', 'remove'])
})

// 用户设置验证
export const userSettingsSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(6).max(100).optional()
}).refine(
  (data) => {
    // 如果要修改密码，必须提供当前密码
    if (data.newPassword && !data.currentPassword) {
      return false
    }
    return true
  },
  {
    message: '修改密码时必须提供当前密码',
    path: ['currentPassword']
  }
)

// 通用ID验证
export const idSchema = z.object({
  id: z.coerce.number().positive('ID必须为正整数')
})

// 分页响应验证
export const paginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number().min(0),
  totalPages: z.number().min(0)
})