import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from '@/backend/utils/database'
import { registerSchema } from '@/backend/utils/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' })
  }

  try {
    // 验证请求数据
    const { username, email, password } = registerSchema.parse(req.body)

    // 获取数据库连接
    const db = getDatabase()

    // 检查用户名是否已存在
    const existingUsername = db.prepare(`
      SELECT id FROM users WHERE username = ?
    `).get(username)

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      })
    }

    // 检查邮箱是否已存在
    const existingEmail = db.prepare(`
      SELECT id FROM users WHERE email = ?
    `).get(email)

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '邮箱已被注册'
      })
    }

    // 加密密码
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 创建用户
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `)

    const result = insertUser.run(username, email, passwordHash)
    const userId = result.lastInsertRowid as number

    // 生成JWT token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )

    // 创建会话记录
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
    db.prepare(`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (?, ?, ?)
    `).run(userId, token, expiresAt.toISOString())

    // 返回用户信息
    const userResponse = {
      id: userId,
      username,
      email,
      avatarUrl: null,
      isActive: true
    }

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: '注册成功'
    })

  } catch (error) {
    console.error('Register error:', error)
    
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