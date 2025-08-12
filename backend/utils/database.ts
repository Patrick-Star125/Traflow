import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'database', 'traflow.db')
    db = new Database(dbPath)
    
    // 启用外键约束
    db.pragma('foreign_keys = ON')
    
    // 设置WAL模式以提高并发性能
    db.pragma('journal_mode = WAL')
    
    console.log('Database connected:', dbPath)
  }
  
  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    console.log('Database connection closed')
  }
}

// 在进程退出时关闭数据库连接
process.on('exit', closeDatabase)
process.on('SIGINT', closeDatabase)
process.on('SIGTERM', closeDatabase)