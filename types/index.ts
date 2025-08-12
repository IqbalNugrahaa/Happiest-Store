export interface Product {
  id: string
  name: string
  type: string
  price: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  date: string
  item_purchased: string
  customer_name: string
  store_name: string
  payment_method: string
  purchase_price: number
  selling_price: number
  revenue: number
  notes?: string
  month: number
  year: number
  created_at: string
  updated_at: string
}

export interface MonthStats {
  totalRevenue: number
  totalTransactions: number
  averageRevenue: number
  topProduct: string
}
