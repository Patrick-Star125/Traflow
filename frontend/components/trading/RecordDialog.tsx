'use client'

import React, { useState, useEffect } from 'react'
import { TradingRecord, CreateRecordData } from '@/types'
import { Button } from '@/frontend/components/ui/Button'
import { X, Upload, Save } from 'lucide-react'

interface RecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  record?: TradingRecord | null
  mode: 'create' | 'edit' | 'view'
}

export function RecordDialog({
  open,
  onOpenChange,
  onSuccess,
  record,
  mode
}: RecordDialogProps) {
  const [formData, setFormData] = useState<CreateRecordData>({
    reviewDate: new Date().toISOString().split('T')[0],
    coinSymbol: '',
    profitLossRatio: undefined,
    thinking: '',
    notes: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (record && (mode === 'edit' || mode === 'view')) {
      setFormData({
        reviewDate: record.reviewDate.split('T')[0],
        coinSymbol: record.coinSymbol,
        chartImageUrl: record.chartImageUrl,
        profitLossRatio: record.profitLossRatio,
        thinking: record.thinking || '',
        notes: record.notes || []
      })
    } else if (mode === 'create') {
      setFormData({
        reviewDate: new Date().toISOString().split('T')[0],
        coinSymbol: '',
        profitLossRatio: undefined,
        thinking: '',
        notes: []
      })
    }
  }, [record, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'view') return

    setIsSubmitting(true)
    try {
      const url = mode === 'create' ? '/api/records' : `/api/records/${record?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      onSuccess()
    } catch (error) {
      console.error('Submit error:', error)
      alert('保存失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {mode === 'create' ? '添加交易记录' : mode === 'edit' ? '编辑交易记录' : '查看交易记录'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">复盘日期</label>
              <input
                type="date"
                className="notion-input"
                value={formData.reviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
                disabled={mode === 'view'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">币种</label>
              <input
                type="text"
                className="notion-input"
                placeholder="如: BTC, ETH"
                value={formData.coinSymbol}
                onChange={(e) => setFormData(prev => ({ ...prev, coinSymbol: e.target.value }))}
                disabled={mode === 'view'}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">盈亏比 (%)</label>
            <input
              type="number"
              step="0.01"
              className="notion-input"
              placeholder="如: 15.5 或 -8.2"
              value={formData.profitLossRatio || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                profitLossRatio: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              disabled={mode === 'view'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">思考总结</label>
            <textarea
              className="notion-input min-h-[100px]"
              placeholder="记录你的交易思考和总结..."
              value={formData.thinking}
              onChange={(e) => setFormData(prev => ({ ...prev, thinking: e.target.value }))}
              disabled={mode === 'view'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">K线截图</label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                点击上传或拖拽图片到此处
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                支持 JPG, PNG 格式，最大 10MB
              </p>
            </div>
          </div>

          {/* Actions */}
          {mode !== 'view' && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="loading-spinner w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {mode === 'create' ? '创建' : '保存'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}