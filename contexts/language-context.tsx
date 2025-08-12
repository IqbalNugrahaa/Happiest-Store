"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'id'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Header
    'header.title': 'Monthly Business Recap',
    'header.subtitle': 'Track your sales transactions for',
    
    // Navigation
    'nav.transactions': 'All Transactions',
    'nav.addTransaction': 'Add Transaction',
    'nav.bulkUpload': 'Bulk Upload',
    'nav.products': 'Products',
    'nav.addProduct': 'Add Product',
    
    // Stats Cards
    'stats.totalTransactions': 'Total Transactions',
    'stats.totalTransactionsDesc': 'Sales recorded this month',
    'stats.totalRevenue': 'Total Revenue',
    'stats.totalRevenueDesc': 'Net profit this month',
    'stats.totalSales': 'Total Sales',
    'stats.totalSalesDesc': 'Gross sales amount',
    'stats.avgRevenue': 'Avg Revenue',
    'stats.avgRevenueDesc': 'Per transaction',
    
    // Transaction Form
    'form.transactionDate': 'Transaction Date',
    'form.itemPurchased': 'Item Purchased',
    'form.customerName': 'Customer Name',
    'form.storeName': 'Store Name',
    'form.paymentMethod': 'Payment Method',
    'form.purchasePrice': 'Purchase Price',
    'form.sellingPrice': 'Selling Price',
    'form.notes': 'Notes',
    'form.required': 'required',
    'form.autoFilled': 'Auto-filled',
    'form.searchProduct': 'Search for a product...',
    'form.noProductsFound': 'No products found',
    'form.enterCustomerName': 'Enter customer name',
    'form.enterStoreName': 'Enter store name',
    'form.selectPaymentMethod': 'Select payment method',
    'form.enterPurchasePrice': 'Enter purchase price',
    'form.enterSellingPrice': 'Enter selling price',
    'form.addNotes': 'Add any additional notes about this transaction...',
    'form.transactionSummary': 'Transaction Summary',
    'form.revenue': 'Revenue',
    'form.profitMargin': 'Profit Margin',
    'form.recordTransaction': 'Record Transaction',
    'form.recordingTransaction': 'Recording Transaction...',
    'form.clearForm': 'Clear Form',
    'form.transactionRecorded': 'Transaction recorded successfully!',
    'form.purchasePriceLabel': 'Purchase Price (Rp)',
    'form.sellingPriceLabel': 'Selling Price (Rp)',
    
    // Product Form
    'productForm.productName': 'Product Name',
    'productForm.productType': 'Product Type',
    'productForm.quantity': 'Quantity',
    'productForm.price': 'Price',
    'form.enterQuantity': 'Enter quantity',
    'form.enterPrice': 'Enter price',
    'productForm.enterProductName': 'Enter product name',
    'productForm.selectProductType': 'Select product type',
    'productForm.totalValue': 'Total Value',
    'productForm.addProduct': 'Add Product',
    'productForm.addingProduct': 'Adding Product...',
    'productForm.productAdded': 'Product added successfully!',
    'productForm.notSpecified': 'Not specified',
    'productForm.notSelected': 'Not selected',
    'productForm.units': 'units',
    'productForm.priceLabel': 'Price (Rp)',
    
    // Tables
    'table.date': 'Date',
    'table.item': 'Item',
    'table.customer': 'Customer',
    'table.store': 'Store',
    'table.payment': 'Payment',
    'table.purchase': 'Purchase',
    'table.selling': 'Selling',
    'table.revenue': 'Revenue',
    'table.status': 'Status',
    'table.notes': 'Notes',
    'table.actions': 'Actions',
    'table.productName': 'Product Name',
    'table.type': 'Type',
    'table.quantity': 'Quantity',
    'table.price': 'Price',
    'table.totalValue': 'Total Value',
    'table.added': 'Added',
    'table.save': 'Save',
    'table.cancel': 'Cancel',
    'table.edit': 'Edit',
    'table.delete': 'Delete',
    'table.showing': 'Showing',
    'table.of': 'of',
    'table.transactions': 'transactions',
    'table.products': 'products',
    'table.noTransactions': 'No transactions found matching your criteria',
    'table.noProducts': 'No products found matching your criteria',
    
    // Status
    'status.profit': 'Profit',
    'status.loss': 'Loss',
    'status.breakEven': 'Break Even',
    'status.inStock': 'In Stock',
    'status.lowStock': 'Low Stock',
    'status.outOfStock': 'Out of Stock',
    
    // Search and Filter
    'search.searchTransactions': 'Search transactions...',
    'search.searchProducts': 'Search products...',
    'search.filterByPayment': 'Filter by payment',
    'search.filterByType': 'Filter by type',
    'search.allPaymentMethods': 'All Payment Methods',
    'search.allTypes': 'All Types',
    
    // Excel Upload
    'excel.title': 'Excel Template',
    'excel.description': 'Download our template to ensure your data is formatted correctly',
    'excel.downloadTemplate': 'Download Template',
    'excel.requiredColumns': 'Required columns (in order):',
    'excel.uploadTitle': 'Upload Transactions',
    'excel.uploadDescription': 'Drag and drop your Excel/CSV file or click to browse',
    'excel.dropFile': 'Drop your file here, or click to browse',
    'excel.supportedFormats': 'Supports CSV, XLSX, and XLS files',
    'excel.chooseFile': 'Choose File',
    'excel.processing': 'Processing file...',
    'excel.previewData': 'Preview Data',
    'excel.reviewData': 'Review your data before importing.',
    'excel.validTransactions': 'valid',
    'excel.invalidTransactions': 'invalid transactions.',
    'excel.importTransactions': 'Import',
    'excel.transactions': 'Transactions',
    
    // Card Titles
    'card.transactionHistory': 'Transaction History',
    'card.transactionHistoryDesc': 'View and manage all your sales transactions',
    'card.addNewTransaction': 'Add New Transaction',
    'card.addNewTransactionDesc': 'Record a new sales transaction',
    'card.bulkUploadTransactions': 'Bulk Upload Transactions',
    'card.bulkUploadTransactionsDesc': 'Upload multiple transactions from an Excel file',
    'card.productInventory': 'Product Inventory',
    'card.productInventoryDesc': 'View and manage your product inventory',
    'card.addNewProduct': 'Add New Product',
    'card.addNewProductDesc': 'Record a new product in inventory',
    
    // Payment Methods
    'payment.cash': 'Cash',
    'payment.creditCard': 'Credit Card',
    'payment.debitCard': 'Debit Card',
    'payment.paypal': 'PayPal',
    'payment.bankTransfer': 'Bank Transfer',
    'payment.check': 'Check',
    'payment.mobilePayment': 'Mobile Payment',
    'payment.giftCard': 'Gift Card',
    
    // Product Types
    'productType.electronics': 'Electronics',
    'productType.clothing': 'Clothing',
    'productType.books': 'Books',
    'productType.homeGarden': 'Home & Garden',
    'productType.sports': 'Sports',
    'productType.toys': 'Toys',
    'productType.kitchenware': 'Kitchenware',
    'productType.stationery': 'Stationery',
    'productType.healthBeauty': 'Health & Beauty',
    'productType.automotive': 'Automotive',
    
    // Validation Errors
    'error.itemRequired': 'Item purchased is required',
    'error.customerRequired': 'Customer name is required',
    'error.storeRequired': 'Store name is required',
    'error.paymentRequired': 'Payment method is required',
    'error.purchasePriceInvalid': 'Purchase price must be greater than 0',
    'error.sellingPriceInvalid': 'Selling price must be greater than 0',
    'error.sellingPriceTooLow': 'Selling price should be higher than purchase price',
    'error.productNameRequired': 'Product name is required',
    'error.productTypeRequired': 'Product type is required',
    'error.quantityRequired': 'Quantity must be 0 or greater',
    'error.priceRequired': 'Price must be greater than 0',
    
    // Delete Confirmation
    'delete.transactionTitle': 'Delete Transaction',
    'delete.transactionMessage': 'Are you sure you want to delete this transaction for',
    'delete.productTitle': 'Delete Product',
    'delete.productMessage': 'Are you sure you want to delete',
    'delete.undoWarning': 'This action cannot be undone.',
    'delete.cancel': 'Cancel',
    'delete.confirm': 'Delete',
    
    // Language
    'language.switch': 'Language',
    'language.english': 'English',
    'language.indonesian': 'Bahasa Indonesia',
    
    // Currency
    'currency.symbol': 'Rp',
    'currency.name': 'IDR',

    // Month Selector
    'monthSelector.title': 'Select Month & Year',
    'monthSelector.selectMonth': 'Select month',
    'monthSelector.selectYear': 'Select year',
    'monthSelector.currentMonth': 'Current Month',
    'monthSelector.lastMonth': 'Last Month',

    // Loading and Error States
    'loading.transactions': 'Loading transactions...',
    'loading.products': 'Loading products...',
    'error.loadTransactions': 'Failed to load transactions',
    'error.loadProducts': 'Failed to load products',

    // Dialog Messages
    'dialog.saving.title': 'Saving Data',
    'dialog.saving.message': 'Please wait while we save your information...',
    'dialog.success.title': 'Success!',
    'dialog.success.message': 'Your data has been saved successfully.',
    'dialog.success.button': 'Continue',
    'dialog.error.title': 'Error',
    'dialog.error.message': 'Failed to save your data. Please try again.',
    'dialog.error.button': 'Try Again',
    'dialog.default.title': 'Information',
    'dialog.default.message': 'Operation completed.',
    'dialog.default.button': 'OK',
  },
  id: {
    // Header
    'header.title': 'Rekap Bisnis Bulanan',
    'header.subtitle': 'Lacak transaksi penjualan Anda untuk',
    
    // Navigation
    'nav.transactions': 'Semua Transaksi',
    'nav.addTransaction': 'Tambah Transaksi',
    'nav.bulkUpload': 'Unggah Massal',
    'nav.products': 'Produk',
    'nav.addProduct': 'Tambah Produk',
    
    // Stats Cards
    'stats.totalTransactions': 'Total Transaksi',
    'stats.totalTransactionsDesc': 'Penjualan tercatat bulan ini',
    'stats.totalRevenue': 'Total Pendapatan',
    'stats.totalRevenueDesc': 'Keuntungan bersih bulan ini',
    'stats.totalSales': 'Total Penjualan',
    'stats.totalSalesDesc': 'Jumlah penjualan kotor',
    'stats.avgRevenue': 'Rata-rata Pendapatan',
    'stats.avgRevenueDesc': 'Per transaksi',
    
    // Transaction Form
    'form.transactionDate': 'Tanggal Transaksi',
    'form.itemPurchased': 'Barang Dibeli',
    'form.customerName': 'Nama Pelanggan',
    'form.storeName': 'Nama Toko',
    'form.paymentMethod': 'Metode Pembayaran',
    'form.purchasePrice': 'Harga Beli',
    'form.sellingPrice': 'Harga Jual',
    'form.notes': 'Catatan',
    'form.required': 'wajib',
    'form.autoFilled': 'Terisi otomatis',
    'form.searchProduct': 'Cari produk...',
    'form.noProductsFound': 'Tidak ada produk ditemukan',
    'form.enterCustomerName': 'Masukkan nama pelanggan',
    'form.enterStoreName': 'Masukkan nama toko',
    'form.selectPaymentMethod': 'Pilih metode pembayaran',
    'form.enterPurchasePrice': 'Masukkan harga beli',
    'form.enterSellingPrice': 'Masukkan harga jual',
    'form.addNotes': 'Tambahkan catatan tambahan tentang transaksi ini...',
    'form.transactionSummary': 'Ringkasan Transaksi',
    'form.revenue': 'Pendapatan',
    'form.profitMargin': 'Margin Keuntungan',
    'form.recordTransaction': 'Catat Transaksi',
    'form.recordingTransaction': 'Mencatat Transaksi...',
    'form.clearForm': 'Bersihkan Form',
    'form.transactionRecorded': 'Transaksi berhasil dicatat!',
    'form.purchasePriceLabel': 'Harga Beli (Rp)',
    'form.sellingPriceLabel': 'Harga Jual (Rp)',
    
    // Product Form
    'productForm.productName': 'Nama Produk',
    'productForm.productType': 'Jenis Produk',
    'productForm.quantity': 'Jumlah',
    'productForm.price': 'Harga',
    'form.enterPrice': 'Masukkan harga',
    'productForm.enterProductName': 'Masukkan nama produk',
    'productForm.selectProductType': 'Pilih jenis produk',
    'productForm.enterQuantity': 'Masukkan jumlah',
    'productForm.totalValue': 'Total Nilai',
    'productForm.addProduct': 'Tambah Produk',
    'productForm.addingProduct': 'Menambah Produk...',
    'productForm.productAdded': 'Produk berhasil ditambahkan!',
    'productForm.notSpecified': 'Tidak ditentukan',
    'productForm.notSelected': 'Tidak dipilih',
    'productForm.units': 'unit',
    'productForm.priceLabel': 'Harga (Rp)',
    
    // Tables
    'table.date': 'Tanggal',
    'table.item': 'Barang',
    'table.customer': 'Pelanggan',
    'table.store': 'Toko',
    'table.payment': 'Pembayaran',
    'table.purchase': 'Beli',
    'table.selling': 'Jual',
    'table.revenue': 'Pendapatan',
    'table.status': 'Status',
    'table.notes': 'Catatan',
    'table.actions': 'Aksi',
    'table.productName': 'Nama Produk',
    'table.type': 'Jenis',
    'table.quantity': 'Jumlah',
    'table.price': 'Harga',
    'table.totalValue': 'Total Nilai',
    'table.added': 'Ditambahkan',
    'table.save': 'Simpan',
    'table.cancel': 'Batal',
    'table.edit': 'Edit',
    'table.delete': 'Hapus',
    'table.showing': 'Menampilkan',
    'table.of': 'dari',
    'table.transactions': 'transaksi',
    'table.products': 'produk',
    'table.noTransactions': 'Tidak ada transaksi yang sesuai dengan kriteria Anda',
    'table.noProducts': 'Tidak ada produk yang sesuai dengan kriteria Anda',
    
    // Status
    'status.profit': 'Untung',
    'status.loss': 'Rugi',
    'status.breakEven': 'Impas',
    'status.inStock': 'Tersedia',
    'status.lowStock': 'Stok Rendah',
    'status.outOfStock': 'Habis',
    
    // Search and Filter
    'search.searchTransactions': 'Cari transaksi...',
    'search.searchProducts': 'Cari produk...',
    'search.filterByPayment': 'Filter berdasarkan pembayaran',
    'search.filterByType': 'Filter berdasarkan jenis',
    'search.allPaymentMethods': 'Semua Metode Pembayaran',
    'search.allTypes': 'Semua Jenis',
    
    // Excel Upload
    'excel.title': 'Template Excel',
    'excel.description': 'Unduh template kami untuk memastikan data Anda diformat dengan benar',
    'excel.downloadTemplate': 'Unduh Template',
    'excel.requiredColumns': 'Kolom yang diperlukan (berurutan):',
    'excel.uploadTitle': 'Unggah Transaksi',
    'excel.uploadDescription': 'Seret dan lepas file Excel/CSV Anda atau klik untuk menjelajah',
    'excel.dropFile': 'Lepas file Anda di sini, atau klik untuk menjelajah',
    'excel.supportedFormats': 'Mendukung file CSV, XLSX, dan XLS',
    'excel.chooseFile': 'Pilih File',
    'excel.processing': 'Memproses file...',
    'excel.previewData': 'Pratinjau Data',
    'excel.reviewData': 'Tinjau data Anda sebelum mengimpor.',
    'excel.validTransactions': 'valid',
    'excel.invalidTransactions': 'transaksi tidak valid.',
    'excel.importTransactions': 'Impor',
    'excel.transactions': 'Transaksi',
    
    // Card Titles
    'card.transactionHistory': 'Riwayat Transaksi',
    'card.transactionHistoryDesc': 'Lihat dan kelola semua transaksi penjualan Anda',
    'card.addNewTransaction': 'Tambah Transaksi Baru',
    'card.addNewTransactionDesc': 'Catat transaksi penjualan baru',
    'card.bulkUploadTransactions': 'Unggah Transaksi Massal',
    'card.bulkUploadTransactionsDesc': 'Unggah beberapa transaksi dari file Excel',
    'card.productInventory': 'Inventaris Produk',
    'card.productInventoryDesc': 'Lihat dan kelola inventaris produk Anda',
    'card.addNewProduct': 'Tambah Produk Baru',
    'card.addNewProductDesc': 'Catat produk baru dalam inventaris',
    
    // Payment Methods
    'payment.cash': 'Tunai',
    'payment.creditCard': 'Kartu Kredit',
    'payment.debitCard': 'Kartu Debit',
    'payment.paypal': 'PayPal',
    'payment.bankTransfer': 'Transfer Bank',
    'payment.check': 'Cek',
    'payment.mobilePayment': 'Pembayaran Mobile',
    'payment.giftCard': 'Kartu Hadiah',
    
    // Product Types
    'productType.electronics': 'Elektronik',
    'productType.clothing': 'Pakaian',
    'productType.books': 'Buku',
    'productType.homeGarden': 'Rumah & Taman',
    'productType.sports': 'Olahraga',
    'productType.toys': 'Mainan',
    'productType.kitchenware': 'Peralatan Dapur',
    'productType.stationery': 'Alat Tulis',
    'productType.healthBeauty': 'Kesehatan & Kecantikan',
    'productType.automotive': 'Otomotif',
    
    // Validation Errors
    'error.itemRequired': 'Barang yang dibeli wajib diisi',
    'error.customerRequired': 'Nama pelanggan wajib diisi',
    'error.storeRequired': 'Nama toko wajib diisi',
    'error.paymentRequired': 'Metode pembayaran wajib dipilih',
    'error.purchasePriceInvalid': 'Harga beli harus lebih besar dari 0',
    'error.sellingPriceInvalid': 'Harga jual harus lebih besar dari 0',
    'error.sellingPriceTooLow': 'Harga jual harus lebih tinggi dari harga beli',
    'error.productNameRequired': 'Nama produk wajib diisi',
    'error.productTypeRequired': 'Jenis produk wajib dipilih',
    'error.quantityRequired': 'Jumlah harus 0 atau lebih',
    'error.priceRequired': 'Harga harus lebih besar dari 0',
    
    // Delete Confirmation
    'delete.transactionTitle': 'Hapus Transaksi',
    'delete.transactionMessage': 'Apakah Anda yakin ingin menghapus transaksi ini untuk',
    'delete.productTitle': 'Hapus Produk',
    'delete.productMessage': 'Apakah Anda yakin ingin menghapus',
    'delete.undoWarning': 'Tindakan ini tidak dapat dibatalkan.',
    'delete.cancel': 'Batal',
    'delete.confirm': 'Hapus',
    
    // Language
    'language.switch': 'Bahasa',
    'language.english': 'English',
    'language.indonesian': 'Bahasa Indonesia',
    
    // Currency
    'currency.symbol': 'Rp',
    'currency.name': 'IDR',

    // Month Selector
    'monthSelector.title': 'Pilih Bulan & Tahun',
    'monthSelector.selectMonth': 'Pilih bulan',
    'monthSelector.selectYear': 'Pilih tahun',
    'monthSelector.currentMonth': 'Bulan Ini',
    'monthSelector.lastMonth': 'Bulan Lalu',

    // Loading and Error States
    'loading.transactions': 'Memuat transaksi...',
    'loading.products': 'Memuat produk...',
    'error.loadTransactions': 'Gagal memuat transaksi',
    'error.loadProducts': 'Gagal memuat produk',

    // Dialog Messages
    'dialog.saving.title': 'Menyimpan Data',
    'dialog.saving.message': 'Mohon tunggu sementara kami menyimpan informasi Anda...',
    'dialog.success.title': 'Berhasil!',
    'dialog.success.message': 'Data Anda telah berhasil disimpan.',
    'dialog.success.button': 'Lanjutkan',
    'dialog.error.title': 'Error',
    'dialog.error.message': 'Gagal menyimpan data Anda. Silakan coba lagi.',
    'dialog.error.button': 'Coba Lagi',
    'dialog.default.title': 'Informasi',
    'dialog.default.message': 'Operasi selesai.',
    'dialog.default.button': 'OK',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
