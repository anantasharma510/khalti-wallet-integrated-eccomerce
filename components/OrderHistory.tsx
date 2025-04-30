import Link from "next/link"
import type { Order } from "@/lib/types"

export default function OrderHistory({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
        <Link href="/products" className="text-blue-600 hover:underline">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <table className="w-full">
              <thead className="text-xs text-gray-700 uppercase">
                <tr>
                  <th className="py-2 text-left">Product</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Quantity</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 text-left">{item.name}</td>
                    <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="py-3 text-right font-semibold">
                    Total:
                  </td>
                  <td className="py-3 text-right font-semibold">${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
