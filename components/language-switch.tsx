"use client"

import { Globe } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"

const languages = [
  { code: 'en', name: 'language.english', flag: '🇺🇸' },
  { code: 'id', name: 'language.indonesian', flag: '🇮🇩' },
] as const

export function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage()
  
  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{t('language.switch')}</span>
          <span className="text-lg">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`flex items-center gap-3 ${
              language === lang.code ? 'bg-blue-50 text-blue-700' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{t(lang.name)}</span>
            {language === lang.code && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
