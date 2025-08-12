-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- 交易复盘记录表
CREATE TABLE IF NOT EXISTS trading_records (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 备注表（支持最多10个备注，可以是文本或图片）
CREATE TABLE IF NOT EXISTS trading_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL,
    note_order INTEGER NOT NULL CHECK (note_order >= 1 AND note_order <= 10),
    note_type VARCHAR(10) NOT NULL CHECK (note_type IN ('text', 'image')),
    content TEXT,
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES trading_records(id) ON DELETE CASCADE,
    UNIQUE(record_id, note_order)
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    record_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES trading_records(id) ON DELETE CASCADE,
    UNIQUE(user_id, record_id)
);

-- AI点评表
CREATE TABLE IF NOT EXISTS ai_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL,
    review_content TEXT NOT NULL,
    model_name VARCHAR(100) DEFAULT 'Doubao-1.5-thinking-vision-pro',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES trading_records(id) ON DELETE CASCADE
);

-- 用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_trading_records_user_id ON trading_records(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_records_review_date ON trading_records(review_date);
CREATE INDEX IF NOT EXISTS idx_trading_records_coin_symbol ON trading_records(coin_symbol);
CREATE INDEX IF NOT EXISTS idx_trading_notes_record_id ON trading_notes(record_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_record_id ON favorites(record_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_record_id ON ai_reviews(record_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- 创建视图：带收藏数的交易记录
CREATE VIEW IF NOT EXISTS trading_records_with_stats AS
SELECT 
    tr.*,
    u.username,
    u.avatar_url as user_avatar,
    COUNT(f.id) as favorite_count,
    CASE WHEN ai.id IS NOT NULL THEN 1 ELSE 0 END as has_ai_review
FROM trading_records tr
LEFT JOIN users u ON tr.user_id = u.id
LEFT JOIN favorites f ON tr.id = f.record_id
LEFT JOIN ai_reviews ai ON tr.id = ai.record_id
WHERE tr.is_deleted = 0 AND u.is_active = 1
GROUP BY tr.id, u.username, u.avatar_url, ai.id;