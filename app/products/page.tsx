import { getProducts } from "@/lib/products"
import ProductGrid from "@/components/ProductGrid"
import ProductFilter from "@/components/ProductFilter"

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ProductFilter />
        </div>

        <div className="lg:col-span-3">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
}
