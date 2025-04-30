import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { NextRequest } from "next/server";

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract token from cookies or Authorization header
    const cookieStore = await cookies(); // Await the promise to resolve cookies
    let token = cookieStore.get("auth-token")?.value;

    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    let decoded: DecodedToken;

    try {
      decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as DecodedToken;
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid order ID format" }, { status: 400 });
    }

    const order = await db.collection("orders").findOne({ _id: new ObjectId(params.id) });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Authorization check: allow if user owns order or is admin
    if (order.userId !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 });
  }
}
