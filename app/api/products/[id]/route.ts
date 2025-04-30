import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { uploadImage } from "@/lib/upload"

// Get a single product
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const product = await db.collection("products").findOne({
      _id: new ObjectId(params.id),
    })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 })
  }
}

// Update a product (admin only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const stock = Number.parseInt(formData.get("stock") as string)
    const image = formData.get("image") as File | null

    if (!name || !description || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Update object
    const updateData: any = {
      name,
      description,
      price,
      stock,
    }

    // Upload new image if provided
    if (image) {
      updateData.imageUrl = await uploadImage(image)
    }

    const result = await db.collection("products").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
  }
}

// Delete a product (admin only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 })
  }
}
