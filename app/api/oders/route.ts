import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = await cookies() // Await the promise to resolve cookies
    let token = cookieStore.get("auth-token")?.value // Now you can access the 'get' method

    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ message: "You must be logged in to checkout" }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string
      email: string
      role: string
      name: string
    }

    // Parse the request body
    const body = await request.json()
    const { items, shippingAddress, paymentMethod } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "No items in cart" }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ message: "Shipping address is required" }, { status: 400 })
    }

    if (!paymentMethod || !["khalti", "cash_on_delivery", "bank_transfer"].includes(paymentMethod)) {
      return NextResponse.json({ message: "Valid payment method is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user details
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify products and calculate total
    const productIds = items.map((item: any) => new ObjectId(item.product._id))
    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()

    // Check if all products exist and have enough stock
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.product._id)

      if (!product) {
        return NextResponse.json(
          {
            message: `Product ${item.product.name} not found`,
          },
          { status: 400 },
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
          },
          { status: 400 },
        )
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0)

    // Create order
    const order = {
      userId: decoded.userId,
      customerInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      items: items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      totalAmount,
      status: "pending",
      createdAt: new Date(),
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: "pending",
      },
    }

    const result = await db.collection("orders").insertOne(order)
    const orderId = result.insertedId.toString()

    // Update product stock
    for (const item of items) {
      await db
        .collection("products")
        .updateOne({ _id: new ObjectId(item.product._id) }, { $inc: { stock: -item.quantity } })
    }

    // Clear user's cart
    await db.collection("carts").updateOne({ userId: decoded.userId }, { $set: { items: [], updatedAt: new Date() } })

    return NextResponse.json({
      message: "Order placed successfully",
      orderId,
      paymentMethod,
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ message: "An error occurred during order creation" }, { status: 500 })
  }
}
