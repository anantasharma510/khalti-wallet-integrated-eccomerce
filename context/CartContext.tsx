"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, CartItem } from "@/lib/types"
import { useAuth } from "./AuthContext"

interface CartContextType {
  cart: CartItem[]
  loading: boolean
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  cart: [],
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch cart from API when user changes
  useEffect(() => {
    if (user) {
      refreshCart()
    } else {
      // If no user, try to load from localStorage
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error)
        }
      }
      setLoading(false)
    }
  }, [user])

  // Save cart to localStorage when it changes (for non-logged in users)
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart, user, loading])

  const refreshCart = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch("/api/cart")

      if (response.ok) {
        const data = await response.json()
        setCart(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product: Product, quantity = 1) => {
    if (user) {
      try {
        setLoading(true)
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "add",
            productId: product._id,
            quantity,
          }),
        })

        if (response.ok) {
          await refreshCart()
        }
      } catch (error) {
        console.error("Error adding to cart:", error)
      } finally {
        setLoading(false)
      }
    } else {
      // Handle local cart for non-logged in users
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product._id === product._id)

        if (existingItem) {
          return prevCart.map((item) =>
            item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item,
          )
        } else {
          return [...prevCart, { product, quantity }]
        }
      })
    }
  }

  const removeFromCart = async (productId: string) => {
    if (user) {
      try {
        setLoading(true)
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "remove",
            productId,
          }),
        })

        if (response.ok) {
          await refreshCart()
        }
      } catch (error) {
        console.error("Error removing from cart:", error)
      } finally {
        setLoading(false)
      }
    } else {
      // Handle local cart for non-logged in users
      setCart((prevCart) => prevCart.filter((item) => item.product._id !== productId))
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (user) {
      try {
        setLoading(true)
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update",
            productId,
            quantity,
          }),
        })

        if (response.ok) {
          await refreshCart()
        }
      } catch (error) {
        console.error("Error updating cart:", error)
      } finally {
        setLoading(false)
      }
    } else {
      // Handle local cart for non-logged in users
      setCart((prevCart) => prevCart.map((item) => (item.product._id === productId ? { ...item, quantity } : item)))
    }
  }

  const clearCart = async () => {
    if (user) {
      try {
        setLoading(true)
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "clear",
          }),
        })

        if (response.ok) {
          await refreshCart()
        }
      } catch (error) {
        console.error("Error clearing cart:", error)
      } finally {
        setLoading(false)
      }
    } else {
      // Handle local cart for non-logged in users
      setCart([])
    }
  }

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
