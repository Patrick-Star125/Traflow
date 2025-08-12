import { NextApiRequest } from 'next'
import jwt from 'jsonwebtoken'
import { getDatabase } from '@/backend/utils/database'
import { User } from '@/types'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User
}

export async function verifyToken(req: NextApiRequest): Promise<User | null> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any

    const db = getDatabase()
    
    // 验证会话是否存在且未过期
    const session = db.prepare(`
      SELECT us.*, u.id, u.username, u.email, u.avatar_url, u.is_active
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = ? AND us.expires_at > datetime('now') AND u.is_active = 1
    `).get(token)

    if (!session) {
      return null
    }

    return {
      id: session.id,
      username: session.username,
      email: session.email,
      avatarUrl: session.avatar_url,
      createdAt: '',
      updatedAt: '',
      isActive: session.is_active
    }

  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: any) => {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      })
    }

    // 将用户信息添加到请求对象
    ;(req as AuthenticatedRequest).user = user
    return handler(req, res)
  }
}