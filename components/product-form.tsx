"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { SaveStatusDialog } from "@/components/save-status-dialog"
import { useSaveStatus } from "@/hooks/use-save-status"
import { formatCurrency } from "@/utils/currency"
import { useLanguage } from "@/contexts/language-context"

interface ProductFormData {
  name: string
  type: string
  quantity: number
  price: number
}

interface ProductFormProps {
  onSubmit: (product: ProductFormData) => Promise<void>
}

const productTypes = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
  "Toys",
  "Kitchenware",
  "Stationery",
  "Health & Beauty",
  "Automotive",
]

export function ProductForm({ onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    type: "",
    quantity: 0,
    price: 0,
  })
  const [errors, setErrors] = useState<Partial<ProductFormData>>({})
  const saveStatus = useSaveStatus()

  const { t, language } = useLanguage()

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.type) {
      newErrors.type = "Product type is required"
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity must be 0 or greater"
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await saveStatus.executeWithStatus(() => onSubmit({ ...formData, quantity: 0 }), {
      savingTitle: t("productForm.addingProduct"),
      savingMessage: t("dialog.saving.message"),
      successTitle: t("dialog.success.title"),
      successMessage: t("productForm.productAdded"),
      errorTitle: t("dialog.error.title"),
    })

    // Reset form on success
    if (saveStatus.status === "success") {
      setFormData({
        name: "",
        type: "",
        quantity: 0,
        price: 0,
      })
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

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
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Product Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.type}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="price">{t("productForm.price")} (Rp) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1000"
              placeholder={t("form.enterPrice")}
              value={formData.price || ""}
              onChange={(e) => {
                const inputValue = Number.parseFloat(e.target.value) || 0
                handleInputChange("price", inputValue)
              }}
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.price}
              </p>
            )}
          </div>
        </div>

        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Product Name:</span>
                <p className="text-gray-900">{formData.name || "Not specified"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <p className="text-gray-900">{formData.type || "Not selected"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Price:</span>
                <p className="text-gray-900 font-semibold">{formatCurrency(formData.price, language)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saveStatus.status === "saving"} className="flex-1 md:flex-none">
            {saveStatus.status === "saving" ? "Adding Product..." : "Add Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({ name: "", type: "", quantity: 0, price: 0 })
              setErrors({})
            }}
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  )
}
