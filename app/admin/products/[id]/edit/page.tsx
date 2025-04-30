import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import EditProductForm from "@/components/admin/EditProductForm"
import { getProductById } from "@/lib/products"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login?message=You must be logged in to access this page")
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string
      email: string
      role: string
    }

    if (decoded.role !== "admin") {
      redirect("/login?message=You must be an admin to access this page")
    }

    const product = await getProductById(params.id)

    if (!product) {
      redirect("/admin/products")
    }

    return <EditProductForm product={product} />
  } catch (error) {
    redirect("/login?message=Authentication failed")
  }
}
