"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

interface CanReviewCheckProps {
  productId: string
  children: (canReview: boolean, hasReviewed: boolean) => React.ReactNode
}

export default function CanReviewCheck({ productId, children }: CanReviewCheckProps) {
  const { user } = useAuth()
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkReviewStatus = async () => {
      if (!user) {
        setCanReview(false)
        setHasReviewed(false)
        setLoading(false)
        return
      }

      try {
        console.log("Checking review status for user:", user._id, "product:", productId)
        const response = await fetch(`/api/products/${productId}/can-review`)
        const data = await response.json()
        console.log("Can review response:", data)

        if (response.ok) {
          setCanReview(data.canReview)
          setHasReviewed(data.hasReviewed)
        } else {
          setCanReview(false)
          setHasReviewed(false)
        }
      } catch (error) {
        console.error("Error checking review status:", error)
        setCanReview(false)
        setHasReviewed(false)
      } finally {
        setLoading(false)
      }
    }

    checkReviewStatus()
  }, [user, productId])

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return <>{children(canReview, hasReviewed)}</>
} 