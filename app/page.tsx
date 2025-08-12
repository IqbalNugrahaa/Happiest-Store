"use client"

import { useState } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionTable } from "@/components/transaction-table"
import { ExcelUpload } from "@/components/excel-upload"
import { ProductForm } from "@/components/product-form"
import { ProductTable } from "@/components/product-table"
import { MonthSelector } from "@/components/month-selector"
import { Sidebar } from "@/components/sidebar"
import { MobileMenu } from "@/components/mobile-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import { LanguageSwitch } from "@/components/language-switch"
import { formatCurrency } from "@/utils/currency"
import { useTransactions } from "@/hooks/use-transactions"
import { useProducts } from "@/hooks/use-products"
import { useMonthStats } from "@/hooks/use-month-stats"
import { SupabaseStatus } from "@/components/supabase-status"
import { ProductExcelUpload } from "@/components/product-excel-upload"

export interface Transaction {
  id: string
  date: Date
  itemPurchased: string
  customerName: string
  storeName: string
  paymentMethod: string
  purchasePrice: number
  sellingPrice: number
  revenue: number
  notes: string
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  type: string
  quantity: number
  price: number
  createdAt: Date
}

export default function MonthlyRecapSystem() {
  return (
    <LanguageProvider>
      <MonthlyRecapContent />
    </LanguageProvider>
  )
}

