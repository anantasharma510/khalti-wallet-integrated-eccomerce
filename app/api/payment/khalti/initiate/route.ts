import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server"

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

    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string
      email: string
      role: string
      name: string
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get order details
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    if (order.userId !== decoded.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user details
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Prepare Khalti payment request
    const khaltiPayload = {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success`,
      website_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      amount: Math.round(order.totalAmount * 100), // Convert to paisa (Khalti uses paisa)
      purchase_order_id: orderId,
      purchase_order_name: `Order #${orderId.substring(0, 8)}`,
      customer_info: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    }

    console.log("Khalti payload:", khaltiPayload)

    // Get the Khalti key
    const khaltiKey = process.env.KHALTI_SECRET_KEY || ""
    console.log("Khalti key length:", khaltiKey.length)
    console.log("Khalti key first 4 chars:", khaltiKey.substring(0, 4))

    if (!khaltiKey) {
      return NextResponse.json({ message: "Khalti API key is not configured" }, { status: 500 })
    }

    // Make request to Khalti API
    const khaltiResponse = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
      method: "POST",
      headers: {
        Authorization: `Key ${khaltiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(khaltiPayload),
    })

    const khaltiData = await khaltiResponse.json()

    if (!khaltiResponse.ok) {
      console.error("Khalti error:", khaltiData)
      return NextResponse.json(
        {
          message: `Failed to initiate payment: ${khaltiData.detail || "Unknown error"}`,
          error: khaltiData,
        },
        { status: 500 },
      )
    }

    // Save payment information
    const payment = {
      orderId,
      userId: decoded.userId,
      amount: order.totalAmount,
      method: "khalti",
      status: "pending",
      khaltiData: {
        pidx: khaltiData.pidx,
        payment_url: khaltiData.payment_url,
        expires_at: new Date(khaltiData.expires_at),
        purchase_order_id: orderId,
        purchase_order_name: `Order #${orderId.substring(0, 8)}`,
      },
      createdAt: new Date(),
    }

    await db.collection("payments").insertOne(payment)

    // Update order with payment information
    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentInfo: {
            method: "khalti",
            status: "pending",
            khaltiData: {
              pidx: khaltiData.pidx,
            },
          },
        },
      },
    )

    return NextResponse.json({
      message: "Payment initiated successfully",
      payment_url: khaltiData.payment_url,
      pidx: khaltiData.pidx,
    })
  } catch (error) {
    console.error("Error initiating payment:", error)
    return NextResponse.json({ message: "Failed to initiate payment" }, { status: 500 })
  }
}
