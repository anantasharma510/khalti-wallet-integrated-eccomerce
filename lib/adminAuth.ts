import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function checkAdminAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) }
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string
      email: string
      role: string
    }

    if (decoded.role !== "admin") {
      return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) }
    }

    return { user: decoded }
  } catch (error) {
    return { error: NextResponse.json({ message: "Invalid token" }, { status: 401 }) }
  }
} 