"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { AdminLayout } from "@/components/admin/AdminLayout"
import AdminOrdersList from "@/components/admin/AdminOrdersList"

export default function AdminOrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?message=You must be logged in to access this page")
      } else if (user.role !== "admin") {
        router.push("/login?message=You must be an admin to access this page")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <AdminLayout>
      <AdminOrdersList />
    </AdminLayout>
  )
} 