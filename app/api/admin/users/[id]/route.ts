import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import { checkAdminAuth } from "@/lib/adminAuth"

// Get specific user details
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) {
      return authResult.error
    }

    const { db } = await connectToDatabase()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(params.id) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 })
  }
}

// Update user role or status
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) {
      return authResult.error
    }

    const { role, isActive } = await request.json()

    if (role && !["user", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // Build update object
    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 })
    }

    updateData.updatedAt = new Date()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 })
  }
}

// Delete user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) {
      return authResult.error
    }

    const { db } = await connectToDatabase()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // Don't allow admin to delete themselves
    if (params.id === authResult.user?.userId) {
      return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 })
    }

    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 })
  }
} 