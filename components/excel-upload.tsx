"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Fuse from "fuse.js"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, AlertCircle, Check, Download, Eye } from "lucide-react"
import type { Transaction } from "@/app/page"
import { supabase } from "@/lib/supabase"

interface ExcelUploadProps {
  onUpload: (transactions: Omit<Transaction, "id" | "createdAt">[]) => void
}

interface ParsedTransaction {
  date: Date
  itemPurchased: string
  itemPurchasedOriginal: string
  customerName: string
  customerNameOriginal: string
  storeName: string
  storeNameOriginal: string
  paymentMethod: string
  purchasePrice: number
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
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [customers, setCustomers] = useState<string[]>([])
  const [stores, setStores] = useState<string[]>([])
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    const fetchReferenceData = async () => {
      const { data: custData } = await supabase.from("customers").select("name")
      const { data: storeData } = await supabase.from("stores").select("name")
      const { data: itemData } = await supabase.from("products").select("name")

      setCustomers(custData?.map((c: { name: string }) => c.name) || [])
      setStores(storeData?.map((s: { name: string }) => s.name) || [])
      setItems(itemData?.map((p: { name: string }) => p.name) || [])
    }
    fetchReferenceData()
  }, [])

  const createFuzzyMatcher = (list: string[]) => new Fuse(list, { threshold: 0.3 })
  const matchClosest = (matcher: Fuse<string>, value: string) => {
    if (!value) return value
    const result = matcher.search(value)
    return result.length > 0 ? result[0].item : value
  }

  const isCorrected = (original: string, matched: string) =>
    original && matched && original.toLowerCase() !== matched.toLowerCase()

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
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const parseRupiahValue = (value: string): number => {
    const cleanValue = value
      .replace(/Rp\.?\s*/gi, "")
      .replace(/\./g, "")
      .replace(/,/g, "")
      .trim()
    const numericValue = Number.parseFloat(cleanValue)
    return isNaN(numericValue) ? 0 : numericValue
  }

  const validateAndParseRow = (row: string[], index: number): ParsedTransaction => {
    const errors: string[] = []

    const date = new Date(row[0]?.trim() || "")
    if (isNaN(date.getTime())) {
      errors.push(`Row ${index + 1}: Invalid date format`)
    }

    const itemPurchasedRaw = row[1]?.trim() || ""
    const customerNameRaw = row[2]?.trim() || ""
    const storeNameRaw = row[3]?.trim() || ""

    const itemPurchasedMatched = matchClosest(createFuzzyMatcher(items), itemPurchasedRaw)
    const customerNameMatched = matchClosest(createFuzzyMatcher(customers), customerNameRaw)
    const storeNameMatched = matchClosest(createFuzzyMatcher(stores), storeNameRaw)

    if (!itemPurchasedMatched) errors.push(`Row ${index + 1}: Item purchase is required`)
    if (!customerNameMatched) errors.push(`Row ${index + 1}: Customer name is required`)
    if (!storeNameMatched) errors.push(`Row ${index + 1}: Store name is required`)

    const paymentMethod = row[4]?.trim() || ""
    if (!paymentMethod) errors.push(`Row ${index + 1}: Payment method is required`)

    const purchasePrice = parseRupiahValue(row[5]?.trim() || "0")
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      errors.push(`Row ${index + 1}: Invalid purchase price`)
    }

    const notes = row[6]?.trim() || ""

    return {
      date,
      itemPurchased: itemPurchasedMatched,
      itemPurchasedOriginal: itemPurchasedRaw,
      customerName: customerNameMatched,
      customerNameOriginal: customerNameRaw,
      storeName: storeNameMatched,
      storeNameOriginal: storeNameRaw,
      paymentMethod,
      purchasePrice,
      notes,
      isValid: errors.length === 0,
      errors,
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return
    const validTypes = [".csv"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
    if (!validTypes.includes(fileExtension)) {
      setErrorMessage("Please upload a CSV file (.csv)")
      setUploadStatus("error")
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)
    setUploadStatus("idle")
    setErrorMessage("")

    try {
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
      const lines = text.split("\n").filter(line => line.trim())

      if (lines.length < 2) {
        throw new Error("File must contain at least a header row and one data row")
      }

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
      setUploadStatus("success")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to process file")
      setUploadStatus("error")
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
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
        sellingPrice: 0,
        revenue: -item.purchasePrice,
        notes: item.notes,
      }))
    onUpload(validTransactions)
    setParsedData([])
    setShowPreview(false)
    setUploadStatus("idle")
  }

  const formatRupiah = (amount: number): string =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const downloadTemplate = () => {
    const template = `Date,Item Purchase,Customer Name,Store Name,Payment Method,Purchase,Notes
2024-01-15,Wireless Headphones,John Smith,Tech Store Downtown,Credit Card,${formatRupiah(1125000)},Customer was very satisfied
2024-01-16,Coffee Mug,Sarah Johnson,Home Goods Plus,Cash,${formatRupiah(127500)},Part of a bulk order`
    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transaction_template.csv"
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
          <Button onClick={downloadTemplate} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Transactions</CardTitle>
          <CardDescription>Drag and drop your CSV file or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Drop your file here, or click to browse</p>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
              Choose File
            </Button>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing file...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {uploadStatus === "error" && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
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
                <Button onClick={handleConfirmUpload} disabled={validCount === 0}>
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
                    <TableHead>Item Purchase</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Purchase</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((item, index) => (
                    <TableRow key={index} className={!item.isValid ? "bg-red-50" : ""}>
                      <TableCell>{item.isValid ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}</TableCell>
                      <TableCell className="text-sm">{item.isValid ? item.date.toLocaleDateString() : "Invalid"}</TableCell>
                      <TableCell
                        className={`text-sm ${isCorrected(item.itemPurchasedOriginal, item.itemPurchased) ? "bg-yellow-100" : ""}`}
                        title={isCorrected(item.itemPurchasedOriginal, item.itemPurchased) ? `Corrected from "${item.itemPurchasedOriginal}"` : ""}
                      >
                        {item.itemPurchased}
                      </TableCell>
                      <TableCell
                        className={`text-sm ${isCorrected(item.customerNameOriginal, item.customerName) ? "bg-yellow-100" : ""}`}
                        title={isCorrected(item.customerNameOriginal, item.customerName) ? `Corrected from "${item.customerNameOriginal}"` : ""}
                      >
                        {item.customerName}
                      </TableCell>
                      <TableCell
                        className={`text-sm ${isCorrected(item.storeNameOriginal, item.storeName) ? "bg-yellow-100" : ""}`}
                        title={isCorrected(item.storeNameOriginal, item.storeName) ? `Corrected from "${item.storeNameOriginal}"` : ""}
                      >
                        {item.storeName}
                      </TableCell>
                      <TableCell className="text-sm">{item.paymentMethod}</TableCell>
                      <TableCell className="text-sm">{formatRupiah(item.purchasePrice)}</TableCell>
                      <TableCell className="text-sm">{item.notes}</TableCell>
                      <TableCell className="text-sm">{item.errors.length > 0 && <div className="text-red-600">{item.errors.join(", ")}</div>}</TableCell>
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
