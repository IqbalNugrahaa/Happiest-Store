"use client"

import { useState, useCallback } from 'react'
import { SaveStatus } from '@/components/save-status-dialog'

interface UseSaveStatusReturn {
  status: SaveStatus
  isDialogOpen: boolean
  title: string
  message: string
  error: string
  showSaving: (title?: string, message?: string) => void
  showSuccess: (title?: string, message?: string) => void
  showError: (title?: string, error?: string) => void
  closeDialog: () => void
  executeWithStatus: (
    operation: () => Promise<any>,
    options?: {
      savingTitle?: string
      savingMessage?: string
      successTitle?: string
      successMessage?: string
      errorTitle?: string
    }
  ) => Promise<any>
}

export function useSaveStatus(): UseSaveStatusReturn {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const showSaving = useCallback((customTitle?: string, customMessage?: string) => {
    setStatus('saving')
    setTitle(customTitle || '')
    setMessage(customMessage || '')
    setError('')
    setIsDialogOpen(true)
  }, [])

  const showSuccess = useCallback((customTitle?: string, customMessage?: string) => {
    setStatus('success')
    setTitle(customTitle || '')
    setMessage(customMessage || '')
    setError('')
    setIsDialogOpen(true)
  }, [])

  const showError = useCallback((customTitle?: string, customError?: string) => {
    setStatus('error')
    setTitle(customTitle || '')
    setMessage('')
    setError(customError || '')
    setIsDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setStatus('idle')
    setTitle('')
    setMessage('')
    setError('')
  }, [])

  const executeWithStatus = useCallback(async (
    operation: () => Promise<any>,
    options?: {
      savingTitle?: string
      savingMessage?: string
      successTitle?: string
      successMessage?: string
      errorTitle?: string
    }
  ) => {
    try {
      showSaving(options?.savingTitle, options?.savingMessage)
      
      const result = await operation()
      
      showSuccess(options?.successTitle, options?.successMessage)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      showError(options?.errorTitle, errorMessage)
      return null
    }
  }, [showSaving, showSuccess, showError])

  return {
    status,
    isDialogOpen,
    title,
    message,
    error,
    showSaving,
    showSuccess,
    showError,
    closeDialog,
    executeWithStatus
  }
}
