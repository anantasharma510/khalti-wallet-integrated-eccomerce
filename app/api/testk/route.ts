// import { NextResponse } from 'next/server'
// import { connectToDatabase } from '@/lib/mongodb'
// import type { OrderSchema, PaymentSchema } from '@/lib/schema'
// import axios from 'axios'

// export async function POST(request: Request) {
//   try {
//     const { db } = await connectToDatabase()
//     const body = await request.json()

//     // Debug: check environment variable values
//     console.log('ENV - NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
//     console.log('ENV - KHALTI_SECRET_KEY:', process.env.KHALTI_SECRET_KEY)

//     // Validate required fields
//     if (!body.items || !body.shippingAddress || !body.totalAmount) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     // Create order in database
//     const orderData: Omit<OrderSchema, '_id'> = {
//       userId: body.userId,
//       items: body.items,
//       totalAmount: body.totalAmount,
//       status: 'pending',
//       createdAt: new Date(),
//       shippingAddress: body.shippingAddress,
//       paymentInfo: {
//         method: 'khalti',
//         status: 'pending'
//       }
//     }

//     const orderResult = await db.collection('orders').insertOne(orderData)
//     const orderId = orderResult.insertedId.toString()

//     // Prepare temporary Khalti payload (without pidx yet)
//     const khaltiPayload = {
//       return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`, // temporary fallback
//       website_url: process.env.NEXT_PUBLIC_BASE_URL,
//       amount: body.totalAmount * 100,
//       purchase_order_id: orderId,
//       purchase_order_name: `Order_${orderId.slice(-6)}`,
//       customer_info: {
//         name: body.shippingAddress.fullName,
//         email: body.userEmail,
//         phone: body.userPhone
//       }
//     }

//     // Initiate Khalti payment
//     const khaltiUrl = 'https://a.khalti.com/api/v2/epayment/initiate/'
//     const response = await axios.post(khaltiUrl, khaltiPayload, {
//       headers: {
//         Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     })

//     const { pidx, payment_url } = response.data

//     // Append return_url with pidx and orderId manually
//     const finalPaymentUrl = `${payment_url}?return_url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${orderId}&pidx=${pidx}`)}`

//     // Create payment record in database
//     const paymentData: Omit<PaymentSchema, '_id'> = {
//       orderId,
//       userId: body.userId,
//       amount: body.totalAmount,
//       method: 'khalti',
//       status: 'pending',
//       khaltiData: {
//         pidx,
//         payment_url: finalPaymentUrl,
//         expires_at: new Date(Date.now() + 30 * 60 * 1000),
//         purchase_order_id: orderId
//       },
//       createdAt: new Date()
//     }

//     await db.collection('payments').insertOne(paymentData)

//     return NextResponse.json({
//       payment_url: finalPaymentUrl,
//       pidx,
//       orderId
//     })
//   } catch (error) {
//     console.error('Khalti payment initiation failed:', error)
//     return NextResponse.json(
//       { error: 'Failed to initiate payment' },
//       { status: 500 }
//     )
//   }
// }
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import type { OrderSchema, PaymentSchema } from '@/lib/schema'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    // Debug: check environment variable values
    console.log('ENV - NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
    console.log('ENV - KHALTI_SECRET_KEY:', process.env.KHALTI_SECRET_KEY)

    // Validate required fields
    if (!body.items || !body.shippingAddress || !body.totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create order in database
    const orderData: Omit<OrderSchema, '_id'> = {
      userId: body.userId,
      items: body.items,
      totalAmount: body.totalAmount,
      status: 'pending',
      createdAt: new Date(),
      shippingAddress: body.shippingAddress,
      paymentInfo: {
        method: 'khalti',
        status: 'pending'
      }
    }

    const orderResult = await db.collection('orders').insertOne(orderData)
    const orderId = orderResult.insertedId.toString()

    // Prepare temporary Khalti payload (without pidx yet)
    const khaltiPayload = {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`, // temporary fallback
      website_url: process.env.NEXT_PUBLIC_BASE_URL,
      amount: body.totalAmount * 100,
      purchase_order_id: orderId,
      purchase_order_name: `Order_${orderId.slice(-6)}`,
      customer_info: {
        name: body.shippingAddress.fullName,
        email: body.userEmail,
        phone: body.userPhone
      }
    }

    // Initiate Khalti payment
    const khaltiUrl = 'https://a.khalti.com/api/v2/epayment/initiate/'
    const response = await axios.post(khaltiUrl, khaltiPayload, {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const { pidx, payment_url } = response.data

    // Append return_url with pidx and orderId manually
    const finalPaymentUrl = `${payment_url}?return_url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${orderId}&pidx=${pidx}`)}`

    // Create payment record in database
    const paymentData: Omit<PaymentSchema, '_id'> = {
      orderId,
      userId: body.userId,
      amount: body.totalAmount,
      method: 'khalti',
      status: 'pending',
      khaltiData: {
        pidx,
        payment_url: finalPaymentUrl,
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        purchase_order_id: orderId
      },
      createdAt: new Date()
    }

    await db.collection('payments').insertOne(paymentData)

    return NextResponse.json({
      payment_url: finalPaymentUrl,
      pidx,
      orderId
    })
  } catch (error) {
    console.error('Khalti payment initiation failed:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
