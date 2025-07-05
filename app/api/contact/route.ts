import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    // Parse the incoming JSON data
    const { name, email, subject, message } = await req.json();
    console.log('Received Contact Form:', { name, email, subject, message });

    // Connect to the MongoDB database
    const { db } = await connectToDatabase();
    
    // Define the contact message data
    const contactMessage = {
      name,
      email,
      subject,
      message,
      timestamp: new Date(),
    };

    // Insert the contact message into the contactMessages collection
    const result = await db.collection('contactMessages').insertOne(contactMessage);

    // If insertion is successful, return a success response
    if (result.acknowledged) {
      return new Response(JSON.stringify({ success: true, message: 'Message received and saved' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Failed to save message');
    }

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
