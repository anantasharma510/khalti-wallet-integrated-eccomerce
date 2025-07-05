import Link from "next/link"
import type { Order } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

export default function OrderHistory({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">You haven't placed any orders yet.</p>
        <Link
          href="/products"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order._id}
          className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
        >
          {/* Order Header */}
          <div className="bg-gray-100 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Order ID: <span className="font-medium">{order._id}</span></p>
                <p className="text-sm text-gray-500">
                  Date:{" "}
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Table */}
          <div className="px-6 py-4 overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="uppercase text-xs text-gray-500 border-b">
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
                    <td className="py-3">{item.name}</td>
                    <td className="py-3 text-right">{formatPrice(item.price)}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right font-semibold">
                    Total:
                  </td>
                  <td className="pt-4 text-right font-semibold text-gray-800">
                    {formatPrice(order.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
