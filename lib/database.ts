import { supabase, isSupabaseConfigured } from "./supabase"
import type { Database } from "./supabase"

type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"]
type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"]

type Product = Database["public"]["Tables"]["products"]["Row"]
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]

// Mock data for when Supabase is not configured
const mockTransactions: (Transaction & { date: Date; createdAt: Date })[] = [
  {
    id: "1",
    date: new Date("2024-12-15"),
    item_purchased: "Wireless Headphones",
    customer_name: "John Smith",
    store_name: "Tech Store Downtown",
    payment_method: "Credit Card",
    purchase_price: 1125000,
    selling_price: 1499850,
    revenue: 374850,
    notes: "Customer was very satisfied with the product",
    month: 12,
    year: 2024,
    created_at: "2024-12-15T00:00:00Z",
    updated_at: "2024-12-15T00:00:00Z",
    createdAt: new Date("2024-12-15"),
  },
  {
    id: "2",
    date: new Date("2024-12-16"),
    item_purchased: "Coffee Mug",
    customer_name: "Sarah Johnson",
    store_name: "Home Goods Plus",
    payment_method: "Cash",
    purchase_price: 127500,
    selling_price: 194850,
    revenue: 67350,
    notes: "Part of a bulk order",
    month: 12,
    year: 2024,
    created_at: "2024-12-16T00:00:00Z",
    updated_at: "2024-12-16T00:00:00Z",
    createdAt: new Date("2024-12-16"),
  },
]

const mockProducts: (Product & { createdAt: Date })[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    type: "Electronics",
    price: 1499850,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Coffee Mug",
    type: "Kitchenware",
    price: 194850,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    name: "Notebook",
    type: "Stationery",
    price: 49950,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    createdAt: new Date("2024-01-03"),
  },
]

