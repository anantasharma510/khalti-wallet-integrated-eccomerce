"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Mail, Calendar, Shield, Phone, Trash2 } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  role: string
  isActive?: boolean
  createdAt: string
  phone?: string
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Unwrap params using React.use()
  const { id } = use(params)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?message=You must be logged in to access this page")
      } else if (user.role !== "admin") {
        router.push("/login?message=You must be an admin to access this page")
      } else {
        fetchUser()
      }
    }
  }, [user, loading, router, id])

  const fetchUser = async () => {
    try {
      setUserLoading(true)
      setError("")
      const response = await fetch(`/api/admin/users/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/users")
          return
        }
        throw new Error("Failed to fetch user")
      }
      
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error("Error fetching user:", error)
      setError("Failed to load user details")
    } finally {
      setUserLoading(false)
    }
  }

  const updateUserRole = async (role: string) => {
    if (!userData) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/users/${userData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update user")
      }

      setUserData({ ...userData, role })
      alert("User role updated successfully!")
    } catch (error) {
      console.error("Error updating user:", error)
      alert(error instanceof Error ? error.message : "Failed to update user")
    } finally {
      setUpdating(false)
    }
  }

  const deleteUser = async () => {
    if (!userData) return

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/users/${userData._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete user")
      }

      alert("User deleted successfully!")
      router.push("/admin/users")
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(error instanceof Error ? error.message : "Failed to delete user")
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleBadgeColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
  }

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin" || !userData) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-gray-600">User ID: {userData._id}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Role:</span>
                <Badge className={getRoleBadgeColor(userData.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {userData.role}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{userData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{userData.email}</span>
              </div>
              {userData.phone && (
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{userData.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Joined:</span>
                <span>{formatDate(userData.createdAt)}</span>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Update Role</h4>
                <Select
                  value={userData.role}
                  onValueChange={updateUserRole}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">User Management</h4>
                <div className="space-y-2">
                  <Button
                    variant="destructive"
                    onClick={deleteUser}
                    disabled={deleting}
                    className="w-full"
                  >
                    {deleting ? (
                      "Deleting..."
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">User Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {formatDate(userData.createdAt)}</span>
                  </div>
                  {userData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{userData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
} 