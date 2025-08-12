"use client"

import { useState, useEffect } from 'react'
import { transactionService } from '@/lib/database'
import type { Database } from '@/lib/supabase'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  date: Date
  createdAt: Date
}

type TransactionInsert = Omit<Database['public']['Tables']['transactions']['Insert'], 'id' | 'created_at' | 'updated_at'>

export function useTransactions(month: number, year: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load transactions for the selected month
  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await transactionService.getByMonth(month, year)
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
      console.error('Error loading transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new transaction
  const addTransaction = async (transactionData: Omit<TransactionInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTransaction = await transactionService.create(transactionData)
      setTransactions(prev => [newTransaction, ...prev])
      return newTransaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
      throw err
    }
  }

  // Add multiple transactions
  const addBulkTransactions = async (transactionsData: Omit<TransactionInsert, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const newTransactions = await transactionService.createMany(transactionsData)
      
      // Only add transactions that belong to the current selected month
      const currentMonthTransactions = newTransactions.filter(t => t.month === month && t.year === year)
      setTransactions(prev => [...currentMonthTransactions, ...prev])
      
      return newTransactions
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transactions')
      throw err
    }
  }

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<TransactionInsert>) => {
    try {
      const updatedTransaction = await transactionService.update(id, {
        ...updates,
        ...(updates.date && {
          month: new Date(updates.date).getMonth() + 1,
          year: new Date(updates.date).getFullYear()
        })
      })
      
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      )
      
      return updatedTransaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
      throw err
    }
  }

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
      throw err
    }
  }

  // Load transactions when month/year changes
  useEffect(() => {
    loadTransactions()
  }, [month, year])

  return {
    transactions,
    loading,
    error,
    addTransaction,
    addBulkTransactions,
    updateTransaction,
    deleteTransaction,
    refetch: loadTransactions
  }
}
