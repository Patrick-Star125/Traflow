const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 创建数据库目录
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建图片目录
const imgDirs = ['img', 'img/avatars', 'img/charts', 'img/notes'];
imgDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`创建目录: ${dir}`);
  }
});

// 连接数据库
const dbPath = path.join(dbDir, 'traflow.db');

console.log('正在初始化数据库...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
  
  console.log('数据库连接成功');
  
  // 读取并执行SQL schema
  const schemaPath = path.join(dbDir, 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('找不到schema.sql文件:', schemaPath);
    db.close();
    process.exit(1);
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // 分割SQL语句并执行
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  let completed = 0;
  const total = statements.length;
  
  if (total === 0) {
    console.log('没有找到SQL语句');
    db.close();
    return;
  }
  
  console.log(`准备执行 ${total} 条SQL语句...`);
  
  statements.forEach((statement, index) => {
    if (statement.trim()) {
      db.run(statement, (err) => {
        if (err) {
          console.error(`执行SQL语句 ${index + 1} 失败:`);
          console.error('语句:', statement.substring(0, 100) + '...');
          console.error('错误:', err.message);
        } else {
          console.log(`✓ SQL语句 ${index + 1}/${total} 执行成功`);
        }
        
        completed++;
        if (completed === total) {
          console.log('\n🎉 数据库初始化完成!');
          console.log('数据库文件位置:', dbPath);
          
          // 验证表是否创建成功
          db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
              console.error('查询表失败:', err.message);
            } else {
              console.log('已创建的表:');
              tables.forEach(table => {
                console.log(`  - ${table.name}`);
              });
            }
            
            // 关闭数据库连接
            db.close((err) => {
              if (err) {
                console.error('关闭数据库连接失败:', err.message);
              } else {
                console.log('数据库连接已关闭');
              }
            });
          });
        }
      });
    } else {
      completed++;
      if (completed === total) {
        console.log('数据库初始化完成!');
        console.log('数据库文件位置:', dbPath);
        db.close();
      }
    }
  });
});