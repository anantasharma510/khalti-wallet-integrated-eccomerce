import { NextResponse } from "next/server"
import { sendPasswordResetEmail } from "@/lib/email"

export async function GET() {
  try {
    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ 
        status: "error",
        message: "Email configuration missing",
        emailUser: !!process.env.EMAIL_USER,
        emailPass: !!process.env.EMAIL_PASS
      }, { status: 400 })
    }

    // Test sending an email
    const testEmail = process.env.EMAIL_USER
    const testToken = "test-token-123"
    
    const emailResult = await sendPasswordResetEmail(testEmail, testToken)

    if (emailResult.success) {
      return NextResponse.json({ 
        status: "success",
        message: "Email configuration is working! Test email sent.",
        emailUser: process.env.EMAIL_USER
      })
    } else {
      return NextResponse.json({ 
        status: "error",
        message: "Failed to send test email",
        error: emailResult.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Email config test error:", error)
    return NextResponse.json({ 
      status: "error",
      message: "An error occurred while testing email configuration",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 