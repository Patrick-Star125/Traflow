import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from '@/backend/utils/database'
import { loginSchema } from '@/backend/utils/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' })
  }

  try {
    // 验证请求数据
    const { email, password } = loginSchema.parse(req.body)

    // 获取数据库连接
    const db = getDatabase()

    // 查找用户
    const user = db.prepare(`
      SELECT id, username, email, password_hash, avatar_url, is_active
      FROM users 
      WHERE email = ? AND is_active = 1
    `).get(email)

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '邮箱或密码错误' 
      })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: '邮箱或密码错误' 
      })
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )

    // 创建会话记录
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
    db.prepare(`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, token, expiresAt.toISOString())

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url,
      isActive: user.is_active
    }

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: '登录成功'
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: '请求数据格式错误',
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
}