'use client'

import React from 'react'
import { RecordFilters } from '@/types'
import { Button } from '@/frontend/components/ui/Button'
import { Search, Filter } from 'lucide-react'

interface FilterBarProps {
  filters: RecordFilters
  onFilterChange: (filters: Partial<RecordFilters>) => void
  totalCount: number
}

export function FilterBar({ filters, onFilterChange, totalCount }: FilterBarProps) {
  const sortOptions = [
    { value: 'latest', label: '最新' },
    { value: 'popular', label: '最热门' },
    { value: 'my', label: '我发布的' },
    { value: 'favorites', label: '我收藏的' }
  ]

  const limitOptions = [10, 20, 50]

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索币种..."
            className="notion-input pl-10"
            value={filters.coin || ''}
            onChange={(e) => onFilterChange({ coin: e.target.value || undefined })}
          />
        </div>

        {/* 排序选项 */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            className="notion-input w-auto"
            value={filters.sort || 'latest'}
            onChange={(e) => onFilterChange({ sort: e.target.value as any })}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 每页显示数量 */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">每页</span>
          <select
            className="notion-input w-auto"
            value={filters.limit || 20}
            onChange={(e) => onFilterChange({ limit: parseInt(e.target.value) })}
          >
            {limitOptions.map(limit => (
              <option key={limit} value={limit}>
                {limit}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">条</span>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>共找到 {totalCount} 条记录</span>
        {(filters.coin || filters.sort !== 'latest') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({ coin: undefined, sort: 'latest' })}
          >
            清除筛选
          </Button>
        )}
      </div>
    </div>
  )
}