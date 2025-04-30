import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    // Try to get token from cookie first
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

    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ message: "Authentication failed" }, { status: 401 })
  }
}
