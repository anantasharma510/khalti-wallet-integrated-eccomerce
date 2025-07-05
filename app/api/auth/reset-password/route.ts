import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ 
        message: "Token and password are required" 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        message: "Password must be at least 6 characters long" 
      }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find user with valid reset token
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    })

    if (!user) {
      return NextResponse.json({ 
        message: "Invalid or expired reset token" 
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword 
        },
        $unset: { 
          resetToken: "",
          resetTokenExpiry: "" 
        }
      }
    )

    return NextResponse.json({ 
      message: "Password has been reset successfully" 
    })

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ 
      message: "An error occurred. Please try again." 
    }, { status: 500 })
  }
} 