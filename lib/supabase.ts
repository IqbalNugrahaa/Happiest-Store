import { createClient } from '@supabase/supabase-js'

// Environment variables with proper Next.js naming
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging (remove in production)
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
  console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set')
}

// Create a mock client for development/preview when Supabase is not configured
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ error: null }),
    eq: function() { return this },
    order: function() { return this },
    single: function() { return this }
  })
})

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Disable auth for this demo
      }
    })
  : createMockClient() as any

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Test connection function
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('count', { count: 'exact', head: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Connection successful' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          date: string
          item_purchased: string
          customer_name: string
          store_name: string
          payment_method: string
          purchase_price: number
          selling_price: number
          revenue: number
          notes: string | null
          month: number
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          item_purchased: string
          customer_name: string
          store_name: string
          payment_method: string
          purchase_price: number
          selling_price: number
          revenue: number
          notes?: string | null
          month: number
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          item_purchased?: string
          customer_name?: string
          store_name?: string
          payment_method?: string
          purchase_price?: number
          selling_price?: number
          revenue?: number
          notes?: string | null
          month?: number
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          type: string
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          quantity: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
