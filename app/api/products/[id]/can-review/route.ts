import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ canReview: false, hasReviewed: false, message: "Not authenticated" })
    }

    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string
      email: string
      role: string
    }

    const { db } = await connectToDatabase()
    const { id } = await params

    console.log("Can-review check for user:", decoded.userId, "product:", id)

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ canReview: false, hasReviewed: false, message: "Invalid product ID" })
    }

    // Check if user has purchased this product
    const order = await db.collection("orders").findOne({
      userId: decoded.userId,
      "items.productId": id,
      status: { $in: ["shipped", "delivered"] }
    })

    console.log("Order found:", !!order)

    if (!order) {
      return NextResponse.json({ 
        canReview: false, 
        hasReviewed: false, 
        message: "You can only review products you have purchased" 
      })
    }

    // Check if user has already reviewed this product
    const existingReview = await db.collection("reviews").findOne({
      userId: decoded.userId,
      productId: id
    })

    console.log("Existing review found:", !!existingReview)

    if (existingReview) {
      return NextResponse.json({ 
        canReview: false, 
        hasReviewed: true, 
        message: "You have already reviewed this product" 
      })
    }

    return NextResponse.json({ 
      canReview: true, 
      hasReviewed: false, 
      message: "You can review this product" 
    })
  } catch (error) {
    console.error("Error checking review status:", error)
    return NextResponse.json({ 
      canReview: false, 
      hasReviewed: false, 
      message: "Failed to check review status" 
    }, { status: 500 })
  }
} 