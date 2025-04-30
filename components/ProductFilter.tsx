"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ProductFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  })

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()

    if (priceRange.min) {
      params.set("minPrice", priceRange.min)
    }

    if (priceRange.max) {
      params.set("maxPrice", priceRange.max)
    }

    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Filter Products</h2>

      <form onSubmit={handleFilter}>
        <div className="mb-4">
          <h3 className="font-medium mb-2">Price Range</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Apply Filters
        </button>
      </form>
    </div>
  )
}
