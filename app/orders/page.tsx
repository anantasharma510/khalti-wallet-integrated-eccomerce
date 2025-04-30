import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { getUserOrders } from "@/lib/orders"
import OrderHistory from "@/components/OrderHistory"

export default async function OrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login?message=You must be logged in to view your orders")
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string
      email: string
      role: string
    }

    const orders = await getUserOrders(decoded.userId)

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Your Order History</h1>
        <OrderHistory orders={orders} />
      </div>
    )
  } catch (error) {
    redirect("/login?message=Authentication failed")
  }
}
