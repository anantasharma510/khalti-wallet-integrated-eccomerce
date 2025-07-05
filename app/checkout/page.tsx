"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"

export default function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postalCode: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Update customer info when user data is loaded
  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayWithKhalti = async (e) => {
    e.preventDefault()
    setError("")

    if (!user) {
      router.push("/login?redirect=checkout")
      return
    }

    if (cart.length === 0) {
      setError("Your cart is empty")
      return
    }

    // Validate required fields
    if (
      !customerInfo.fullName ||
      !customerInfo.email ||
      !customerInfo.phone ||
      !customerInfo.address ||
      !customerInfo.city ||
      !customerInfo.postalCode
    ) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      // Create a shipping address object from customer info
      const shippingAddress = {
        fullName: customerInfo.fullName,
        address: customerInfo.address,
        city: customerInfo.city,
        postalCode: customerInfo.postalCode,
        country: "Nepal",
      }

      // Make the API request
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress,
          paymentMethod: "khalti",
        }),
      })

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text()
        console.error("Order API error response:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `Error ${orderResponse.status}: Failed to place order`)
        } catch (e) {
          throw new Error(`Error ${orderResponse.status}: Failed to place order`)
        }
      }

      const orderData = await orderResponse.json()
      console.log("Order created:", orderData)

      // Initiate Khalti payment
      const paymentResponse = await fetch("/api/payment/khalti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice,
          purchaseOrderId: orderData.orderId,
          purchaseOrderName: `Order #${orderData.orderId.substring(0, 8)}`,
          customerInfo: {
            name: customerInfo.fullName,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        }),
      })

      if (!paymentResponse.ok) {
        const paymentErrorData = await paymentResponse.json()
        throw new Error(paymentErrorData.error || "Failed to initiate payment")
      }

      const paymentData = await paymentResponse.json()
      console.log("Payment initiated:", paymentData)

      // Redirect to Khalti payment page
      window.location.href = paymentData.payment_url
    } catch (err) {
      console.error("Checkout error:", err)
      setError(err.message || "An error occurred during checkout")
      setLoading(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="mb-6">Your cart is empty</p>
        <button
          onClick={() => router.push("/products")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>

            <form onSubmit={handlePayWithKhalti} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block mb-1 text-sm font-medium">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={customerInfo.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block mb-1 text-sm font-medium">
                    Email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-1 text-sm font-medium">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block mb-1 text-sm font-medium">
                  Address*
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block mb-1 text-sm font-medium">
                    City*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block mb-1 text-sm font-medium">
                    Postal Code*
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={customerInfo.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="flex items-center p-4 border rounded bg-gray-50">
                  <div className="h-8 w-20 relative mr-3">
                    <Image src="/khalti-logo.png" alt="Khalti" width={80} height={32} />
                  </div>
                  <span>Pay with Khalti</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>Pay with Khalti - {formatPrice(totalPrice)}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product._id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.product.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <p>Total</p>
                  <p>{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
