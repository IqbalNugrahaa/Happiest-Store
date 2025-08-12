"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, AlertCircle, Check, Download, Eye } from 'lucide-react'
import { Transaction } from "@/app/page"

interface ExcelUploadProps {
  onUpload: (transactions: Omit<Transaction, "id" | "createdAt">[]) => void
}

interface ParsedTransaction {
  date: Date
  itemPurchased: string
  customerName: string
  storeName: string
  paymentMethod: string
  purchasePrice: number
  sellingPrice: number
  revenue: number
  notes: string
  isValid: boolean
  errors: string[]
}

export function ExcelUpload({ onUpload }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  const parseRupiahValue = (value: string): number => {
    // Remove Rp, spaces, dots (thousand separators), and commas
    const cleanValue = value
      .replace(/Rp\.?\s*/gi, '') // Remove Rp or Rp.
      .replace(/\./g, '') // Remove dots (thousand separators)
      .replace(/,/g, '') // Remove commas
      .trim()
    
    const numericValue = parseFloat(cleanValue)
    return isNaN(numericValue) ? 0 : numericValue
  }

  const validateAndParseRow = (row: string[], index: number): ParsedTransaction => {
    const errors: string[] = []
    
    // Expected columns: Date, Item Purchased, Customer Name, Store Name, Payment Method, Purchase, Selling, Notes
    if (row.length < 7) {
      errors.push(`Row ${index + 1}: Missing required columns`)
    }

    const date = new Date(row[0]?.trim() || '')
    if (isNaN(date.getTime())) {
      errors.push(`Row ${index + 1}: Invalid date format`)
    }

    const itemPurchased = row[1]?.trim() || ''
    if (!itemPurchased) {
      errors.push(`Row ${index + 1}: Item purchased is required`)
    }

    const customerName = row[2]?.trim() || ''
    if (!customerName) {
      errors.push(`Row ${index + 1}: Customer name is required`)
    }

    const storeName = row[3]?.trim() || ''
    if (!storeName) {
      errors.push(`Row ${index + 1}: Store name is required`)
    }

    const paymentMethod = row[4]?.trim() || ''
    if (!paymentMethod) {
      errors.push(`Row ${index + 1}: Payment method is required`)
    }

    // Parse Rupiah values
    const purchasePrice = parseRupiahValue(row[5]?.trim() || '0')
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      errors.push(`Row ${index + 1}: Invalid purchase price`)
    }

    const sellingPrice = parseRupiahValue(row[6]?.trim() || '0')
    if (sellingPrice <= 0) {
      errors.push(`Row ${index + 1}: Invalid selling price`)
    }

    const notes = row[7]?.trim() || ''
    const revenue = sellingPrice - purchasePrice

    return {
      date,
      itemPurchased,
      customerName,
      storeName,
      paymentMethod,
      purchasePrice,
      sellingPrice,
      revenue,
      notes,
      isValid: errors.length === 0,
      errors
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Check file type
    const validTypes = ['.csv', '.xlsx', '.xls']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(fileExtension)) {
      setErrorMessage('Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
      setUploadStatus('error')
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)
    setUploadStatus('idle')
    setErrorMessage("")

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('File must contain at least a header row and one data row')
      }

      // Skip header row and parse data
      const dataRows = lines.slice(1)
      const parsed: ParsedTransaction[] = []

      for (let i = 0; i < dataRows.length; i++) {
        const row = parseCSVLine(dataRows[i])
        const parsedRow = validateAndParseRow(row, i)
        parsed.push(parsedRow)
      }

      clearInterval(progressInterval)
      setUploadProgress(100)
      setParsedData(parsed)
      setShowPreview(true)
      setUploadStatus('success')

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file')
      setUploadStatus('error')
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleConfirmUpload = () => {
    const validTransactions = parsedData
      .filter(item => item.isValid)
      .map(item => ({
        date: item.date,
        itemPurchased: item.itemPurchased,
        customerName: item.customerName,
        storeName: item.storeName,
        paymentMethod: item.paymentMethod,
        purchasePrice: item.purchasePrice,
        sellingPrice: item.sellingPrice,
        revenue: item.revenue,
        notes: item.notes
      }))

    onUpload(validTransactions)
    setParsedData([])
    setShowPreview(false)
    setUploadStatus('idle')
  }

  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const downloadTemplate = () => {
    const template = `Date,Item Purchased,Customer Name,Store Name,Payment Method,Purchase,Selling,Notes
2024-01-15,Wireless Headphones,John Smith,Tech Store Downtown,Credit Card,${formatRupiah(1125000)},${formatRupiah(1499850)},Customer was very satisfied
2024-01-16,Coffee Mug,Sarah Johnson,Home Goods Plus,Cash,${formatRupiah(127500)},${formatRupiah(194850)},Part of a bulk order`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transaction_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const validCount = parsedData.filter(item => item.isValid).length
  const invalidCount = parsedData.length - validCount

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileSpreadsheet className="h-5 w-5" />
            Excel Template
          </CardTitle>
          <CardDescription className="text-blue-700">
            Download our template to ensure your data is formatted correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <div className="mt-4 text-sm text-blue-700">
            <p className="font-medium">Required columns (in order):</p>
            <p>Date, Item Purchased, Customer Name, Store Name, Payment Method, Purchase, Selling, Notes</p>
            <p className="mt-2 text-xs">
              <strong>Note:</strong> Purchase and Selling prices should be in Rupiah format (e.g., Rp 1.125.000 or 1125000)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Transactions</CardTitle>
          <CardDescription>
            Drag and drop your Excel/CSV file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports CSV, XLSX, and XLS files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              Choose File
            </Button>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing file...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'error' && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'success' && !showPreview && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                File processed successfully! {validCount} valid transactions found.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview Data */}
      {showPreview && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview Data
                </CardTitle>
                <CardDescription>
                  Review your data before importing. {validCount} valid, {invalidCount} invalid transactions.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmUpload}
                  disabled={validCount === 0}
                >
                  Import {validCount} Transactions
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Purchase</TableHead>
                    <TableHead>Selling</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((item, index) => (
                    <TableRow key={index} className={!item.isValid ? 'bg-red-50' : ''}>
                      <TableCell>
                        {item.isValid ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.isValid ? item.date.toLocaleDateString() : 'Invalid'}
                      </TableCell>
                      <TableCell className="text-sm">{item.itemPurchased}</TableCell>
                      <TableCell className="text-sm">{item.customerName}</TableCell>
                      <TableCell className="text-sm">{item.storeName}</TableCell>
                      <TableCell className="text-sm">{item.paymentMethod}</TableCell>
                      <TableCell className="text-sm">{formatRupiah(item.purchasePrice)}</TableCell>
                      <TableCell className="text-sm">{formatRupiah(item.sellingPrice)}</TableCell>
                      <TableCell className={`text-sm font-medium ${item.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatRupiah(item.revenue)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.errors.length > 0 && (
                          <div className="text-red-600">
                            {item.errors.join(', ')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
