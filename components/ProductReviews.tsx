"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import ReviewForm from "./ReviewForm"
import ReviewsList from "./ReviewsList"
import CanReviewCheck from "./CanReviewCheck"
import { Button } from "./ui/button"
import { Star } from "lucide-react"

interface ProductReviewsProps {
  productId: string
  averageRating?: number
}

export default function ProductReviews({ productId, averageRating = 0 }: ProductReviewsProps) {
  const { user } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1)
    setShowReviewForm(false)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}/5
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>
          {averageRating > 0 && (
            <div className="flex items-center space-x-4">
              {renderStars(averageRating)}
              <span className="text-sm text-gray-600">
                Based on customer reviews
              </span>
            </div>
          )}
        </div>
        
        {user && (
          <CanReviewCheck productId={productId}>
            {(canReview, hasReviewed) => (
              <div>
                {canReview && !showReviewForm && (
                  <Button onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </Button>
                )}
                {hasReviewed && (
                  <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                    ✓ You've reviewed this product
                  </div>
                )}
              </div>
            )}
          </CanReviewCheck>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm 
            productId={productId} 
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}

      {/* Reviews List */}
      <ReviewsList 
        productId={productId} 
        refreshTrigger={refreshTrigger}
      />
    </div>
  )
} 