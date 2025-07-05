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

    // Get all orders with user information
    const orders = await db
      .collection("orders")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            orderNumber: 1,
            customerInfo: 1,
            items: 1,
            totalAmount: 1,
            status: 1,
            createdAt: 1,
            shippingAddress: 1,
            paymentInfo: 1,
            "user.name": 1,
            "user.email": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 })
  }
} 