export function formatCurrency(amount: number, language: 'en' | 'id' = 'en'): string {
  // Indonesian Rupiah formatting
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(amount: number, language: 'en' | 'id' = 'en'): string {
  if (language === 'id') {
    // Indonesian number formatting
    return new Intl.NumberFormat('id-ID').format(amount)
  } else {
    // English number formatting
    return new Intl.NumberFormat('en-US').format(amount)
  }
}

// Currency symbol helper - always Rupiah
export function getCurrencySymbol(language: 'en' | 'id' = 'en'): string {
  return 'Rp'
}

// Get the appropriate input step for currency inputs - always Rupiah step
export function getCurrencyStep(language: 'en' | 'id' = 'en'): string {
  return "1000"
}

// No conversion needed - always store and display in IDR
export function convertToStorageAmount(inputAmount: number, language: 'en' | 'id' = 'en'): number {
  return inputAmount
}

// No conversion needed - always display in IDR
export function convertToDisplayAmount(storageAmount: number, language: 'en' | 'id' = 'en'): number {
  return storageAmount
}
