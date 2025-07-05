import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendPasswordResetEmail } from "@/lib/email"
import { generateResetToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set")
      return NextResponse.json({ 
        message: "Password reset service is not configured. Please contact support." 
      }, { status: 503 })
    }

    const { db } = await connectToDatabase()

    // Check if user exists
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Update user with reset token
    await db.collection("users").updateOne(
      { email },
      { 
        $set: { 
          resetToken,
          resetTokenExpiry 
        } 
      }
    )

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken)

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error)
      return NextResponse.json({ 
        message: "Failed to send password reset email. Please try again later." 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "If an account with that email exists, a password reset link has been sent." 
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ 
      message: "An error occurred. Please try again." 
    }, { status: 500 })
  }
} 