import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { isFirstUser } from "@/lib/schema"
import type { NextRequest } from "next/server"

// Helper function to handle file upload with multer
const handleUpload = async (request: NextRequest) => {
  try {
    // Convert NextRequest to NodeJS request for multer
    const formData = await request.formData()

    // Extract form fields
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phone = formData.get("phone") as string
    const image = formData.get("image") as File | null

    // Process image if provided
    let imageUrl = ""
    if (image) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate a unique filename
      const filename = `${Date.now()}-${image.name.replace(/\s/g, "-")}`
      const path = `public/uploads/${filename}`

      // Save the file
      const fs = require("fs")
      await fs.promises.mkdir("public/uploads", { recursive: true })
      await fs.promises.writeFile(path, buffer)

      imageUrl = `/uploads/${filename}`
    }

    return { name, email, password, phone, imageUrl }
  } catch (error) {
    console.error("Upload error:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle file upload and form data
    const { name, email, password, phone, imageUrl } = await handleUpload(request)

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if this is the first user (will be admin)
    const firstUser = await isFirstUser()
    const role = firstUser ? "admin" : "buyer"

    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      phone,
      imageUrl,
      role,
      createdAt: new Date(),
    }

    const result = await db.collection("users").insertOne(user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "User created successfully",
      user: { ...userWithoutPassword, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "An error occurred during signup" }, { status: 500 })
  }
}
