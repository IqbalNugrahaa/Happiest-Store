"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Calculator } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"
import { SaveStatusDialog } from "@/components/save-status-dialog"
import { useSaveStatus } from "@/hooks/use-save-status"
import type { Product } from "@/app/page"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { formatCurrency, getCurrencySymbol, convertToStorageAmount, convertToDisplayAmount } from "@/utils/currency"

interface TransactionFormData {
  date: Date
  itemPurchased: string
  customerName: string
  storeName: string
  paymentMethod: string
  purchasePrice: number
  sellingPrice: number
  notes: string
}

interface TransactionFormProps {
  onSubmit: (transaction: TransactionFormData) => Promise<void>
  products: Product[]
}

export function TransactionForm({ onSubmit, products }: TransactionFormProps) {
  const { t, language } = useLanguage()
  const saveStatus = useSaveStatus()

  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date(),
    itemPurchased: "",
    customerName: "",
    storeName: "",
    paymentMethod: "",
    purchasePrice: 0,
    sellingPrice: 0,
    notes: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({})
  const [isPriceAutoFilled, setIsPriceAutoFilled] = useState(false)

  const currencySymbol = getCurrencySymbol(language)

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionFormData, string>> = {}

    if (!formData.itemPurchased.trim()) {
      newErrors.itemPurchased = t("error.itemRequired")
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = t("error.customerRequired")
    }

    if (!formData.storeName.trim()) {
      newErrors.storeName = t("error.storeRequired")
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = t("error.paymentRequired")
    }

    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = t("error.purchasePriceInvalid")
    }

    if (formData.sellingPrice <= 0) {
      newErrors.sellingPrice = t("error.sellingPriceInvalid")
    }

    if (formData.sellingPrice < formData.purchasePrice) {
      newErrors.sellingPrice = t("error.sellingPriceTooLow")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await saveStatus.executeWithStatus(() => onSubmit(formData), {
      savingTitle: t("form.recordingTransaction"),
      savingMessage: t("dialog.saving.message"),
      successTitle: t("dialog.success.title"),
      successMessage: t("form.transactionRecorded"),
      errorTitle: t("dialog.error.title"),
    })

    // Reset form on success
    if (saveStatus.status === "success") {
      setFormData({
        date: new Date(),
        itemPurchased: "",
        customerName: "",
        storeName: "",
        paymentMethod: "",
        purchasePrice: 0,
        sellingPrice: 0,
        notes: "",
      })
      setIsPriceAutoFilled(false)
    }
  }

  const handleInputChange = (field: keyof TransactionFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Track if selling price was auto-filled
    if (field === "sellingPrice" && value > 0) {
      setIsPriceAutoFilled(true)
    } else if (field === "sellingPrice") {
      setIsPriceAutoFilled(false)
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const revenue = formData.sellingPrice - formData.purchasePrice
  const profitMargin = formData.sellingPrice > 0 ? (revenue / formData.sellingPrice) * 100 : 0

  const paymentMethods = [
    t("payment.cash"),
    t("payment.creditCard"),
    t("payment.debitCard"),
    t("payment.paypal"),
    t("payment.bankTransfer"),
    t("payment.check"),
    t("payment.mobilePayment"),
    t("payment.giftCard"),
  ]

  // Format product options with currency
  const productOptions = products.map((product) => ({
    value: product.name,
    label: `${product.name} - ${formatCurrency(product.price, language)}`,
    price: product.price,
  }))

  return (
    <div className="space-y-6">
      <SaveStatusDialog
        isOpen={saveStatus.isDialogOpen}
        onClose={saveStatus.closeDialog}
        status={saveStatus.status}
        title={saveStatus.title}
        message={saveStatus.message}
        error={saveStatus.error}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">{t("form.transactionDate")} *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date.toISOString().split("T")[0]}
              onChange={(e) => handleInputChange("date", new Date(e.target.value))}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemPurchased">{t("form.itemPurchased")} *</Label>
            <Combobox
              options={productOptions}
              value={formData.itemPurchased}
              onSelect={(value, option) => {
                handleInputChange("itemPurchased", value)
                if (option?.price) {
                  handleInputChange("sellingPrice", option.price)
                }
              }}
              placeholder={t("form.searchProduct")}
              emptyText={t("form.noProductsFound")}
              className={errors.itemPurchased ? "border-red-500" : ""}
            />
            {errors.itemPurchased && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.itemPurchased}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">{t("form.customerName")} *</Label>
            <Input
              id="customerName"
              type="text"
              placeholder={t("form.enterCustomerName")}
              value={formData.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
              className={errors.customerName ? "border-red-500" : ""}
            />
            {errors.customerName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.customerName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeName">{t("form.storeName")} *</Label>
            <Input
              id="storeName"
              type="text"
              placeholder={t("form.enterStoreName")}
              value={formData.storeName}
              onChange={(e) => handleInputChange("storeName", e.target.value)}
              className={errors.storeName ? "border-red-500" : ""}
            />
            {errors.storeName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.storeName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">{t("form.paymentMethod")} *</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
              <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                <SelectValue placeholder={t("form.selectPaymentMethod")} />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.paymentMethod}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">{t("form.purchasePrice")} (Rp) *</Label>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              step="1000"
              placeholder={t("form.enterPurchasePrice")}
              value={convertToDisplayAmount(formData.purchasePrice, language) || ""}
              onChange={(e) => {
                const inputValue = Number.parseFloat(e.target.value) || 0
                const storageValue = convertToStorageAmount(inputValue, language)
                handleInputChange("purchasePrice", storageValue)
              }}
              className={errors.purchasePrice ? "border-red-500" : ""}
            />
            {errors.purchasePrice && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.purchasePrice}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellingPrice" className="flex items-center gap-2">
              {t("form.sellingPrice")} (Rp) *
              {isPriceAutoFilled && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {t("form.autoFilled")}
                </span>
              )}
            </Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="1000"
              placeholder={t("form.enterSellingPrice")}
              value={convertToDisplayAmount(formData.sellingPrice, language) || ""}
              onChange={(e) => {
                const inputValue = Number.parseFloat(e.target.value) || 0
                const storageValue = convertToStorageAmount(inputValue, language)
                handleInputChange("sellingPrice", storageValue)
                setIsPriceAutoFilled(false)
              }}
              className={cn(
                errors.sellingPrice ? "border-red-500" : "",
                isPriceAutoFilled ? "border-green-500 bg-green-50" : "",
              )}
            />
            {errors.sellingPrice && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.sellingPrice}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">{t("form.notes")}</Label>
          <Textarea
            id="notes"
            placeholder={t("form.addNotes")}
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={3}
          />
        </div>

        {/* Transaction Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">{t("form.transactionSummary")}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">{t("form.purchasePrice")}:</span>
                <p className="text-blue-900 font-semibold">{formatCurrency(formData.purchasePrice, language)}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">{t("form.sellingPrice")}:</span>
                <p className="text-blue-900 font-semibold">{formatCurrency(formData.sellingPrice, language)}</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">{t("form.revenue")}:</span>
                <p className={`font-semibold ${revenue >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(revenue, language)}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-700">{t("form.profitMargin")}:</span>
                <p className={`font-semibold ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saveStatus.status === "saving"} className="flex-1 md:flex-none">
            {saveStatus.status === "saving" ? t("form.recordingTransaction") : t("form.recordTransaction")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                date: new Date(),
                itemPurchased: "",
                customerName: "",
                storeName: "",
                paymentMethod: "",
                purchasePrice: 0,
                sellingPrice: 0,
                notes: "",
              })
              setErrors({})
              setIsPriceAutoFilled(false)
            }}
          >
            {t("form.clearForm")}
          </Button>
        </div>
      </form>
    </div>
  )
}
