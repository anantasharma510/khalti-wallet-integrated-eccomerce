"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { formatPrice } from "@/lib/utils"

interface PaymentData {
  pidx: string
  transaction_id: string
  tidx: string
  txnId: string
  amount: string
  total_amount: string
  mobile: string
  status: string
  purchase_order_id: string
  purchase_order_name: string
}

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Extract payment data from URL parameters
        const paymentInfo: PaymentData = {
          pidx: searchParams.get("pidx") || "",
          transaction_id: searchParams.get("transaction_id") || "",
          tidx: searchParams.get("tidx") || "",
          txnId: searchParams.get("txnId") || "",
          amount: searchParams.get("amount") || "",
          total_amount: searchParams.get("total_amount") || "",
          mobile: searchParams.get("mobile") || "",
          status: searchParams.get("status") || "",
          purchase_order_id: searchParams.get("purchase_order_id") || "",
          purchase_order_name: searchParams.get("purchase_order_name") || "",
        }

        setPaymentData(paymentInfo)

        // Verify payment with backend
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentInfo),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Payment verification failed")
        }

        const result = await response.json()
        
        if (result.status === 'successful') {
          setOrderDetails(result.order)
        } else {
          throw new Error("Payment verification failed")
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Payment verification error:", err)
        setError("Payment verification failed. Please contact support.")
        setLoading(false)
      }
    }

    if (searchParams.get("status") === "Completed") {
      verifyPayment()
    } else {
      setError("Payment was not completed successfully.")
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/cart"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Return to Cart
            </Link>
            <Link
              href="/products"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2"> Payment Successfully complete !</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.check your mail</p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4"> Payment Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-medium">{paymentData?.transaction_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium">{formatPrice(parseFloat(paymentData?.total_amount || "0"))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">Khalti</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">{paymentData?.status}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderDetails._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(orderDetails.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium capitalize">{orderDetails.status}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {orderDetails.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 font-semibold text-lg">
                <span>Total:</span>
                <span>{formatPrice(orderDetails.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• You will receive an order confirmation email shortly</li>
            <li>• We'll process your order and ship it within 2-3 business days</li>
            <li>• You can track your order status in your account</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/orders"
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 text-center font-medium"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 text-center font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
