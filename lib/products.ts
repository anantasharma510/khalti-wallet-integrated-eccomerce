import { connectToDatabase } from "./mongodb"
import type { Product } from "./types"
import { ObjectId } from "mongodb"

export async function getProducts(): Promise<Product[]> {
  const { db } = await connectToDatabase()

  const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray()

  return JSON.parse(JSON.stringify(products))
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { db } = await connectToDatabase()

    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
    })

    if (!product) {
      return null
    }

    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}
