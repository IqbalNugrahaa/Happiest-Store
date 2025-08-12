"use client"

import { useState } from "react"
import type { Transaction } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Search, Filter, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { formatCurrency } from "@/utils/currency"

interface TransactionTableProps {
  transactions: Transaction[]
  onUpdate: (id: string, updatedData: Partial<Transaction>) => void
  onDelete: (id: string) => void
}

export function TransactionTable({ transactions, onUpdate, onDelete }: TransactionTableProps) {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPayment, setFilterPayment] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Transaction>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const paymentMethods = Array.from(new Set(transactions.map((t) => t.paymentMethod)))

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.itemPurchased.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.storeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPayment = filterPayment === "all" || transaction.paymentMethod === filterPayment
    return matchesSearch && matchesPayment
  })

  const totalPages = Math.ceil(filteredTransactions.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (value: string) => {
    setFilterPayment(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setEditData({
      itemPurchased: transaction.itemPurchased,
      customerName: transaction.customerName,
      storeName: transaction.storeName,
      paymentMethod: transaction.paymentMethod,
      purchasePrice: transaction.purchasePrice,
      sellingPrice: transaction.sellingPrice,
      notes: transaction.notes,
    })
  }

  const handleSave = (id: string) => {
    onUpdate(id, editData)
    setEditingId(null)
    setEditData({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const getProfitStatus = (revenue: number) => {
    if (revenue > 0) return { label: t("status.profit"), variant: "default" as const, icon: TrendingUp }
    if (revenue < 0) return { label: t("status.loss"), variant: "destructive" as const, icon: TrendingDown }
    return { label: t("status.breakEven"), variant: "secondary" as const, icon: TrendingUp }
  }

  const formatDate = (date: Date) => {
    const months =
      language === "id"
        ? ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const day = date.getDate().toString().padStart(2, "0")
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t("search.searchTransactions")}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={filterPayment} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("search.filterByPayment")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allPaymentMethods")}</SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600">
          {t("table.showing")} {startIndex + 1} {t("table.to")} {Math.min(endIndex, filteredTransactions.length)}{" "}
          {t("table.of")} {filteredTransactions.length} {t("table.transactions")}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.date")}</TableHead>
                <TableHead>{t("table.item")}</TableHead>
                <TableHead>{t("table.customer")}</TableHead>
                <TableHead>{t("table.store")}</TableHead>
                <TableHead>{t("table.payment")}</TableHead>
                <TableHead>{t("table.purchase")}</TableHead>
                <TableHead>{t("table.selling")}</TableHead>
                <TableHead>{t("table.revenue")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.notes")}</TableHead>
                <TableHead className="text-right">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    {t("table.noTransactions")}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => {
                  const profitStatus = getProfitStatus(transaction.revenue)
                  const ProfitIcon = profitStatus.icon

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm font-medium">{formatDate(transaction.date)}</TableCell>
                      <TableCell className="font-medium">
                        {editingId === transaction.id ? (
                          <Input
                            value={editData.itemPurchased || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, itemPurchased: e.target.value }))}
                            className="w-full min-w-[120px]"
                          />
                        ) : (
                          <div className="max-w-[120px] truncate" title={transaction.itemPurchased}>
                            {transaction.itemPurchased}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === transaction.id ? (
                          <Input
                            value={editData.customerName || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, customerName: e.target.value }))}
                            className="w-full min-w-[100px]"
                          />
                        ) : (
                          <div className="max-w-[100px] truncate" title={transaction.customerName}>
                            {transaction.customerName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === transaction.id ? (
                          <Input
                            value={editData.storeName || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, storeName: e.target.value }))}
                            className="w-full min-w-[100px]"
                          />
                        ) : (
                          <div className="max-w-[100px] truncate" title={transaction.storeName}>
                            {transaction.storeName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === transaction.id ? (
                          <Select
                            value={editData.paymentMethod || ""}
                            onValueChange={(value) => setEditData((prev) => ({ ...prev, paymentMethod: value }))}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">{transaction.paymentMethod}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === transaction.id ? (
                          <Input
                            type="number"
                            min="0"
                            step="1000"
                            value={editData.purchasePrice || 0}
                            onChange={(e) => {
                              const inputValue = Number.parseFloat(e.target.value) || 0
                              setEditData((prev) => ({ ...prev, purchasePrice: inputValue }))
                            }}
                            className="w-24"
                          />
                        ) : (
                          formatCurrency(transaction.purchasePrice, language)
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === transaction.id ? (
                          <Input
                            type="number"
                            min="0"
                            step="1000"
                            value={editData.sellingPrice || 0}
                            onChange={(e) => {
                              const inputValue = Number.parseFloat(e.target.value) || 0
                              setEditData((prev) => ({ ...prev, sellingPrice: inputValue }))
                            }}
                            className="w-24"
                          />
                        ) : (
                          formatCurrency(transaction.sellingPrice, language)
                        )}
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${transaction.revenue >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(transaction.revenue, language)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={profitStatus.variant} className="flex items-center gap-1 w-fit">
                          <ProfitIcon className="h-3 w-3" />
                          {profitStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingId === transaction.id ? (
                          <Input
                            value={editData.notes || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, notes: e.target.value }))}
                            className="w-full min-w-[100px]"
                            placeholder="Notes..."
                          />
                        ) : (
                          <div className="max-w-[100px] truncate text-sm text-gray-600" title={transaction.notes}>
                            {transaction.notes || "—"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {editingId === transaction.id ? (
                            <>
                              <Button size="sm" onClick={() => handleSave(transaction.id)}>
                                {t("table.save")}
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                {t("table.cancel")}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(transaction)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("delete.transactionTitle")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("delete.transactionMessage")} "{transaction.itemPurchased}"?{" "}
                                      {t("delete.undoWarning")}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onDelete(transaction.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {t("delete.confirm")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
