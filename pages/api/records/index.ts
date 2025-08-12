import { NextApiRequest, NextApiResponse } from 'next'
import { getDatabase } from '@/backend/utils/database'
import { recordFiltersSchema, createRecordSchema } from '@/backend/utils/validation'
import { verifyToken } from '@/backend/middleware/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      return await handleGetRecords(req, res)
    } else if (req.method === 'POST') {
      return await handleCreateRecord(req, res)
    } else {
      return res.status(405).json({ success: false, message: '方法不允许' })
    }
  } catch (error) {
    console.error('Records API error:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
}

async function handleGetRecords(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 验证查询参数
    const filters = recordFiltersSchema.parse(req.query)
    const db = getDatabase()

    // 构建查询条件
    let whereClause = 'WHERE tr.is_deleted = 0 AND u.is_active = 1'
    const params: any[] = []

    if (filters.coin) {
      whereClause += ' AND tr.coin_symbol LIKE ?'
      params.push(`%${filters.coin}%`)
    }

    if (filters.userId) {
      whereClause += ' AND tr.user_id = ?'
      params.push(filters.userId)
    }

    if (filters.dateFrom) {
      whereClause += ' AND tr.review_date >= ?'
      params.push(filters.dateFrom)
    }

    if (filters.dateTo) {
      whereClause += ' AND tr.review_date <= ?'
      params.push(filters.dateTo)
    }

    if (filters.hasAiReview !== undefined) {
      if (filters.hasAiReview) {
        whereClause += ' AND ai.id IS NOT NULL'
      } else {
        whereClause += ' AND ai.id IS NULL'
      }
    }

    // 构建排序条件
    let orderClause = ''
    switch (filters.sort) {
      case 'latest':
        orderClause = 'ORDER BY tr.created_at DESC'
        break
      case 'popular':
        orderClause = 'ORDER BY favorite_count DESC, tr.created_at DESC'
        break
      default:
        orderClause = 'ORDER BY tr.created_at DESC'
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM trading_records tr
      LEFT JOIN users u ON tr.user_id = u.id
      LEFT JOIN ai_reviews ai ON tr.id = ai.record_id
      ${whereClause}
    `
    const totalResult = db.prepare(countQuery).get(...params) as { total: number }
    const total = totalResult.total

    // 查询记录
    const offset = (filters.page - 1) * filters.limit
    const recordsQuery = `
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
      ${whereClause}
      GROUP BY tr.id, u.username, u.avatar_url, ai.id
      ${orderClause}
      LIMIT ? OFFSET ?
    `

    const records = db.prepare(recordsQuery).all(...params, filters.limit, offset)

    // 获取每个记录的备注
    const recordsWithNotes = records.map(record => {
      const notes = db.prepare(`
        SELECT * FROM trading_notes 
        WHERE record_id = ? 
        ORDER BY note_order
      `).all(record.id)

      return {
        ...record,
        notes,
        favoriteCount: record.favorite_count,
        hasAiReview: Boolean(record.has_ai_review),
        userAvatar: record.user_avatar
      }
    })

    res.status(200).json({
      success: true,
      data: {
        items: recordsWithNotes,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      },
      message: '获取成功'
    })

  } catch (error) {
    console.error('Get records error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: '查询参数错误',
        details: error.errors
      })
    }

    throw error
  }
}

async function handleCreateRecord(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 验证用户身份
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      })
    }

    // 验证请求数据
    const recordData = createRecordSchema.parse(req.body)
    const db = getDatabase()

    // 开始事务
    const transaction = db.transaction(() => {
      // 插入交易记录
      const insertRecord = db.prepare(`
        INSERT INTO trading_records (
          user_id, review_date, coin_symbol, chart_image_url, 
          profit_loss_ratio, thinking
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)

      const result = insertRecord.run(
        user.id,
        recordData.reviewDate,
        recordData.coinSymbol.toUpperCase(),
        recordData.chartImageUrl || null,
        recordData.profitLossRatio || null,
        recordData.thinking || null
      )

      const recordId = result.lastInsertRowid as number

      // 插入备注
      if (recordData.notes && recordData.notes.length > 0) {
        const insertNote = db.prepare(`
          INSERT INTO trading_notes (
            record_id, note_order, note_type, content, image_url
          ) VALUES (?, ?, ?, ?, ?)
        `)

        for (const note of recordData.notes) {
          insertNote.run(
            recordId,
            note.noteOrder,
            note.noteType,
            note.content || null,
            note.imageUrl || null
          )
        }
      }

      return recordId
    })

    const recordId = transaction()

    // 获取创建的记录
    const createdRecord = db.prepare(`
      SELECT tr.*, u.username, u.avatar_url as user_avatar
      FROM trading_records tr
      LEFT JOIN users u ON tr.user_id = u.id
      WHERE tr.id = ?
    `).get(recordId)

    const notes = db.prepare(`
      SELECT * FROM trading_notes 
      WHERE record_id = ? 
      ORDER BY note_order
    `).all(recordId)

    res.status(201).json({
      success: true,
      data: {
        ...createdRecord,
        notes,
        favoriteCount: 0,
        hasAiReview: false
      },
      message: '创建成功'
    })

  } catch (error) {
    console.error('Create record error:', error)
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: '请求数据格式错误',
        details: error.errors
      })
    }

    throw error
  }
}