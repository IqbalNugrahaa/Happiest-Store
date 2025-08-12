"use client"

import { useState, useEffect } from "react"
import { productService } from "@/lib/database"
import type { Database } from "@/lib/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  createdAt: Date
}

type ProductInsert = Omit<Database["public"]["Tables"]["products"]["Insert"], "id" | "created_at" | "updated_at">

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all products
  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getAll()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
      console.error("Error loading products:", err)
    } finally {
      setLoading(false)
    }
  }

  // Add new product
  const addProduct = async (productData: ProductInsert) => {
    try {
      const newProduct = await productService.create(productData)
      setProducts((prev) => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product")
      throw err
    }
  }

  const addBulkProducts = async (
    productsData: ProductInsert[],
  ): Promise<{ created: number; skipped: number; duplicates: string[] }> => {
    try {
      const result = await productService.createMany(productsData)

      // Update the products list with newly created products
      if (result.created.length > 0) {
        setProducts((prev) => [...result.created, ...prev])
      }

      return {
        created: result.created.length,
        skipped: result.duplicates.length,
        duplicates: result.duplicates,
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add products")
      throw err
    }
  }

  // Update product
  const updateProduct = async (id: string, updates: Partial<ProductInsert>) => {
    try {
      const updatedProduct = await productService.update(id, updates)
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)))
      return updatedProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product")
      throw err
    }
  }

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product")
      throw err
    }
  }

  const deleteBulkProducts = async (ids: string[]) => {
    try {
      await productService.deleteMany(ids)
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete products")
      throw err
    }
  }

  // Load products on mount
  useEffect(() => {
    loadProducts()
  }, [])

  return {
    products,
    loading,
    error,
    addProduct,
    addBulkProducts,
    updateProduct,
    deleteProduct,
    deleteBulkProducts,
    refetch: loadProducts,
  }
}
