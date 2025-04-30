import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { pidx } = await request.json()

    if (!pidx) {
      return NextResponse.json({ message: "PIDX is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find payment by pidx
    const payment = await db.collection("payments").findOne({
      "khaltiData.pidx": pidx,
    })

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    // Get the Khalti key
    const khaltiKey = process.env.KHALTI_SECRET_KEY || ""

    if (!khaltiKey) {
      return NextResponse.json({ message: "Khalti API key is not configured" }, { status: 500 })
    }

    // Verify payment with Khalti
    const khaltiResponse = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        Authorization: `Key ${khaltiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    })

    const khaltiData = await khaltiResponse.json()

    if (!khaltiResponse.ok) {
      console.error("Khalti verification error:", khaltiData)
      return NextResponse.json(
        {
          message: `Failed to verify payment: ${khaltiData.detail || "Unknown error"}`,
          error: khaltiData,
        },
        { status: 500 },
      )
    }

    // Update payment status based on Khalti response
    const status = khaltiData.status === "Completed" ? "completed" : "failed"

    await db.collection("payments").updateOne(
      { _id: payment._id },
      {
        $set: {
          status,
          transactionId: khaltiData.transaction_id || null,
          updatedAt: new Date(),
          khaltiResponseData: khaltiData,
        },
      },
    )

    // Update order payment status
    await db.collection("orders").updateOne(
      { _id: new ObjectId(payment.orderId) },
      {
        $set: {
          "paymentInfo.status": status,
          "paymentInfo.transactionId": khaltiData.transaction_id || null,
          "paymentInfo.paidAt": status === "completed" ? new Date() : null,
          status: status === "completed" ? "processing" : "pending",
          "paymentInfo.khaltiResponseData": khaltiData,
        },
      },
    )

    return NextResponse.json({
      message: "Payment verification successful",
      status,
      orderId: payment.orderId,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ message: "Failed to verify payment" }, { status: 500 })
  }
}
