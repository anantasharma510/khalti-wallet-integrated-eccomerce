import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import type { Order } from "./types"

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { db } = await connectToDatabase()

    const orders = await db.collection("orders").find({ userId }).sort({ createdAt: -1 }).toArray()

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return []
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { db } = await connectToDatabase()

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
    })

    if (!order) {
      return null
    }

    return JSON.parse(JSON.stringify(order))
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}
