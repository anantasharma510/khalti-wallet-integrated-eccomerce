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
  
      const { orderId, pidx, userId } = body;
  
      // Validation
      if (!orderId || !pidx || !userId) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }
  
      if (!ObjectId.isValid(orderId)) {
        return NextResponse.json({ error: 'Invalid orderId format' }, { status: 400 });
      }
  
      // Debug logs for incoming payload
      console.log('Received payment verification request: ', { orderId, pidx, userId });
  
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
        await db.collection('payments').updateOne({ orderId }, { $set: paymentUpdate });
        await db.collection('orders').updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { 'paymentInfo.status': 'failed', status: 'failed' } }
        );
  
        return NextResponse.json({
          status: 'failed',
          orderId,
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
      console.log('Updating payment status to successful for orderId:', orderId);
      console.log('Updating order status to shipped for orderId:', orderId);
  
      // Update payment and order in database
      const paymentUpdateResult = await db.collection('payments').updateOne({ orderId }, { $set: paymentUpdate });
      console.log('Payment update result:', paymentUpdateResult);
  
      const orderUpdateResult = await db.collection('orders').updateOne({ _id: new ObjectId(orderId) }, { $set: orderUpdate });
      console.log('Order update result:', orderUpdateResult);
  
      return NextResponse.json({
        status: 'successful',
        orderId,
        khaltiResponse, // Optional: useful for debugging or logging
      });
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }
  }
  