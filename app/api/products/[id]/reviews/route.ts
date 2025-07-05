import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

// Get reviews for a product
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    console.log("Fetching reviews for product:", id)

    // Get all reviews for this product
    const reviews = await db.collection("reviews")
      .find({ productId: id })
      .sort({ createdAt: -1 })
      .toArray()

    console.log("Raw reviews found:", reviews.length)

    if (reviews.length === 0) {
      return NextResponse.json([])
    }

    // Get user data for all reviews
    const userIds = [...new Set(reviews.map(review => review.userId))]
    const users = await db.collection("users")
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .toArray()

    // Create a map of userId to user data
    const userMap = new Map()
    users.forEach(user => {
      userMap.set(user._id.toString(), user)
    })

    // Combine reviews with user data
    const reviewsWithUsers = reviews.map(review => {
      const user = userMap.get(review.userId)
      return {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: user ? {
          name: user.name,
          _id: user._id.toString()
        } : {
          name: "Unknown User",
          _id: review.userId
        }
      }
    })

    console.log("Reviews with user data:", reviewsWithUsers.length)
    return NextResponse.json(reviewsWithUsers)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ message: "Failed to fetch reviews" }, { status: 500 })
  }
}

// Add a review for a product
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string
      email: string
      role: string
    }

    const { db } = await connectToDatabase()
    const { id } = await params
    const { rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ message: "Comment must be at least 10 characters" }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    // Check if user has purchased this product
    const order = await db.collection("orders").findOne({
      userId: decoded.userId,
      "items.productId": id,
      status: { $in: ["shipped", "delivered"] }
    })

    if (!order) {
      return NextResponse.json({ message: "You can only review products you have purchased" }, { status: 403 })
    }

    // Check if user has already reviewed this product
    const existingReview = await db.collection("reviews").findOne({
      userId: decoded.userId,
      productId: id
    })

    if (existingReview) {
      return NextResponse.json({ message: "You have already reviewed this product" }, { status: 400 })
    }

    // Create the review
    const review = {
      productId: id,
      userId: decoded.userId,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date()
    }

    const result = await db.collection("reviews").insertOne(review)

    // Update product average rating
    const productReviews = await db.collection("reviews").find({ productId: id }).toArray()
    const averageRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length

    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: { averageRating: Math.round(averageRating * 10) / 10 } }
    )

    return NextResponse.json({
      message: "Review added successfully",
      review: { ...review, _id: result.insertedId }
    })
  } catch (error) {
    console.error("Error adding review:", error)
    return NextResponse.json({ message: "Failed to add review" }, { status: 500 })
  }
} 