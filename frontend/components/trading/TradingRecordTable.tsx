'use client'

import React from 'react'
import { TradingRecord } from '@/types'
import { Button } from '@/frontend/components/ui/Button'
import { Heart, MessageSquare, Eye, TrendingUp, TrendingDown } from 'lucide-react'

interface TradingRecordTableProps {
  records: TradingRecord[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  onRecordClick?: (record: TradingRecord) => void
  onFavoriteToggle?: () => void
}

export function TradingRecordTable({
  records,
  loading = false,
  pagination,
  onRecordClick,
  onFavoriteToggle
}: TradingRecordTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const formatProfitLoss = (ratio?: number) => {
    if (!ratio) return '-'
    const isProfit = ratio > 0
    return (
      <span className={`flex items-center ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
        {isProfit ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {ratio > 0 ? '+' : ''}{(ratio * 100).toFixed(2)}%
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>复盘日期</th>
              <th>币种</th>
              <th>K线截图</th>
              <th>盈亏比</th>
              <th>思考</th>
              <th>备注</th>
              <th>收藏数</th>
              <th>AI点评</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{formatDate(record.reviewDate)}</td>
                <td>
                  <span className="tag tag-primary">{record.coinSymbol}</span>
                </td>
                <td>
                  {record.chartImageUrl ? (
                    <div className="image-preview w-16 h-12">
                      <img
                        src={record.chartImageUrl}
                        alt="K线图"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">无图片</span>
                  )}
                </td>
                <td>{formatProfitLoss(record.profitLossRatio)}</td>
                <td>
                  <div className="max-w-xs truncate" title={record.thinking}>
                    {record.thinking || '-'}
                  </div>
                </td>
                <td>
                  <span className="text-sm text-muted-foreground">
                    {record.notes?.length || 0} 个备注
                  </span>
                </td>
                <td>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{record.favoriteCount || 0}</span>
                  </div>
                </td>
                <td>
                  {record.hasAiReview ? (
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRecordClick?.(record)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {pagination.total} 条记录
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              上一页
            </Button>
            <span className="text-sm">
              {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}