"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState("")

  const orderId = searchParams.get("orderId")
  const pidx = searchParams.get("pidx")

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId && !pidx) {
        setError("Invalid order information")
        setLoading(false)
        return
      }

      try {
        // If we have a pidx, verify the Khalti payment
        if (pidx) {
          console.log("Verifying Khalti payment with PIDX:", pidx)
          const response = await fetch("/api/payment/khalti/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pidx }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || "Failed to verify payment")
          }

          console.log("Khalti verification response:", data)

          // Get order details
          const orderResponse = await fetch(`/api/orders/${data.orderId}`)
          const orderData = await orderResponse.json()

          if (!orderResponse.ok) {
            throw new Error(orderData.message || "Failed to fetch order details")
          }

          setOrder(orderData)
        }
        // If we have an orderId but no pidx, fetch the order directly
        else if (orderId) {
          console.log("Fetching order details for ID:", orderId)
          const response = await fetch(`/api/orders/${orderId}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch order details")
          }

          setOrder(data)
        }
      } catch (err: any) {
        console.error("Error in checkout success:", err)
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, pidx])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg">Processing your order...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        <Link href="/products" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Thank You for Your Order!</h1>
          <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
        </div>

        {order && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>

            <div className="space-y-2 mb-6">
              <p>
                <span className="font-medium">Order ID:</span> {order._id}
              </p>
              <p>
                <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </p>
              <p>
                <span className="font-medium">Payment Method:</span>{" "}
                {order.paymentInfo?.method === "khalti"
                  ? "Khalti"
                  : order.paymentInfo?.method === "cash_on_delivery"
                    ? "Cash on Delivery"
                    : "Bank Transfer"}
              </p>
              <p>
                <span className="font-medium">Payment Status:</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    order.paymentInfo?.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.paymentInfo?.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.paymentInfo?.status.charAt(0).toUpperCase() + order.paymentInfo?.status.slice(1)}
                </span>
              </p>
            </div>

            <h3 className="font-semibold mb-2">Items</h3>
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-medium">${order.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {order.shippingAddress && (
              <>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <Link href="/orders" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View All Orders
          </Link>
          <Link href="/products" className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
