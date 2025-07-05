"use client"

import { useWishlist } from "@/context/WishlistContext"
import { useCart } from "@/context/CartContext"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <p className="mb-6">Your wishlist is empty</p>
        <Link href="/products" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Your Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((product) => (
          <div key={product._id} className="border rounded-lg overflow-hidden">
            <div className="relative h-48">
              <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
                              <p className="text-gray-600">{formatPrice(product.price)}</p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => {
                    addToCart(product)
                    removeFromWishlist(product._id)
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="border px-3 py-1 rounded hover:bg-gray-100 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
