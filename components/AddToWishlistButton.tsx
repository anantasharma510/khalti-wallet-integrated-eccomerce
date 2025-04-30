"use client"

import { useWishlist } from "@/context/WishlistContext"
import type { Product } from "@/lib/types"
import { useState } from "react"

export default function AddToWishlistButton({ product }: { product: Product }) {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [isProcessing, setIsProcessing] = useState(false)
  const isInWishlist = wishlist.some((item) => item._id === product._id)

  const handleToggleWishlist = async () => {
    setIsProcessing(true)
    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id)
      } else {
        await addToWishlist(product)
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isProcessing}
      className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-all ${
        isInWishlist
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      }`}
    >
      {isProcessing ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5"
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
          Processing...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 mr-2 ${isInWishlist ? "text-red-500 fill-red-500" : "text-gray-500"}`}
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
          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </>
      )}
    </button>
  )
}
