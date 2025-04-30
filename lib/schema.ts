import type { ObjectId } from "mongodb"
import { connectToDatabase } from "./mongodb"

// Define database schema types
export interface UserSchema {
  _id?: ObjectId
  name: string
  email: string
  password: string
  phone: string
  imageUrl?: string
  role: "admin" | "buyer"
  createdAt: Date
}

export interface ProductSchema {
  _id?: ObjectId
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  createdAt: Date
}

export interface CartSchema {
  _id?: ObjectId
  userId: string
  items: {
    productId: string
    quantity: number
  }[]
  updatedAt: Date
}

export interface OrderSchema {
  _id?: ObjectId
  userId: string
  items: {
    productId: string
    name: string
    price: number
    quantity: number
  }[]
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  shippingAddress?: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  paymentInfo?: {
    method: "khalti" | "cash_on_delivery" | "bank_transfer"
    status: "pending" | "completed" | "failed | sucessful"
    transactionId?: string
    paidAt?: Date
  }
}

export interface PaymentSchema {
  _id?: ObjectId
  orderId: string
  userId: string
  amount: number
  method: "khalti" | "cash_on_delivery" | "bank_transfer"
  status: "pending" | "completed" | "failed"
  transactionId?: string
  khaltiData?: {
    pidx?: string
    payment_url?: string
    expires_at?: Date
    purchase_order_id?: string
    purchase_order_name?: string
  }
  createdAt: Date
  updatedAt?: Date
}

// Initialize database with collections and indexes
export async function initializeDatabase() {
  const { db } = await connectToDatabase()

  // Create collections if they don't exist
  const collections = await db.listCollections().toArray()
  const collectionNames = collections.map((c) => c.name)

  if (!collectionNames.includes("users")) {
    await db.createCollection("users")
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
  }

  if (!collectionNames.includes("products")) {
    await db.createCollection("products")
    await db.collection("products").createIndex({ name: 1 })
  }

  if (!collectionNames.includes("orders")) {
    await db.createCollection("orders")
    await db.collection("orders").createIndex({ userId: 1 })
  }

  if (!collectionNames.includes("carts")) {
    await db.createCollection("carts")
    await db.collection("carts").createIndex({ userId: 1 }, { unique: true })
  }

  if (!collectionNames.includes("payments")) {
    await db.createCollection("payments")
    await db.collection("payments").createIndex({ orderId: 1 })
    await db.collection("payments").createIndex({ userId: 1 })
  }

  console.log("Database initialized successfully")
}

// Check if any users exist in the database
export async function isFirstUser(): Promise<boolean> {
  const { db } = await connectToDatabase()
  const count = await db.collection("users").countDocuments({})
  return count === 0
}
