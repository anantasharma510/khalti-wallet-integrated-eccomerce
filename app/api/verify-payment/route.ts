// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';
// import { ObjectId } from 'mongodb';
// import axios from 'axios';

// export async function POST(request: Request) {
//   try {
//     const { db } = await connectToDatabase();
//     const body = await request.json();

//     const { orderId, pidx, userId } = body;

//     // Validation
//     if (!orderId || !pidx || !userId) {
//       return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
//     }

//     if (!ObjectId.isValid(orderId)) {
//       return NextResponse.json({ error: 'Invalid orderId format' }, { status: 400 });
//     }

//     // Debug logs for incoming payload
//     console.log('Received payment verification request: ', { orderId, pidx, userId });

//     // Verify payment with Khalti
//     const verifyUrl = 'https://a.khalti.com/api/v2/epayment/lookup/';
//     const verifyRes = await axios.post(
//       verifyUrl,
//       { pidx },
//       {
//         headers: {
//           Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const { status: paymentStatus, ...khaltiResponse } = verifyRes.data;

//     // Log Khalti response for debugging
//     console.log('Khalti payment response:', khaltiResponse);

//     if (paymentStatus !== 'Completed') {
//       // If payment is not completed, mark the payment as failed
//       const paymentUpdate = {
//         status: 'failed',
//         updatedAt: new Date(),
//       };

//       // Update payment and order status to failed
//       await db.collection('payments').updateOne({ orderId }, { $set: paymentUpdate });
//       await db.collection('orders').updateOne(
//         { _id: new ObjectId(orderId) },
//         { $set: { 'paymentInfo.status': 'failed', status: 'failed' } }
//       );

//       return NextResponse.json({
//         status: 'failed',
//         orderId,
//         khaltiResponse,
//       });
//     }

//     // Payment was completed, proceed to update order status to "shipped"
//     const paymentUpdate = {
//       status: 'completed',
//       transactionId: pidx,
//       updatedAt: new Date(),
//     };

//     const orderUpdate = {
//       'paymentInfo.status': 'completed',
//       status: 'shipped', // Set order status to "shipped"
//     };

//     // Update payment and order in database
//     await db.collection('payments').updateOne({ orderId }, { $set: paymentUpdate });
//     await db.collection('orders').updateOne({ _id: new ObjectId(orderId) }, { $set: orderUpdate });

//     return NextResponse.json({
//       status: 'completed',
//       orderId,
//       khaltiResponse, // Optional: useful for debugging or logging
//     });
//   } catch (error) {
//     console.error('❌ Payment verification failed:', error);
//     return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import axios from 'axios';

export async function POST(request: Request) {
    try {
      const { db } = await connectToDatabase();
      const body = await request.json();
  
      // Extract payment data from the request
      const { 
        pidx, 
        transaction_id, 
        status, 
        purchase_order_id, 
        amount, 
        total_amount 
      } = body;
  
      // Validation
      if (!pidx || !purchase_order_id || !status) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }
  
      if (!ObjectId.isValid(purchase_order_id)) {
        return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
      }
  
      // Debug logs for incoming payload
      console.log('Received payment verification request: ', { purchase_order_id, pidx, status });
  
      // Verify payment with Khalti
      const verifyUrl = 'https://a.khalti.com/api/v2/epayment/lookup/';
      const verifyRes = await axios.post(
        verifyUrl,
        { pidx },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const { status: paymentStatus, ...khaltiResponse } = verifyRes.data;
  
      // Log Khalti response for debugging
      console.log('Khalti payment response:', khaltiResponse);
  
      if (paymentStatus !== 'Completed') {
        // If payment is not completed, mark the payment as failed
        const paymentUpdate = {
          status: 'failed',
          updatedAt: new Date(),
        };
  
        // Update payment and order status to failed
        await db.collection('payments').updateOne({ orderId: purchase_order_id }, { $set: paymentUpdate });
        await db.collection('orders').updateOne(
          { _id: new ObjectId(purchase_order_id) },
          { $set: { 'paymentInfo.status': 'failed', status: 'failed' } }
        );
  
        return NextResponse.json({
          status: 'failed',
          orderId: purchase_order_id,
          khaltiResponse,
        });
      }
  
      // Payment was completed, proceed to update order status to "shipped"
      const paymentUpdate = {
        status: 'successful', // Updated payment status to "successful"
        transactionId: pidx,
        updatedAt: new Date(),
      };
  
      const orderUpdate = {
        'paymentInfo.status': 'successful', // Updated payment info status to "successful"
        status: 'shipped', // Set order status to "shipped"
      };
  
      // Log the update actions
      console.log('Updating payment status to successful for orderId:', purchase_order_id);
      console.log('Updating order status to shipped for orderId:', purchase_order_id);
  
      // Update payment and order in database
      const paymentUpdateResult = await db.collection('payments').updateOne({ orderId: purchase_order_id }, { $set: paymentUpdate });
      console.log('Payment update result:', paymentUpdateResult);
  
      const orderUpdateResult = await db.collection('orders').updateOne({ _id: new ObjectId(purchase_order_id) }, { $set: orderUpdate });
      console.log('Order update result:', orderUpdateResult);
  
      // Get the updated order for response
      const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(purchase_order_id) });
  
      return NextResponse.json({
        status: 'successful',
        orderId: purchase_order_id,
        order: updatedOrder,
        khaltiResponse, // Optional: useful for debugging or logging
      });
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }
  }
  