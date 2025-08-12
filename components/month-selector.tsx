"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from "@/contexts/language-context"

interface MonthSelectorProps {
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number, year: number) => void
}

export function MonthSelector({ selectedMonth, selectedYear, onMonthChange }: MonthSelectorProps) {
  const { t, language } = useLanguage()
  
  const months = [
    { value: 1, label: language === 'id' ? 'Januari' : 'January' },
    { value: 2, label: language === 'id' ? 'Februari' : 'February' },
    { value: 3, label: language === 'id' ? 'Maret' : 'March' },
    { value: 4, label: language === 'id' ? 'April' : 'April' },
    { value: 5, label: language === 'id' ? 'Mei' : 'May' },
    { value: 6, label: language === 'id' ? 'Juni' : 'June' },
    { value: 7, label: language === 'id' ? 'Juli' : 'July' },
    { value: 8, label: language === 'id' ? 'Agustus' : 'August' },
    { value: 9, label: language === 'id' ? 'September' : 'September' },
    { value: 10, label: language === 'id' ? 'Oktober' : 'October' },
    { value: 11, label: language === 'id' ? 'November' : 'November' },
    { value: 12, label: language === 'id' ? 'Desember' : 'December' }
  ]

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(12, selectedYear - 1)
    } else {
      onMonthChange(selectedMonth - 1, selectedYear)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onMonthChange(1, selectedYear + 1)
    } else {
      onMonthChange(selectedMonth + 1, selectedYear)
    }
  }

  const currentMonth = months.find(m => m.value === selectedMonth)

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Calendar className="h-5 w-5" />
          {t('monthSelector.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Current Selection Display */}
          <div className="flex items-center gap-4 flex-1 justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {currentMonth?.label}
              </div>
              <div className="text-lg font-semibold text-blue-700">
                {selectedYear}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dropdown Selectors */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => onMonthChange(parseInt(value), selectedYear)}
            >
              <SelectTrigger className="border-blue-300">
                <SelectValue placeholder={t('monthSelector.selectMonth')} />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => onMonthChange(selectedMonth, parseInt(value))}
            >
              <SelectTrigger className="border-blue-300">
                <SelectValue placeholder={t('monthSelector.selectYear')} />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date()
              onMonthChange(now.getMonth() + 1, now.getFullYear())
            }}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {t('monthSelector.currentMonth')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const lastMonth = new Date()
              lastMonth.setMonth(lastMonth.getMonth() - 1)
              onMonthChange(lastMonth.getMonth() + 1, lastMonth.getFullYear())
            }}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {t('monthSelector.lastMonth')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
