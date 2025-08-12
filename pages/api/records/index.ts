import { NextApiRequest, NextApiResponse } from 'next'
import { getDatabase } from '@/backend/utils/database'
import { authenticateToken } from '@/backend/middleware/auth'
import { TradingRecord } from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDatabase()
    
    if (req.method === 'GET') {
      return handleGetRecords(req, res, db)
    } else if (req.method === 'POST') {
      return handleCreateRecord(req, res, db)
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Database connection error:', error)
    return res.status(500).json({ error: 'Database connection failed' })
  }
}

async function handleGetRecords(req: NextApiRequest, res: NextApiResponse, db: any) {
  try {
    const {
      sortBy = 'recent',
      coinSymbol,
      showFavorites,
      showMyRecords,
      page = '1',
      pageSize = '20'
    } = req.query

    const pageNum = parseInt(page as string)
    const pageSizeNum = parseInt(pageSize as string)
    const offset = (pageNum - 1) * pageSizeNum

    let whereConditions: string[] = []
    let params: any[] = []

    if (coinSymbol) {
      whereConditions.push('tr.coin_symbol = ?')
      params.push(coinSymbol)
    }

    // 处理用户相关的筛选
    let userId: number | null = null
    const authHeader = req.headers.authorization
    if (authHeader) {
      try {
        const user = await authenticateToken(authHeader.replace('Bearer ', ''))
        userId = user.id

        if (showMyRecords === 'true') {
          whereConditions.push('tr.user_id = ?')
          params.push(userId)
        }
      } catch (error) {
        // 忽略认证错误，继续显示公开记录
      }
    }

    let baseQuery = `
      SELECT 
        tr.*,
        u.username,
        u.avatar_url,
        COUNT(f.id) as favorite_count,
        ${userId ? `CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited` : '0 as is_favorited'}
      FROM trading_records tr
      LEFT JOIN users u ON tr.user_id = u.id
      LEFT JOIN favorites f ON tr.id = f.record_id
      ${userId ? 'LEFT JOIN favorites uf ON tr.id = uf.record_id AND uf.user_id = ?' : ''}
    `

    if (userId && !showMyRecords) {
      params.unshift(userId)
    }

    if (showFavorites === 'true' && userId) {
      whereConditions.push('uf.id IS NOT NULL')
    }

    if (whereConditions.length > 0) {
      baseQuery += ' WHERE ' + whereConditions.join(' AND ')
    }

    baseQuery += ' GROUP BY tr.id'

    // 排序
    let orderBy = ''
    switch (sortBy) {
      case 'hot':
        orderBy = ' ORDER BY favorite_count DESC, tr.created_at DESC'
        break
      case 'recent':
      default:
        orderBy = ' ORDER BY tr.created_at DESC'
        break
    }

    baseQuery += orderBy
    baseQuery += ' LIMIT ? OFFSET ?'
    params.push(pageSizeNum, offset)

    return new Promise((resolve, reject) => {
      db.all(baseQuery, params, (err: any, rows: any[]) => {
        if (err) {
          console.error('Query error:', err)
          reject(err)
          return
        }

        // 获取总数
        let countQuery = `
          SELECT COUNT(DISTINCT tr.id) as total
          FROM trading_records tr
          LEFT JOIN users u ON tr.user_id = u.id
          ${userId && showFavorites === 'true' ? 'LEFT JOIN favorites uf ON tr.id = uf.record_id AND uf.user_id = ?' : ''}
        `

        let countParams: any[] = []
        if (userId && showFavorites === 'true') {
          countParams.push(userId)
        }

        let countWhereConditions: string[] = []
        if (coinSymbol) {
          countWhereConditions.push('tr.coin_symbol = ?')
          countParams.push(coinSymbol)
        }
        if (showMyRecords === 'true' && userId) {
          countWhereConditions.push('tr.user_id = ?')
          countParams.push(userId)
        }
        if (showFavorites === 'true' && userId) {
          countWhereConditions.push('uf.id IS NOT NULL')
        }

        if (countWhereConditions.length > 0) {
          countQuery += ' WHERE ' + countWhereConditions.join(' AND ')
        }

        db.get(countQuery, countParams, (countErr: any, countRow: any) => {
          if (countErr) {
            console.error('Count query error:', countErr)
            reject(countErr)
            return
          }

          const records = rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            username: row.username,
            avatarUrl: row.avatar_url,
            reviewDate: row.review_date,
            coinSymbol: row.coin_symbol,
            chartImage: row.chart_image,
            profitLossRatio: row.profit_loss_ratio,
            thinking: row.thinking,
            favoriteCount: row.favorite_count,
            isFavorited: Boolean(row.is_favorited),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }))

          res.status(200).json({
            records,
            pagination: {
              page: pageNum,
              pageSize: pageSizeNum,
              total: countRow.total,
              totalPages: Math.ceil(countRow.total / pageSizeNum)
            }
          })
          resolve(undefined)
        })
      })
    })
  } catch (error) {
    console.error('Get records error:', error)
    return res.status(500).json({ error: 'Failed to fetch records' })
  }
}

async function handleCreateRecord(req: NextApiRequest, res: NextApiResponse, db: any) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user = await authenticateToken(authHeader.replace('Bearer ', ''))
    const {
      reviewDate,
      coinSymbol,
      chartImage,
      profitLossRatio,
      thinking
    } = req.body

    if (!reviewDate || !coinSymbol || !thinking) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const insertQuery = `
      INSERT INTO trading_records (
        user_id, review_date, coin_symbol, chart_image, 
        profit_loss_ratio, thinking, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `

    return new Promise((resolve, reject) => {
      db.run(insertQuery, [
        user.id,
        reviewDate,
        coinSymbol,
        chartImage,
        profitLossRatio,
        thinking
      ], function(this: any, err: any) {
        if (err) {
          console.error('Insert error:', err)
          reject(err)
          return
        }

        const recordId = this.lastID

        // 获取新创建的记录
        const selectQuery = `
          SELECT 
            tr.*,
            u.username,
            u.avatar_url,
            0 as favorite_count,
            0 as is_favorited
          FROM trading_records tr
          LEFT JOIN users u ON tr.user_id = u.id
          WHERE tr.id = ?
        `

        db.get(selectQuery, [recordId], (selectErr: any, row: any) => {
          if (selectErr) {
            console.error('Select error:', selectErr)
            reject(selectErr)
            return
          }

          const record = {
            id: row.id,
            userId: row.user_id,
            username: row.username,
            avatarUrl: row.avatar_url,
            reviewDate: row.review_date,
            coinSymbol: row.coin_symbol,
            chartImage: row.chart_image,
            profitLossRatio: row.profit_loss_ratio,
            thinking: row.thinking,
            favoriteCount: row.favorite_count,
            isFavorited: Boolean(row.is_favorited),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }

          res.status(201).json(record)
          resolve(undefined)
        })
      })
    })
  } catch (error) {
    console.error('Create record error:', error)
    return res.status(500).json({ error: 'Failed to create record' })
  }
}