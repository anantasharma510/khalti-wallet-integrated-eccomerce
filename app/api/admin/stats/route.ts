import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { checkAdminAuth } from "@/lib/adminAuth"

export async function GET() {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) {
      return authResult.error
    }

    const { db } = await connectToDatabase()

    // Get counts
    const [totalProducts, totalOrders, totalUsers] = await Promise.all([
      db.collection("products").countDocuments(),
      db.collection("orders").countDocuments(),
      db.collection("users").countDocuments(),
    ])

    // Get recent orders (last 5)
    const recentOrders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      recentOrders,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 })
  }
} 