import { useState, useEffect } from 'react'
import { TradingRecord, RecordFilters } from '@/types'

export function useTradingRecords() {
  const [records, setRecords] = useState<TradingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RecordFilters>({
    sortBy: 'recent',
    pageSize: 20,
    page: 1
  })

  const fetchRecords = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.coinSymbol) params.append('coinSymbol', filters.coinSymbol)
      if (filters.showFavorites) params.append('showFavorites', 'true')
      if (filters.showMyRecords) params.append('showMyRecords', 'true')
      params.append('page', filters.page.toString())
      params.append('pageSize', filters.pageSize.toString())

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/records?${params.toString()}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      })

      if (!response.ok) {
        throw new Error('获取记录失败')
      }

      const data = await response.json()
      setRecords(data.records || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取记录失败')
    } finally {
      setLoading(false)
    }
  }

  const addRecord = async (recordData: Omit<TradingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('请先登录')
      }

      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recordData)
      })

      if (!response.ok) {
        throw new Error('添加记录失败')
      }

      const newRecord = await response.json()
      setRecords(prev => [newRecord, ...prev])
      return newRecord
    } catch (err) {
      throw err
    }
  }

  const updateRecord = async (id: number, recordData: Partial<TradingRecord>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('请先登录')
      }

      const response = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recordData)
      })

      if (!response.ok) {
        throw new Error('更新记录失败')
      }

      const updatedRecord = await response.json()
      setRecords(prev => prev.map(record => 
        record.id === id ? updatedRecord : record
      ))
      return updatedRecord
    } catch (err) {
      throw err
    }
  }

  const deleteRecord = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('请先登录')
      }

      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('删除记录失败')
      }

      setRecords(prev => prev.filter(record => record.id !== id))
    } catch (err) {
      throw err
    }
  }

  const toggleFavorite = async (recordId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('请先登录')
      }

      const response = await fetch(`/api/records/${recordId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('操作失败')
      }

      const result = await response.json()
      
      // 更新本地记录的收藏状态
      setRecords(prev => prev.map(record => 
        record.id === recordId 
          ? { ...record, isFavorited: result.isFavorited, favoriteCount: result.favoriteCount }
          : record
      ))

      return result
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [filters])

  return {
    records,
    loading,
    error,
    filters,
    setFilters,
    addRecord,
    updateRecord,
    deleteRecord,
    toggleFavorite,
    refetch: fetchRecords
  }
}