// Transaction methods
export const transactionService = {
  // Get transactions by month and year
  async getByMonth(month: number, year: number) {
    if (!isSupabaseConfigured) {
      // Return mock data filtered by month and year
      return mockTransactions.filter((t) => t.month === month && t.year === year)
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("month", month.toString()) // Convert to string for comparison
        .eq("year", year.toString()) // Convert to string for comparison
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching transactions:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("Raw Supabase data:", data) // Debug log

      return data.map((transaction) => ({
        ...transaction,
        // Ensure proper data types
        id: transaction.id.toString(),
        date: new Date(transaction.date),
        createdAt: new Date(transaction.created_at),
        month: Number.parseInt(transaction.month.toString()),
        year: Number.parseInt(transaction.year.toString()),
        purchase_price: Number(transaction.purchase_price),
        selling_price: Number(transaction.selling_price),
        revenue: Number(transaction.revenue || transaction.selling_price - transaction.purchase_price),
      }))
    } catch (err) {
      console.error("Error in getByMonth:", err)
      throw err
    }
  },

  // Get all transactions
  async getAll() {
    if (!isSupabaseConfigured) {
      return mockTransactions
    }

    try {
      const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false })

      if (error) {
        console.error("Error fetching all transactions:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data.map((transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
        createdAt: new Date(transaction.created_at),
      }))
    } catch (err) {
      console.error("Error in getAll:", err)
      throw err
    }
  },

  // Create new transaction
  async create(transaction: Omit<TransactionInsert, "id" | "created_at" | "updated_at">) {
    if (!isSupabaseConfigured) {
      // Create mock transaction
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        date: new Date(transaction.date),
        createdAt: new Date(),
      }
      mockTransactions.unshift(newTransaction)
      return newTransaction
    }

    try {
      // Ensure the transaction data matches the database schema
      const formattedTransaction = {
        date: transaction.date,
        item_purchased: transaction.item_purchased,
        customer_name: transaction.customer_name,
        store_name: transaction.store_name,
        payment_method: transaction.payment_method,
        purchase_price: transaction.purchase_price,
        selling_price: transaction.selling_price,
        revenue: transaction.revenue,
        notes: transaction.notes,
        month: transaction.month,
        year: transaction.year,
      }

      const { data, error } = await supabase.from("transactions").insert([formattedTransaction]).select().single()

      if (error) {
        console.error("Error creating transaction:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return {
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.created_at),
      }
    } catch (err) {
      console.error("Error in create:", err)
      throw err
    }
  },

  // Update transaction
  async update(id: string, updates: TransactionUpdate) {
    if (!isSupabaseConfigured) {
      // Update mock transaction
      const index = mockTransactions.findIndex((t) => t.id === id)
      if (index !== -1) {
        mockTransactions[index] = { ...mockTransactions[index], ...updates }
        return mockTransactions[index]
      }
      throw new Error("Transaction not found")
    }

    try {
      const { data, error } = await supabase.from("transactions").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating transaction:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return {
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.created_at),
      }
    } catch (err) {
      console.error("Error in update:", err)
      throw err
    }
  },

  // Delete transaction
  async delete(id: string) {
    if (!isSupabaseConfigured) {
      // Delete from mock data
      const index = mockTransactions.findIndex((t) => t.id === id)
      if (index !== -1) {
        mockTransactions.splice(index, 1)
      }
      return
    }

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id)

      if (error) {
        console.error("Error deleting transaction:", error)
        throw new Error(`Database error: ${error.message}`)
      }
    } catch (err) {
      console.error("Error in delete:", err)
      throw err
    }
  },

  // Bulk create transactions
  async createMany(transactions: Omit<TransactionInsert, "id" | "created_at" | "updated_at">[]) {
    if (!isSupabaseConfigured) {
      // Create mock transactions
      const newTransactions = transactions.map((t, index) => ({
        ...t,
        id: (Date.now() + index).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        date: new Date(t.date),
        createdAt: new Date(),
      }))
      mockTransactions.unshift(...newTransactions)
      return newTransactions
    }

    try {
      // Map the data to match database column names
      const formattedTransactions = transactions.map((t) => ({
        date: t.date,
        item_purchased: t.item_purchased,
        customer_name: t.customer_name,
        store_name: t.store_name,
        payment_method: t.payment_method,
        purchase_price: t.purchase_price,
        selling_price: t.selling_price,
        revenue: t.revenue,
        notes: t.notes,
        month: t.month,
        year: t.year,
      }))

      const { data, error } = await supabase.from("transactions").insert(formattedTransactions).select()

      if (error) {
        console.error("Error creating bulk transactions:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data.map((transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
        createdAt: new Date(transaction.created_at),
      }))
    } catch (err) {
      console.error("Error in createMany:", err)
      throw err
    }
  },

  // Get statistics for a specific month
  async getMonthStats(month: number, year: number) {
    if (!isSupabaseConfigured) {
      // Calculate stats from mock data
      const data = mockTransactions.filter((t) => t.month === month && t.year === year)
      const totalTransactions = data.length
      const totalRevenue = data.reduce((sum, t) => sum + t.revenue, 0)
      const totalSales = data.reduce((sum, t) => sum + t.selling_price, 0)
      const averageRevenue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      return {
        totalTransactions,
        totalRevenue,
        totalSales,
        averageRevenue,
      }
    }

    try {
      // Get all transactions for stats calculation with string comparison
      const { data: allData, error: allError } = await supabase
        .from("transactions")
        .select("*")
        .eq("month", month.toString()) // Convert to string for comparison
        .eq("year", year.toString()) // Convert to string for comparison

      if (allError) {
        console.error("Error fetching all month stats:", allError)
        throw new Error(`Database error: ${allError.message}`)
      }

      console.log("Stats data:", allData) // Debug log

      const totalTransactions = allData.length

      const totalRevenue = allData.reduce((sum, t) => {
        const revenue = Number(t.revenue) || Number(t.selling_price) - Number(t.purchase_price) || 0
        return sum + revenue
      }, 0)

      const totalSales = allData.reduce((sum, t) => {
        const sellingPrice = Number(t.selling_price) || 0
        return sum + sellingPrice
      }, 0)

      const averageRevenue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      return {
        totalTransactions,
        totalRevenue,
        totalSales,
        averageRevenue,
      }
    } catch (err) {
      console.error("Error in getMonthStats:", err)
      throw err
    }
  },
}

