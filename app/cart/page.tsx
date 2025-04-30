"use client"

import { useCart } from "@/context/CartContext"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return

    // If user is not logged in, redirect to login page
    if (!user) {
      router.push("/login?redirect=checkout")
      return
    }

    // Redirect to checkout page
    // router.push("/checkout")
    router.push("/testk")
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="mb-6">Your cart is empty</p>
        <Link href="/products" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Your Cart</h1>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cart.map((item) => (
              <tr key={item.product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 relative flex-shrink-0">
                      <Image
                        src={item.product.imageUrl || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                      className="px-2 py-1 border rounded"
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="px-2 py-1 border rounded"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => removeFromCart(item.product._id)} className="text-red-600 hover:text-red-900">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center border-t pt-4">
        <div className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</div>
        <div className="space-x-4">
          <button onClick={() => clearCart()} className="px-4 py-2 border rounded hover:bg-gray-100">
            Clear Cart
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  )
}
