"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

export default function ProductList({ products }: { products: Product[] }) {
  const { addToCart } = useCart()
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setAddingToCart(product._id)

    try {
      await addToCart(product)
      setTimeout(() => setAddingToCart(null), 1000)
    } catch (error) {
      console.error("Error adding to cart:", error)
      setAddingToCart(null)
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item._id === productId)
  }

  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <Link
          key={product._id}
          href={`/products/${product._id}`}
          className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
          <div className="relative h-64 overflow-hidden">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={(e) => handleToggleWishlist(product, e)}
                className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-500"}`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => handleAddToCart(product, e)}
                disabled={addingToCart === product._id}
                className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                aria-label="Add to cart"
              >
                {addingToCart === product._id ? (
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                )}
              </button>
            </div>
            {product.stock <= 5 && (
              <div className="absolute top-3 left-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.stock === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {product.stock === 0 ? "Out of stock" : `Only ${product.stock} left`}
                </span>
              </div>
            )}
          </div>
          <div className="p-5 flex-grow flex flex-col">
            <h2 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h2>
            <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-grow">{product.description}</p>
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-blue-700">{formatPrice(product.price)}</p>
              <span className="text-sm text-gray-500">{product.stock > 0 ? "In stock" : "Out of stock"}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
