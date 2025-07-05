"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { AdminLayout } from "@/components/admin/AdminLayout"
import EditProductForm from "@/components/admin/EditProductForm"
import type { Product } from "@/lib/types"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [productLoading, setProductLoading] = useState(true)
  
  // Unwrap params using React.use()
  const { id } = use(params)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?message=You must be logged in to access this page")
      } else if (user.role !== "admin") {
        router.push("/login?message=You must be an admin to access this page")
      } else {
        fetchProduct()
      }
    }
  }, [user, loading, router, id])

  const fetchProduct = async () => {
    try {
      setProductLoading(true)
      const response = await fetch(`/api/products/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/products")
          return
        }
        throw new Error("Failed to fetch product")
      }
      
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error("Error fetching product:", error)
      router.push("/admin/products")
    } finally {
      setProductLoading(false)
    }
  }

  if (loading || productLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin" || !product) {
    return null
  }

  return (
    <AdminLayout>
      <EditProductForm product={product} />
    </AdminLayout>
  )
}