// Product methods
export const productService = {
  // Get all products
  async getAll() {
    if (!isSupabaseConfigured) {
      return mockProducts
    }

    try {
      const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true })

      if (error) {
        console.error("Error fetching products:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data.map((product) => ({
        ...product,
        createdAt: new Date(product.created_at),
      }))
    } catch (err) {
      console.error("Error in products getAll:", err)
      throw err
    }
  },

  // Create new product
  async create(product: Omit<ProductInsert, "id" | "created_at" | "updated_at">) {
    if (!isSupabaseConfigured) {
      // Create mock product
      const newProduct = {
        ...product,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        createdAt: new Date(),
      }
      mockProducts.unshift(newProduct)
      return newProduct
    }

    try {
      const { data, error } = await supabase.from("products").insert([product]).select().single()

      if (error) {
        if (error.code === "23505" && error.message.includes("product")) {
          throw new Error("A product with this name already exists")
        }
        console.error("Error creating product:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
      }
    } catch (err) {
      console.error("Error in products create:", err)
      throw err
    }
  },

  // Bulk create products
  async createMany(products: Omit<ProductInsert, "id" | "created_at" | "updated_at">[]) {
    if (!isSupabaseConfigured) {
      // Create mock products
      const newProducts = products.map((p, index) => ({
        ...p,
        id: (Date.now() + index).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        createdAt: new Date(),
      }))
      mockProducts.unshift(...newProducts)
      return { created: newProducts, duplicates: [] }
    }

    try {
      const seenNames = new Set<string>()
      const uniqueProducts: typeof products = []
      const batchDuplicates: string[] = []

      for (const product of products) {
        if (seenNames.has(product.name)) {
          batchDuplicates.push(product.name)
        } else {
          seenNames.add(product.name)
          uniqueProducts.push(product)
        }
      }

      // Check for existing products in database
      const productNames = uniqueProducts.map((p) => p.name)
      const { data: existingProducts } = await supabase.from("products").select("name").in("name", productNames)

      const existingNames = new Set(existingProducts?.map((p) => p.name) || [])
      const newProducts = uniqueProducts.filter((p) => !existingNames.has(p.name))
      const dbDuplicates = uniqueProducts.filter((p) => existingNames.has(p.name)).map((p) => p.name)

      const allDuplicates = [...batchDuplicates, ...dbDuplicates]

      if (newProducts.length === 0) {
        return { created: [], duplicates: allDuplicates }
      }

      const { data, error } = await supabase.from("products").insert(newProducts).select()

      if (error) {
        if (error.code === "23505") {
          console.error("Unique constraint violation:", error)
          throw new Error("A product with this name already exists")
        }
        console.error("Error creating bulk products:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return {
        created: data.map((product) => ({
          ...product,
          createdAt: new Date(product.created_at),
        })),
        duplicates: allDuplicates,
      }
    } catch (err) {
      console.error("Error in products createMany:", err)
      throw err
    }
  },

  // Update product
  async update(id: string, updates: ProductUpdate) {
    if (!isSupabaseConfigured) {
      // Update mock product
      const index = mockProducts.findIndex((p) => p.id === id)
      if (index !== -1) {
        mockProducts[index] = { ...mockProducts[index], ...updates }
        return mockProducts[index]
      }
      throw new Error("Product not found")
    }

    try {
      const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating product:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
      }
    } catch (err) {
      console.error("Error in products update:", err)
      throw err
    }
  },

  // Delete product
  async delete(id: string) {
    if (!isSupabaseConfigured) {
      // Delete from mock data
      const index = mockProducts.findIndex((p) => p.id === id)
      if (index !== -1) {
        mockProducts.splice(index, 1)
      }
      return
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        console.error("Error deleting product:", error)
        throw new Error(`Database error: ${error.message}`)
      }
    } catch (err) {
      console.error("Error in products delete:", err)
      throw err
    }
  },

  // Bulk delete products
  async deleteMany(ids: string[]) {
    if (!isSupabaseConfigured) {
      // Delete from mock data
      ids.forEach((id) => {
        const index = mockProducts.findIndex((p) => p.id === id)
        if (index !== -1) {
          mockProducts.splice(index, 1)
        }
      })
      return
    }

    try {
      const { error } = await supabase.from("products").delete().in("id", ids)

      if (error) {
        console.error("Error deleting products:", error)
        throw new Error(`Database error: ${error.message}`)
      }
    } catch (err) {
      console.error("Error in products deleteMany:", err)
      throw err
    }
  },
}
