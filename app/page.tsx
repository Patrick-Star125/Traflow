'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/frontend/hooks/useAuth'
import { Layout } from '@/frontend/components/layout/Layout'
import { TradingRecordTable } from '@/frontend/components/trading/TradingRecordTable'
import { FilterBar } from '@/frontend/components/trading/FilterBar'
import { RecordDialog } from '@/frontend/components/trading/RecordDialog'
import { Button } from '@/frontend/components/ui/Button'
import { Plus } from 'lucide-react'
import { TradingRecord, RecordFilters } from '@/types'
import { useTradingRecords } from '@/frontend/hooks/useTradingRecords'

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [filters, setFilters] = useState<RecordFilters>({
    page: 1,
    limit: 20,
    sort: 'latest'
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TradingRecord | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const {
    records,
    total,
    isLoading,
    error,
    refetch
  } = useTradingRecords(filters)

  const handleFilterChange = (newFilters: Partial<RecordFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }))
  }

  const handleRecordClick = (record: TradingRecord) => {
    setSelectedRecord(record)
    setIsDetailDialogOpen(true)
  }

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    refetch()
  }

  const handleUpdateSuccess = () => {
    setIsDetailDialogOpen(false)
    setSelectedRecord(null)
    refetch()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 页面标题和操作按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">交易复盘记录</h1>
            <p className="text-muted-foreground">
              查看和管理社区的交易复盘记录，获得AI智能点评
            </p>
          </div>
          {user && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="notion-button notion-button-primary h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加记录
            </Button>
          )}
        </div>

        {/* 筛选栏 */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          totalCount={total}
        />

        {/* 错误提示 */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">
              加载数据时出错: {error.message}
            </p>
          </div>
        )}

        {/* 交易记录表格 */}
        <TradingRecordTable
          records={records}
          loading={isLoading}
          pagination={{
            current: filters.page || 1,
            pageSize: filters.limit || 20,
            total,
            onChange: handlePageChange
          }}
          onRecordClick={handleRecordClick}
          onFavoriteToggle={refetch}
        />

        {/* 创建记录对话框 */}
        <RecordDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleCreateSuccess}
          mode="create"
        />

        {/* 记录详情/编辑对话框 */}
        <RecordDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          onSuccess={handleUpdateSuccess}
          record={selectedRecord}
          mode={selectedRecord?.userId === user?.id ? 'edit' : 'view'}
        />
      </div>
    </Layout>
  )
}