function MonthlyRecapContent() {
  const { t, language } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [activeTab, setActiveTab] = useState("transactions")

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    addTransaction,
    addBulkTransactions,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(selectedMonth, selectedYear)

  const {
    products,
    loading: productsLoading,
    error: productsError,
    addProduct,
    addBulkProducts,
    updateProduct,
    deleteProduct,
    deleteBulkProducts, // Add bulk delete from hook
  } = useProducts()

  const { stats, loading: statsLoading, error: statsError } = useMonthStats(selectedMonth, selectedYear)

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  const handleAddTransaction = async (transactionData: Omit<Transaction, "id" | "createdAt" | "revenue">) => {
    const revenue = transactionData.sellingPrice - transactionData.purchasePrice
    await addTransaction({
      date: transactionData.date.toISOString().split("T")[0],
      item_purchased: transactionData.itemPurchased,
      customer_name: transactionData.customerName,
      store_name: transactionData.storeName,
      payment_method: transactionData.paymentMethod,
      purchase_price: transactionData.purchasePrice,
      selling_price: transactionData.sellingPrice,
      revenue,
      notes: transactionData.notes || null,
      month: transactionData.date.getMonth() + 1,
      year: transactionData.date.getFullYear(),
    })
  }

  const handleBulkUpload = async (newTransactions: Omit<Transaction, "id" | "createdAt">[]) => {
    const formattedTransactions = newTransactions.map((t) => ({
      date: t.date.toISOString().split("T")[0],
      item_purchased: t.itemPurchased,
      customer_name: t.customerName,
      store_name: t.storeName,
      payment_method: t.paymentMethod,
      purchase_price: t.purchasePrice,
      selling_price: t.sellingPrice,
      revenue: t.revenue,
      notes: t.notes || null,
      month: t.date.getMonth() + 1,
      year: t.date.getFullYear(),
    }))

    await addBulkTransactions(formattedTransactions)
  }

  const handleUpdateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
    const updates: any = {}

    if (updatedData.itemPurchased) updates.item_purchased = updatedData.itemPurchased
    if (updatedData.customerName) updates.customer_name = updatedData.customerName
    if (updatedData.storeName) updates.store_name = updatedData.storeName
    if (updatedData.paymentMethod) updates.payment_method = updatedData.paymentMethod
    if (updatedData.purchasePrice !== undefined) updates.purchase_price = updatedData.purchasePrice
    if (updatedData.sellingPrice !== undefined) updates.selling_price = updatedData.sellingPrice
    if (updatedData.notes !== undefined) updates.notes = updatedData.notes
    if (updatedData.date) updates.date = updatedData.date.toISOString().split("T")[0]

    if (updatedData.purchasePrice !== undefined || updatedData.sellingPrice !== undefined) {
      const transaction = transactions.find((t) => t.id === id)
      if (transaction) {
        const purchasePrice = updatedData.purchasePrice ?? transaction.purchasePrice
        const sellingPrice = updatedData.sellingPrice ?? transaction.sellingPrice
        updates.revenue = sellingPrice - purchasePrice
      }
    }

    await updateTransaction(id, updates)
  }

  const handleAddProduct = async (productData: Omit<Product, "id" | "createdAt">) => {
    await addProduct(productData)
  }

  const handleBulkProductUpload = async (newProducts: Omit<Product, "id" | "createdAt">[]) => {
    await addBulkProducts(newProducts)
  }

  const handleUpdateProduct = async (id: string, updatedData: Partial<Product>) => {
    await updateProduct(id, updatedData)
  }

  const handleBulkDeleteProducts = async (ids: string[]) => {
    await deleteBulkProducts(ids)
  }

  const getMonthName = (month: number) => {
    const months =
      language === "id"
        ? [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
          ]
        : [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ]
    return months[month - 1]
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-3">
            <MobileMenu activeTab={activeTab} onTabChange={setActiveTab} />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Happiest Store</h1>
              <p className="text-gray-600 text-sm md:text-base">
                {t("header.subtitle")} {getMonthName(selectedMonth)} {selectedYear}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <LanguageSwitch />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-6">
            <MonthSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={handleMonthChange}
            />

            <SupabaseStatus />

            {transactionsError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{transactionsError}</AlertDescription>
              </Alert>
            )}

            {productsError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{productsError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("stats.totalTransactions")}</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalTransactions}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("stats.totalTransactionsDesc")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("stats.totalRevenue")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      formatCurrency(stats.totalRevenue, language)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("stats.totalRevenueDesc")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("stats.totalSales")}</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      formatCurrency(stats.totalSales, language)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("stats.totalSalesDesc")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("stats.avgRevenue")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      formatCurrency(stats.averageRevenue, language)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("stats.avgRevenueDesc")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {activeTab === "transactions" && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("card.transactionHistory")}</CardTitle>
                    <CardDescription>
                      {t("card.transactionHistoryDesc")} - {getMonthName(selectedMonth)} {selectedYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">{t("loading.transactions")}</span>
                      </div>
                    ) : (
                      <TransactionTable
                        transactions={transactions.map((t) => ({
                          ...t,
                          itemPurchased: t.item_purchased,
                          customerName: t.customer_name,
                          storeName: t.store_name,
                          paymentMethod: t.payment_method,
                          purchasePrice: t.purchase_price,
                          sellingPrice: t.selling_price,
                        }))}
                        onUpdate={handleUpdateTransaction}
                        onDelete={deleteTransaction}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === "add-transaction" && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("card.addNewTransaction")}</CardTitle>
                    <CardDescription>
                      {t("card.addNewTransactionDesc")} - {getMonthName(selectedMonth)} {selectedYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {productsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">{t("loading.products")}</span>
                      </div>
                    ) : (
                      <TransactionForm onSubmit={handleAddTransaction} products={products} />
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === "bulk-upload" && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("card.bulkUploadTransactions")}</CardTitle>
                    <CardDescription>{t("card.bulkUploadTransactionsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExcelUpload onUpload={handleBulkUpload} />
                  </CardContent>
                </Card>
              )}

              {activeTab === "products" && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("card.productInventory")}</CardTitle>
                    <CardDescription>{t("card.productInventoryDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {productsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">{t("loading.products")}</span>
                      </div>
                    ) : (
                      <ProductTable
                        products={products}
                        onUpdate={handleUpdateProduct}
                        onDelete={deleteProduct}
                        onBulkDelete={handleBulkDeleteProducts} // Add bulk delete prop
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === "add-product" && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("card.addNewProduct")}</CardTitle>
                    <CardDescription>{t("card.addNewProductDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProductForm onSubmit={handleAddProduct} />
                  </CardContent>
                </Card>
              )}

              {activeTab === "bulk-product-upload" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Product Upload</CardTitle>
                    <CardDescription>Upload multiple products at once using Excel or CSV files</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProductExcelUpload onUpload={handleBulkProductUpload} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
