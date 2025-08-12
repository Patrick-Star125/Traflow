# 部署指南

## 阿里云Ubuntu服务器部署

### 环境准备

#### 1. 服务器要求
- 2核4G Ubuntu服务器
- 公网IP
- 至少20GB存储空间

#### 2. 系统更新
```bash
sudo apt update && sudo apt upgrade -y
```

#### 3. 安装Node.js 18+
```bash
# 使用NodeSource仓库安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 4. 安装PM2
```bash
sudo npm install -g pm2
```

#### 5. 安装Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 项目部署

#### 1. 克隆项目
```bash
cd /var/www
sudo git clone <your-repository-url> traflow
sudo chown -R $USER:$USER /var/www/traflow
cd traflow
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 配置环境变量
```bash
cp .env.example .env.local
nano .env.local
```

编辑环境变量：
```bash
# 数据库配置
DATABASE_URL="./database/traflow.db"

# NextAuth配置
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret-key"

# AI服务配置
DOUBAO_API_KEY="your-doubao-api-key"
DOUBAO_API_URL="https://ark.cn-beijing.volces.com/api/v3"

# 文件上传配置
UPLOAD_DIR="./img"
MAX_FILE_SIZE=10485760

# 应用配置
NODE_ENV="production"
PORT=3000

# JWT配置
JWT_SECRET="your-jwt-secret"
BCRYPT_ROUNDS=12
```

#### 4. 初始化数据库
```bash
npm run db:init
```

#### 5. 构建项目
```bash
npm run build
```

#### 6. 启动服务
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx配置

#### 1. 创建Nginx配置文件
```bash
sudo nano /etc/nginx/sites-available/traflow
```

配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 静态文件缓存
    location /img/ {
        alias /var/www/traflow/img/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /_next/static/ {
        alias /var/www/traflow/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 代理到Next.js应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 文件上传大小限制
    client_max_body_size 10M;

    # 日志配置
    access_log /var/log/nginx/traflow_access.log;
    error_log /var/log/nginx/traflow_error.log;
}
```

#### 2. 启用站点
```bash
sudo ln -s /etc/nginx/sites-available/traflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL证书配置

#### 使用Let's Encrypt免费证书
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

### 防火墙配置

```bash
# 启用UFW防火墙
sudo ufw enable

# 允许SSH
sudo ufw allow ssh

# 允许HTTP和HTTPS
sudo ufw allow 'Nginx Full'

# 查看状态
sudo ufw status
```

### 监控和日志

#### 1. PM2监控
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs traflow

# 重启应用
pm2 restart traflow

# 监控面板
pm2 monit
```

#### 2. 系统监控
```bash
# 安装htop
sudo apt install htop -y

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 备份策略

#### 1. 数据库备份
```bash
# 创建备份脚本
nano backup.sh
```

备份脚本内容：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/traflow"
DB_FILE="/var/www/traflow/database/traflow.db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $DB_FILE $BACKUP_DIR/traflow_$DATE.db

# 备份图片文件
tar -czf $BACKUP_DIR/images_$DATE.tar.gz -C /var/www/traflow img/

# 删除7天前的备份
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

#### 2. 设置定时备份
```bash
chmod +x backup.sh
sudo crontab -e
# 添加每日凌晨2点备份
0 2 * * * /var/www/traflow/backup.sh
```

### 性能优化

#### 1. 数据库优化
```bash
# 定期清理数据库
sqlite3 /var/www/traflow/database/traflow.db "VACUUM;"
```

#### 2. 图片压缩
```bash
# 安装图片优化工具
sudo apt install imagemagick -y

# 批量压缩图片
find /var/www/traflow/img -name "*.jpg" -exec mogrify -quality 85 {} \;
find /var/www/traflow/img -name "*.png" -exec mogrify -quality 85 {} \;
```

### 故障排除

#### 1. 常见问题

**应用无法启动**
```bash
# 检查日志
pm2 logs traflow
# 检查端口占用
sudo netstat -tlnp | grep :3000
# 重启应用
pm2 restart traflow
```

**数据库连接失败**
```bash
# 检查数据库文件权限
ls -la /var/www/traflow/database/
# 修复权限
sudo chown -R $USER:$USER /var/www/traflow/database/
```

**Nginx配置错误**
```bash
# 测试配置
sudo nginx -t
# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 2. 性能监控

```bash
# 查看应用性能
pm2 monit

# 查看系统负载
uptime

# 查看网络连接
ss -tuln
```

### 更新部署

#### 1. 应用更新流程
```bash
cd /var/www/traflow

# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 运行数据库迁移（如有）
npm run db:migrate

# 重新构建
npm run build

# 重启应用
pm2 restart traflow
```

#### 2. 零停机更新
```bash
# 使用PM2的reload功能
pm2 reload traflow
```

### 安全加固

#### 1. 系统安全
```bash
# 禁用root登录
sudo nano /etc/ssh/sshd_config
# 设置 PermitRootLogin no

# 更改SSH端口
# 设置 Port 2222

# 重启SSH服务
sudo systemctl restart ssh
```

#### 2. 应用安全
- 定期更新依赖包
- 使用强密码和JWT密钥
- 启用HTTPS
- 配置适当的CORS策略
- 实施API限流

### 维护清单

#### 每日检查
- [ ] 应用运行状态
- [ ] 系统资源使用情况
- [ ] 错误日志

#### 每周检查
- [ ] 备份完整性
- [ ] 安全更新
- [ ] 性能指标

#### 每月检查
- [ ] 依赖包更新
- [ ] 数据库优化
- [ ] 磁盘清理
- [ ] SSL证书有效期

这个部署指南涵盖了从环境准备到生产运维的完整流程，确保应用能够稳定、安全地运行在阿里云服务器上。