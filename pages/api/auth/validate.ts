import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/backend/middleware/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' })
  }

  try {
    const user = await verifyToken(req)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token无效或已过期'
      })
    }

    res.status(200).json({
      success: true,
      user,
      message: 'Token验证成功'
    })

  } catch (error) {
    console.error('Token validation error:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
}