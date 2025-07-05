import { connectToDatabase } from "./mongodb"
import type { Product } from "./types"
import { ObjectId } from "mongodb"

export async function getProducts(): Promise<Product[]> {
  const { db } = await connectToDatabase()

  const products = await db.collection("products").aggregate([
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "productId",
        as: "reviews"
      }
    },
    {
      $addFields: {
        reviewCount: { $size: "$reviews" },
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: "$reviews" }, 0] },
            then: { $round: [{ $avg: "$reviews.rating" }, 1] },
            else: 0
          }
        }
      }
    },
    {
      $project: {
        reviews: 0
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]).toArray()

  return JSON.parse(JSON.stringify(products))
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { db } = await connectToDatabase()

    const products = await db.collection("products").aggregate([
      {
        $match: { _id: new ObjectId(id) }
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews"
        }
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $round: [{ $avg: "$reviews.rating" }, 1] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          reviews: 0
        }
      }
    ]).toArray()

    if (products.length === 0) {
      return null
    }

    return JSON.parse(JSON.stringify(products[0]))
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}
