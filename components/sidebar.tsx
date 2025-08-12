"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Receipt, Plus, Upload, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [transactionExpanded, setTransactionExpanded] = useState(true)
  const [productExpanded, setProductExpanded] = useState(true)
  const { t } = useLanguage()

  const transactionItems = [
    {
      id: "transactions",
      label: t("nav.transactions"),
      icon: Receipt,
    },
    {
      id: "add-transaction",
      label: t("nav.addTransaction"),
      icon: Plus,
    },
    {
      id: "bulk-upload",
      label: t("nav.bulkUpload"),
      icon: Upload,
    },
  ]

  const productItems = [
    {
      id: "products",
      label: t("nav.products"),
      icon: Package,
    },
    {
      id: "add-product",
      label: t("nav.addProduct"),
      icon: Plus,
    },
    {
      id: "bulk-product-upload",
      label: "Bulk Product Upload",
      icon: Upload,
    },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-center">
          <div className="relative w-full h-20 rounded-lg overflow-hidden">
            <Image src="/images/logo.jpg" alt="Happiest Store East 2024" fill className="object-cover" priority />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-4">
        {/* Transaction Section */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setTransactionExpanded(!transactionExpanded)}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("nav.transactions")}
            </div>
            {transactionExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          {transactionExpanded && (
            <div className="ml-4 space-y-1">
              {transactionItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-9 text-sm",
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-gray-50"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setProductExpanded(!productExpanded)}
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("nav.products")}
            </div>
            {productExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          {productExpanded && (
            <div className="ml-4 space-y-1">
              {productItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-9 text-sm",
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-gray-50"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
