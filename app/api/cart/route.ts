import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server"

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = await cookies()
    let token = cookieStore.get("auth-token")?.value

    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ items: [] })
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
        userId: string
        email: string
        role: string
      }

      const { db } = await connectToDatabase()

      // Get user's cart
      const cart = await db.collection("carts").findOne({ userId: decoded.userId })

      // If no cart exists, return empty items array
      if (!cart) {
        return NextResponse.json({ items: [] })
      }

      // Ensure cart.items exists
      const cartItems = cart.items || []

      // Get product details for each item in the cart
      const productIds = cartItems.map((item: { productId: string }) => new ObjectId(item.productId))

      const products =
        productIds.length > 0
          ? await db
              .collection("products")
              .find({ _id: { $in: productIds } })
              .toArray()
          : []

      // Map products to cart items
      const mappedCartItems = cartItems
        .map((item: { productId: string; quantity: number }) => {
          const product = products.find((p) => p._id.toString() === item.productId)
          return {
            product: product
              ? {
                  ...product,
                  _id: product._id.toString(),
                }
              : null,
            quantity: item.quantity,
          }
        })
        .filter((item: { product: any }) => item.product !== null)

      return NextResponse.json({ items: mappedCartItems })
    } catch (error) {
      // If token verification fails, return empty cart
      return NextResponse.json({ items: [] })
    }
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ items: [] })
  }
}

// Update user's cart
export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = await cookies()
    let token = cookieStore.get("auth-token")?.value

    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    let decoded
    try {
      decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
        userId: string
        email: string
        role: string
      }
    } catch (error) {
      return NextResponse.json({ message: "Invalid authentication token" }, { status: 401 })
    }

    const body = await request.json()
    const { action, productId, quantity } = body

    if (!action) {
      return NextResponse.json({ message: "Action is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user's cart or create a new one
    const cart = await db.collection("carts").findOne({ userId: decoded.userId })

    // Initialize cart object with default values
    const cartData = {
      userId: decoded.userId,
      items: [] as Array<{ productId: string; quantity: number }>,
      updatedAt: new Date(),
    }

    // If cart exists, use its items or initialize empty array
    if (cart) {
      cartData.items = Array.isArray(cart.items) ? [...cart.items] : []
    }

    // Update cart based on action
    if (action === "add") {
      if (!productId) {
        return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
      }

      // Check if product exists
      const product = await db.collection("products").findOne({ _id: new ObjectId(productId) })
      if (!product) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 })
      }

      const itemIndex = cartData.items.findIndex((item) => item.productId === productId)

      if (itemIndex > -1) {
        // Item exists, update quantity
        cartData.items[itemIndex].quantity += quantity || 1
      } else {
        // Add new item
        cartData.items.push({
          productId,
          quantity: quantity || 1,
        })
      }
    } else if (action === "remove") {
      if (!productId) {
        return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
      }

      cartData.items = cartData.items.filter((item) => item.productId !== productId)
    } else if (action === "update") {
      if (!productId) {
        return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
      }

      if (quantity === undefined) {
        return NextResponse.json({ message: "Quantity is required" }, { status: 400 })
      }

      const itemIndex = cartData.items.findIndex((item) => item.productId === productId)

      if (itemIndex > -1) {
        // Update quantity
        cartData.items[itemIndex].quantity = quantity
      } else {
        return NextResponse.json({ message: "Product not found in cart" }, { status: 404 })
      }
    } else if (action === "clear") {
      cartData.items = []
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    // Save cart to database
    await db.collection("carts").updateOne({ userId: decoded.userId }, { $set: cartData }, { upsert: true })

    // Get product details for the updated cart
    const productIds = cartData.items.map((item) => new ObjectId(item.productId))

    const products =
      productIds.length > 0
        ? await db
            .collection("products")
            .find({ _id: { $in: productIds } })
            .toArray()
        : []

    // Map products to cart items for response
    const mappedCartItems = cartData.items
      .map((item) => {
        const product = products.find((p) => p._id.toString() === item.productId)
        return {
          product: product
            ? {
                ...product,
                _id: product._id.toString(),
              }
            : null,
          quantity: item.quantity,
        }
      })
      .filter((item) => item.product !== null)

    return NextResponse.json({
      message: "Cart updated successfully",
      items: mappedCartItems,
    })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ message: "Failed to update cart" }, { status: 500 })
  }
}
