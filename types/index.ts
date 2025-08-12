// 用户相关类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
  message: string;
}

// 交易记录相关类型定义
export interface TradingRecord {
  id: number;
  userId: number;
  reviewDate: string;
  coinSymbol: string;
  chartImageUrl?: string;
  profitLossRatio?: number;
  thinking?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  // 关联数据
  username?: string;
  userAvatar?: string;
  favoriteCount?: number;
  hasAiReview?: boolean;
  isFavorited?: boolean;
  notes?: TradingNote[];
  aiReview?: AIReview;
}

export interface TradingNote {
  id: number;
  recordId: number;
  noteOrder: number;
  noteType: 'text' | 'image';
  content?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CreateRecordData {
  reviewDate: string;
  coinSymbol: string;
  chartImageUrl?: string;
  profitLossRatio?: number;
  thinking?: string;
  notes?: Omit<TradingNote, 'id' | 'recordId' | 'createdAt'>[];
}

export interface UpdateRecordData extends Partial<CreateRecordData> {}

// AI点评相关类型定义
export interface AIReview {
  id: number;
  recordId: number;
  reviewContent: string;
  modelName: string;
  createdAt: string;
  updatedAt: string;
}

// 收藏相关类型定义
export interface Favorite {
  id: number;
  userId: number;
  recordId: number;
  createdAt: string;
}

// API响应类型定义
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// 查询过滤器类型定义
export interface RecordFilters {
  page?: number;
  limit?: number;
  sort?: 'latest' | 'popular' | 'my' | 'favorites';
  coin?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  hasAiReview?: boolean;
}

// 文件上传相关类型定义
export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface ImageUploadOptions {
  type: 'chart' | 'note' | 'avatar';
  maxSize?: number;
  allowedTypes?: string[];
}

// 主题相关类型定义
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  systemTheme?: 'light' | 'dark';
}

// 表格相关类型定义
export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

// 表单相关类型定义
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'file' | 'image';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: any;
}

// 错误类型定义
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
}

export interface APIError {
  code: ErrorCode;
  message: string;
  details?: any;
}

// 统计数据类型定义
export interface DashboardStats {
  totalRecords: number;
  totalUsers: number;
  totalFavorites: number;
  aiReviewsCount: number;
  popularCoins: Array<{
    symbol: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: 'record' | 'favorite' | 'review';
    user: string;
    action: string;
    timestamp: string;
  }>;
}

// 配置类型定义
export interface AppConfig {
  maxFileSize: number;
  allowedImageTypes: string[];
  maxNotesPerRecord: number;
  paginationSizes: number[];
  aiReviewThreshold: number;
  cacheTimeout: number;
}

// 会话类型定义
export interface UserSession {
  id: number;
  userId: number;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
}

// 通知类型定义
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 搜索相关类型定义
export interface SearchFilters {
  query?: string;
  coin?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  profitRange?: {
    min: number;
    max: number;
  };
  hasImages?: boolean;
  hasAiReview?: boolean;
  userId?: number;
}

export interface SearchResult {
  records: TradingRecord[];
  total: number;
  facets: {
    coins: Array<{ symbol: string; count: number }>;
    users: Array<{ username: string; count: number }>;
    dateRanges: Array<{ range: string; count: number }>;
  };
}