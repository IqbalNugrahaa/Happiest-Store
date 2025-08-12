"use client"

import { useState } from "react"
import { Menu, Receipt, Plus, Upload, Package, TrendingUp, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitch } from "@/components/language-switch"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileMenu({ activeTab, onTabChange }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden bg-transparent">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              {t("header.title")}
            </SheetTitle>
            <LanguageSwitch />
          </div>
        </SheetHeader>

        <div className="py-6 space-y-4">
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
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                      onClick={() => handleItemClick(item.id)}
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
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                      onClick={() => handleItemClick(item.id)}
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
      </SheetContent>
    </Sheet>
  )
}
