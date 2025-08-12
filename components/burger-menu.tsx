"use client"

import { useState } from "react"
import { Menu, Receipt, Plus, Upload, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitch } from "@/components/language-switch"

interface BurgerMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BurgerMenu({ activeTab, onTabChange }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  const menuItems = [
    {
      id: "transactions",
      label: t("nav.transactions"),
      icon: Receipt,
      category: "transactions",
    },
    {
      id: "add-transaction",
      label: t("nav.addTransaction"),
      icon: Plus,
      category: "transactions",
    },
    {
      id: "bulk-upload",
      label: t("nav.bulkUpload"),
      icon: Upload,
      category: "transactions",
    },
    {
      id: "products",
      label: t("nav.products"),
      icon: Package,
      category: "products",
    },
    {
      id: "add-product",
      label: t("nav.addProduct"),
      icon: Plus,
      category: "products",
    },
    {
      id: "bulk-product-upload",
      label: "Bulk Product Upload",
      icon: Upload,
      category: "products",
    },
  ]

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId)
    setIsOpen(false)
  }

  const transactionItems = menuItems.filter((item) => item.category === "transactions")
  const productItems = menuItems.filter((item) => item.category === "products")

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

        <div className="py-6 space-y-6">
          {/* Transaction Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              <TrendingUp className="h-4 w-4" />
              {t("nav.transactions")}
            </div>
            <div className="space-y-1">
              {transactionItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start gap-3 h-11"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              <Package className="h-4 w-4" />
              {t("nav.products")}
            </div>
            <div className="space-y-1">
              {productItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start gap-3 h-11"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
