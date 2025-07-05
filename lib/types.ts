export interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  averageRating?: number
  reviewCount?: number
  createdAt: Date
}

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  imageUrl?: string
  role: "buyer" | "admin"
  createdAt: Date
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  _id: string
  userId: string
  items: {
    productId: string
    name: string
    price: number
    quantity: number
  }[]
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  shippingAddress?: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  paymentInfo?: {
    method: "khalti" | "cash_on_delivery" | "bank_transfer"
    status: "pending" | "completed" | "failed"
    transactionId?: string
    paidAt?: Date
  }
}

export interface Payment {
  _id: string
  orderId: string
  userId: string
  amount: number
  method: "khalti" | "cash_on_delivery" | "bank_transfer"
  status: "pending" | "completed" | "failed"
  transactionId?: string
  khaltiData?: {
    pidx?: string
    payment_url?: string
    expires_at?: Date
    purchase_order_id?: string
    purchase_order_name?: string
  }
  createdAt: Date
  updatedAt?: Date
}

export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
}
