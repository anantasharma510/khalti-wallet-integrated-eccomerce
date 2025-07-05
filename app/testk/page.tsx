'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { formatPrice } from '@/lib/utils'

type ShippingAddress = {
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
}

export default function TestKPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Nepal'
  })

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=testk')
      return
    }

    if (cart.length === 0) {
      router.push('/cart')
    }
  }, [user, cart, router])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleKhaltiPayment = async () => {
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      setError('Please fill all shipping address fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        userId: user?._id, // Make sure `user._id` exists in AuthContext
        userEmail: user?.email,
        userPhone: user?.phone || '',
        items: cart.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        shippingAddress,
        totalAmount,
        paymentMethod: 'khalti'
      }

      const response = await axios.post('/api/testk', payload)
      const { payment_url } = response.data

      if (payment_url) {
        window.location.href = payment_url
      } else {
        setError('Failed to retrieve payment URL.')
      }
    } catch (err) {
      console.error('Payment initiation failed:', err)
      setError('Failed to initiate payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user || cart.length === 0) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout with Khalti</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="space-y-4">
            {['fullName', 'address', 'city', 'postalCode'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="text"
                  name={field}
                  value={shippingAddress[field as keyof ShippingAddress]}
                  onChange={handleAddressChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={shippingAddress.country}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded"
                disabled
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="border rounded-lg p-4">
            {cart.map(item => (
              <div key={item.product._id} className="flex justify-between py-2 border-b">
                <div>
                  {item.product.name} × {item.quantity}
                </div>
                <div>{formatPrice(item.product.price * item.quantity)}</div>
              </div>
            ))}
            
            <div className="flex justify-between py-4 font-bold">
              <div>Total</div>
              <div>{formatPrice(totalAmount)}</div>
            </div>

            <button
              onClick={handleKhaltiPayment}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay with Khalti'}
            </button>

            <div className="mt-4 text-sm text-gray-600">
              By completing your purchase, you agree to our terms of service.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/cart" className="text-blue-600 hover:underline">
          &larr; Back to Cart
        </Link>
      </div>
    </div>
  )
}
