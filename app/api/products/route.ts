import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { uploadImage } from "@/lib/uploadImage"
import { checkAdminAuth } from "@/lib/adminAuth"

// Get all products
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const products = await db.collection("products").find({}).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}

// Create a new product (admin only)
export async function POST(request: Request) {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) {
      return authResult.error
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const stock = Number.parseInt(formData.get("stock") as string)
    const image = formData.get("image") as File

    if (!name || !description || isNaN(price) || isNaN(stock) || !image) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Upload image
    const imageUrl = await uploadImage(image)

    // Create product
    const product = {
      name,
      description,
      price,
      stock,
      imageUrl,
      createdAt: new Date(),
    }

    const result = await db.collection("products").insertOne(product)

    return NextResponse.json({
      message: "Product created successfully",
      product: { ...product, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
  }
}
