const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 创建数据库目录
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 创建图片存储目录
const imgDir = path.join(__dirname, '..', 'img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

// 创建子目录
const subDirs = ['avatars', 'charts', 'notes'];
subDirs.forEach(dir => {
    const fullPath = path.join(imgDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// 初始化数据库
const dbPath = path.join(dbDir, 'traflow.db');
const db = new Database(dbPath);

// 读取并执行SQL schema
const schemaPath = path.join(dbDir, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// 分割SQL语句并执行
const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

try {
    db.exec('BEGIN TRANSACTION');
    
    statements.forEach(statement => {
        if (statement.trim()) {
            db.exec(statement);
        }
    });
    
    db.exec('COMMIT');
    console.log('✅ 数据库初始化成功！');
    console.log(`📍 数据库位置: ${dbPath}`);
    console.log(`📁 图片存储目录: ${imgDir}`);
    
} catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
} finally {
    db.close();
}