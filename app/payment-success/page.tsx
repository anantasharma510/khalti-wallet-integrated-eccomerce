// "use client"

// import { useEffect, useState } from 'react'
// import { useSearchParams } from 'next/navigation'
// import { useAuth } from '@/context/AuthContext'
// import axios from 'axios'
// import Link from 'next/link'

// export default function PaymentSuccessPage() {
//   const searchParams = useSearchParams()
//   const orderId = searchParams.get('orderId')
//   const pidx = searchParams.get('pidx')
//   const { user } = useAuth()
//   const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending')
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const orderId = searchParams.get('purchase_order_id') // This will be your orderId
//     const pidx = searchParams.get('pidx') // This will be your pidx
  
//     console.log('orderId:', orderId, 'pidx:', pidx); // Check if the parameters are correct
  
//     if (!orderId || !pidx) {
//       setError('Invalid payment verification parameters');
//       setLoading(false);
//       return;
//     }
  
//     const verifyPayment = async () => {
//         try {
//           console.log('Sending payment verification request with data:', {
//             orderId,
//             pidx,
//             userId: user?._id
//           });
          
//           const response = await axios.post('/api/verify-payment', {
//             orderId,
//             pidx,
//             userId: user?._id
//           });
      
//           setStatus(response.data.status);
//         } catch (err) {
//           console.error('Payment verification failed:', err);
//           setError('Failed to verify payment status');
//           setStatus('failed');
//         } finally {
//           setLoading(false);
//         }
//       };
      
  
//     verifyPayment();
//   }, [searchParams, user]);
  
//   if (loading) {
//     return (
//       <div className="text-center py-12">
//         <h1 className="text-2xl font-bold mb-4">Verifying Payment</h1>
//         <p>Please wait while we verify your payment...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <h1 className="text-2xl font-bold mb-4">Payment Error</h1>
//         <p className="text-red-600 mb-6">{error}</p>
//         <Link href="/orders" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//           View Your Orders
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div className="text-center py-12">
//       {status === 'completed' ? (
//         <>
//           <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
//           <p className="mb-6">Thank you for your purchase. Your order #{orderId} has been confirmed.</p>
//           <div className="space-x-4">
//             <Link href="/orders" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//               View Order Details
//             </Link>
//             <Link href="/products" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
//               Continue Shopping
//             </Link>
//           </div>
//         </>
//       ) : status === 'pending' ? (
//         <>
//           <h1 className="text-2xl font-bold mb-4">Payment Processing</h1>
//           <p className="mb-6">Your payment is still being processed. Please check back later.</p>
//           <Link href="/orders" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//             View Your Orders
//           </Link>
//         </>
//       ) : (
//         <>
//           <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
//           <p className="mb-6">We couldn't process your payment. Please try again.</p>
//           <div className="space-x-4">
//             <Link href="/cart" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//               Back to Cart
//             </Link>
//             <Link href="/products" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
//               Continue Shopping
//             </Link>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')
  
  useEffect(() => {
    const orderIdParam = searchParams.get('purchase_order_id') || searchParams.get('orderId')
    const pidx = searchParams.get('pidx')

    console.log('orderId:', orderIdParam, 'pidx:', pidx)

    if (!orderIdParam || !pidx) {
      setError('Invalid payment verification parameters')
      setLoading(false)
      return
    }

    setOrderId(orderIdParam)

    const verifyPayment = async () => {
      try {
        console.log('Verifying payment...', { orderId: orderIdParam, pidx, userId: user?._id })
        const response = await axios.post('/api/verify-payment', {
          orderId: orderIdParam,
          pidx,
          userId: user?._id
        })

        setStatus(response.data.status)
      } catch (err) {
        console.error('Verification error:', err)
        setError('Failed to verify payment status')
        setStatus('failed')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams, user])

  if (loading) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Verifying Payment</h1>
        <p>Please wait while we verify your payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Payment Error</h1>
        <p className="text-red-600 mb-6">{error}</p>
        <Link href="/orders" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          View Your Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      {status === 'completed' ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
          <p className="mb-6">Thank you for your purchase. Your order #{orderId} has been confirmed.</p>
          <div className="space-x-4">
            <Link href="/orders" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Order Details
            </Link>
            <Link href="/products" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
              Continue Shopping
            </Link>
          </div>
        </>
      ) : status === 'pending' ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Payment Processing</h1>
          <p className="mb-6">Your payment is still being processed. Please check back later.</p>
          <Link href="/orders" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Your Orders
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
          <p className="mb-6">We couldn't process your payment. Please try again.</p>
          <div className="space-x-4">
            <Link href="/cart" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Back to Cart
            </Link>
            <Link href="/products" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
