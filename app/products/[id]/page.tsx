import Image from "next/image"
import { getProductById, getProducts } from "@/lib/products"
import AddToCartButton from "@/components/AddToCartButton"
import AddToWishlistButton from "@/components/AddToWishlistButton"
import Link from "next/link"

// Generate static params for all products
export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    id: product._id,
  }))
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const id = params.id
  const product = await getProductById(id)
  const relatedProducts = await getProducts()

  // Filter out current product and limit to 4 related products
  const filteredRelatedProducts = relatedProducts.filter((p) => p._id !== id).slice(0, 4)

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Breadcrumb */}
      <nav className="text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-blue-600">
              Home
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li>
            <Link href="/products" className="text-gray-500 hover:text-blue-600">
              Products
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900 font-medium truncate">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative h-96 bg-gray-50 rounded-xl overflow-hidden border">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="relative h-24 bg-gray-50 rounded-lg overflow-hidden border cursor-pointer hover:border-blue-500"
              >
                <Image
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={`${product.name} view ${i + 1}`}
                  fill
                  className="object-contain p-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-blue-700">${product.price.toFixed(2)}</span>
              {product.stock > 0 ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="border-t border-b py-6 space-y-4">
            <div className="flex items-center">
              <div className="w-1/3 text-gray-600">Material</div>
              <div>Premium Glass</div>
            </div>
            <div className="flex items-center">
              <div className="w-1/3 text-gray-600">Dimensions</div>
              <div>Varies by product</div>
            </div>
            <div className="flex items-center">
              <div className="w-1/3 text-gray-600">Care</div>
              <div>Hand wash recommended</div>
            </div>
          </div>

          <div className="space-y-4">
            <AddToCartButton product={product} />
            <AddToWishlistButton product={product} />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
              </svg>
              <span className="font-medium">Free shipping</span>
            </div>
            <p className="text-sm text-gray-600">On orders over $50. Usually ships within 2-3 business days.</p>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button className="border-b-2 border-blue-600 text-blue-600 font-medium py-4 px-1">Description</button>
          <button className="text-gray-500 hover:text-gray-700 py-4 px-1">Specifications</button>
          <button className="text-gray-500 hover:text-gray-700 py-4 px-1">Reviews</button>
        </div>
      </div>

      <div className="prose max-w-none">
        <h2>Product Description</h2>
        <p>{product.description}</p>
        <p>
          Our glass products are crafted with precision and care, ensuring that each piece meets our high standards of
          quality. The elegant design makes it a perfect addition to any home or office space.
        </p>
        <h3>Features</h3>
        <ul>
          <li>Made from premium quality glass</li>
          <li>Elegant and timeless design</li>
          <li>Durable and long-lasting</li>
          <li>Easy to clean and maintain</li>
        </ul>
      </div>

      {/* Related Products */}
      {filteredRelatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredRelatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct._id}
                href={`/products/${relatedProduct._id}`}
                className="group bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={relatedProduct.imageUrl || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium group-hover:text-blue-600 transition-colors">{relatedProduct.name}</h3>
                  <p className="text-blue-700 font-bold mt-1">${relatedProduct.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
