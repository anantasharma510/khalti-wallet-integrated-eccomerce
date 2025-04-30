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
    }

    // Extract data from the incoming request
    const { amount, purchaseOrderId, purchaseOrderName, customerInfo } = await request.json()

    if (!amount || !purchaseOrderId || !purchaseOrderName || !customerInfo) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create the payload for Khalti API
    const payload = {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-success`,
      website_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      amount: Math.round(amount * 100), // Convert to paisa (500 NPR -> 50000 paisa)
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
      customer_info: customerInfo,
    }

    // Log the request payload for debugging
    console.log("Request Payload:", JSON.stringify(payload, null, 2))

    // Get the Khalti key
    const khaltiKey = process.env.KHALTI_SECRET_KEY || ""

    if (!khaltiKey) {
      console.error("Secret key is missing in the environment variables.")
      return NextResponse.json({ error: "Missing secret key" }, { status: 500 })
    }

    // Send the POST request to Khalti API
    const khaltiResponse = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
      method: "POST",
      headers: {
        Authorization: `Key ${khaltiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const khaltiData = await khaltiResponse.json()

    // Log response data for debugging
    console.log("Khalti API Response:", khaltiData)

    if (!khaltiResponse.ok) {
      console.error("Khalti error:", khaltiData)
      return NextResponse.json(
        {
          error: `Failed to initiate payment: ${khaltiData.detail || "Unknown error"}`,
          khaltiError: khaltiData,
        },
        { status: 500 },
      )
    }

    // If successful, save payment information to database
    const { db } = await connectToDatabase()

    const payment = {
      orderId: purchaseOrderId,
      userId: decoded.userId,
      amount,
      method: "khalti",
      status: "pending",
      khaltiData: {
        pidx: khaltiData.pidx,
        payment_url: khaltiData.payment_url,
        expires_at: new Date(khaltiData.expires_at),
      },
      createdAt: new Date(),
    }

    await db.collection("payments").insertOne(payment)

    // Update order with payment information
    await db.collection("orders").updateOne(
      { _id: new ObjectId(purchaseOrderId) },
      {
        $set: {
          "paymentInfo.khaltiData": {
            pidx: khaltiData.pidx,
          },
        },
      },
    )

    // Return the payment URL from Khalti response
    return NextResponse.json({
      payment_url: khaltiData.payment_url,
      pidx: khaltiData.pidx,
    })
  } catch (error) {
    console.error("Error initiating payment:", error)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}
