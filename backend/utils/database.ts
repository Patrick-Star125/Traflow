import sqlite3 from 'sqlite3'
import path from 'path'

let db: sqlite3.Database | null = null

export function getDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }
    
    const dbPath = path.join(process.cwd(), 'database', 'traflow.db')
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err)
        reject(err)
        return
      }
      
      // 启用外键约束
      db!.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Failed to enable foreign keys:', err)
          reject(err)
          return
        }
        
        // 设置WAL模式以提高并发性能
        db!.run('PRAGMA journal_mode = WAL', (err) => {
          if (err) {
            console.error('Failed to set WAL mode:', err)
            reject(err)
            return
          }
          
          console.log('Database connected:', dbPath)
          resolve(db!)
        })
      })
    })
  })
}

export function closeDatabase() {
  return new Promise<void>((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err)
        } else {
          console.log('Database connection closed')
        }
        db = null
        resolve()
      })
    } else {
      resolve()
    }
  })
}

// 在进程退出时关闭数据库连接
process.on('exit', () => closeDatabase())
process.on('SIGINT', () => closeDatabase())
process.on('SIGTERM', () => closeDatabase())
