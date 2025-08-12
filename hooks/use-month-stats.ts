"use client"

import { useState, useEffect } from 'react'
import { transactionService } from '@/lib/database'

interface MonthStats {
  totalTransactions: number
  totalRevenue: number
  totalSales: number
  averageRevenue: number
}

export function useMonthStats(month: number, year: number) {
  const [stats, setStats] = useState<MonthStats>({
    totalTransactions: 0,
    totalRevenue: 0,
    totalSales: 0,
    averageRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await transactionService.getMonthStats(month, year)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [month, year])

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  }
}
