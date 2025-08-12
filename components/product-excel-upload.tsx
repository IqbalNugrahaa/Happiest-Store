"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, AlertCircle, Check, Download, Eye, Info } from "lucide-react"
import type { Product } from "@/app/page"

interface ProductExcelUploadProps {
  onUpload: (
    products: Omit<Product, "id" | "createdAt">[],
  ) => Promise<{ created: number; skipped: number; duplicates: string[] }>
}

interface ParsedProduct {
  name: string
  type: string
  price: number
  isValid: boolean
  errors: string[]
}

export function ProductExcelUpload({ onUpload }: ProductExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [uploadResult, setUploadResult] = useState<{ created: number; skipped: number; duplicates: string[] } | null>(
    null,
  )
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
    // Remove Rp, spaces, dots (thousand separators), and commas
    const cleanValue = value
      .replace(/Rp\.?\s*/gi, "") // Remove Rp or Rp.
      .replace(/\./g, "") // Remove dots (thousand separators)
      .replace(/,/g, "") // Remove commas
      .trim()

    const numericValue = Number.parseFloat(cleanValue)
    return isNaN(numericValue) ? 0 : numericValue
  }

  const validateAndParseRow = (row: string[], index: number): ParsedProduct => {
    const errors: string[] = []

    // Expected columns: Name, Type, Price
    if (row.length < 3) {
      errors.push(`Row ${index + 1}: Missing required columns`)
    }

    const name = row[0]?.trim() || ""
    if (!name) {
      errors.push(`Row ${index + 1}: Product name is required`)
    }

    const type = row[1]?.trim() || ""
    if (!type) {
      errors.push(`Row ${index + 1}: Product type is required`)
    }

    // Parse Rupiah values
    const price = parseRupiahValue(row[2]?.trim() || "0")
    if (isNaN(price) || price <= 0) {
      errors.push(`Row ${index + 1}: Invalid price (must be greater than 0)`)
    }

    return {
      name,
      type,
      price,
      isValid: errors.length === 0,
      errors,
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Check file type
    const validTypes = [".csv", ".xlsx", ".xls"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!validTypes.includes(fileExtension)) {
      setErrorMessage("Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
      setUploadStatus("error")
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)
    setUploadStatus("idle")
    setErrorMessage("")

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        throw new Error("File must contain at least a header row and one data row")
      }

      // Skip header row and parse data
      const dataRows = lines.slice(1)
      const parsed: ParsedProduct[] = []

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

  const handleConfirmUpload = async () => {
    const validProducts = parsedData
      .filter((item) => item.isValid)
      .map((item) => ({
        name: item.name,
        type: item.type,
        price: item.price,
      }))

    try {
      const result = await onUpload(validProducts)
      setUploadResult(result)
      setParsedData([])
      setShowPreview(false)
      setUploadStatus("success")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload products")
      setUploadStatus("error")
    }
  }

  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const downloadTemplate = () => {
    const template = `Name,Type,Price
Wireless Headphones,Electronics,${formatRupiah(1499850)}
Coffee Mug,Kitchenware,${formatRupiah(194850)}
Business Notebook,Stationery,${formatRupiah(125000)}`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "product_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const validCount = parsedData.filter((item) => item.isValid).length
  const invalidCount = parsedData.length - validCount

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileSpreadsheet className="h-5 w-5" />
            Product Template
          </CardTitle>
          <CardDescription className="text-blue-700">
            Download our template to ensure your product data is formatted correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <div className="mt-4 text-sm text-blue-700">
            <p className="font-medium">Required columns (in order):</p>
            <p>Name, Type, Price</p>
            <p className="mt-2 text-xs">
              <strong>Note:</strong> Price should be in Rupiah format (e.g., Rp 1.499.850 or 1499850)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Products</CardTitle>
          <CardDescription>Drag and drop your Excel/CSV file or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Drop your file here, or click to browse</p>
            <p className="text-sm text-gray-500 mb-4">Supports CSV, XLSX, and XLS files</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
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
          {uploadStatus === "error" && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {uploadStatus === "success" && uploadResult && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p>Upload completed successfully!</p>
                  <div className="text-sm">
                    <p>✅ {uploadResult.created} products created</p>
                    {uploadResult.skipped > 0 && <p>⚠️ {uploadResult.skipped} products skipped (duplicates)</p>}
                    {uploadResult.duplicates.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">View skipped products</summary>
                        <ul className="mt-1 ml-4 list-disc">
                          {uploadResult.duplicates.map((name, index) => (
                            <li key={index}>{name}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === "success" && !showPreview && !uploadResult && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                File processed successfully! {validCount} valid products found.
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
                  Review your data before importing. {validCount} valid, {invalidCount} invalid products.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmUpload} disabled={validCount === 0}>
                  Import {validCount} Products
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Products with duplicate names will be automatically skipped during import.
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((item, index) => (
                    <TableRow key={index} className={!item.isValid ? "bg-red-50" : ""}>
                      <TableCell>
                        {item.isValid ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{item.name}</TableCell>
                      <TableCell className="text-sm">{item.type}</TableCell>
                      <TableCell className="text-sm">{formatRupiah(item.price)}</TableCell>
                      <TableCell className="text-sm">
                        {item.errors.length > 0 && <div className="text-red-600">{item.errors.join(", ")}</div>}
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
