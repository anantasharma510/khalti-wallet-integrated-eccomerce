"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import type { Product } from "@/lib/types"

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    if (product.stock === 0) return

    setAdding(true)
    try {
      await addToCart(product, quantity)
      setTimeout(() => setAdding(false), 800)
    } catch (error) {
      console.error("Error adding to cart:", error)
      setAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <label htmlFor="quantity" className="mr-4 text-gray-700 font-medium">
          Quantity:
        </label>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={product.stock === 0}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
          >
            −
          </button>
          <span className="w-12 text-center py-2">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
            disabled={product.stock === 0 || quantity >= product.stock}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={adding || product.stock === 0}
        className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-all ${
          product.stock === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
        }`}
      >
        {adding ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Adding to Cart...
          </>
        ) : product.stock === 0 ? (
          "Out of Stock"
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart
          </>
        )}
      </button>
    </div>
  )
}
