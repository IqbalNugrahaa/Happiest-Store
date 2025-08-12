"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useLanguage } from "@/contexts/language-context"

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

interface SaveStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  status: SaveStatus
  title?: string
  message?: string
  error?: string
  autoCloseDelay?: number
}

export function SaveStatusDialog({
  isOpen,
  onClose,
  status,
  title,
  message,
  error,
  autoCloseDelay = 2000
}: SaveStatusDialogProps) {
  const { t } = useLanguage()

  // Auto-close on success after delay
  useEffect(() => {
    if (status === 'success' && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [status, autoCloseDelay, onClose])

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />,
          title: title || t('dialog.saving.title'),
          message: message || t('dialog.saving.message'),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          showButton: false
        }
      case 'success':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-600" />,
          title: title || t('dialog.success.title'),
          message: message || t('dialog.success.message'),
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          showButton: true,
          buttonText: t('dialog.success.button')
        }
      case 'error':
        return {
          icon: <XCircle className="h-12 w-12 text-red-600" />,
          title: title || t('dialog.error.title'),
          message: error || message || t('dialog.error.message'),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          showButton: true,
          buttonText: t('dialog.error.button')
        }
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-gray-600" />,
          title: title || t('dialog.default.title'),
          message: message || t('dialog.default.message'),
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-900',
          showButton: true,
          buttonText: t('dialog.default.button')
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${config.bgColor} ${config.borderColor} max-w-md`}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <DialogTitle className={`${config.textColor} text-xl font-bold`}>
            {config.title}
          </DialogTitle>
          <DialogDescription className={`${config.textColor} text-base mt-2`}>
            {config.message}
          </DialogDescription>
        </DialogHeader>
        
        {config.showButton && (
          <div className="flex justify-center mt-6">
            <Button 
              onClick={onClose}
              className={`${
                status === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : status === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
            >
              {config.buttonText}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
