import ProductList from "@/components/ProductList"
import { getProducts } from "@/lib/products"
import Link from "next/link"
import Image from "next/image"

export default async function Home() {
  const products = await getProducts()
  const featuredProducts = products.slice(0, 4)

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/placeholder.svg?height=600&width=1200" alt="Background pattern" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6 leading-tight">Premium Glass Products for Your Home & Office</h1>
            <p className="text-xl mb-8 opacity-90">
              Discover our exquisite collection of handcrafted glass products that blend elegance with functionality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-lg"
              >
                Shop Collection
              </Link>
              <Link
                href="/about"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-blue-600 hover:underline flex items-center">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
        <ProductList products={featuredProducts} />
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50 rounded-2xl">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=300&width=500" alt="Home Decor" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Home Decor</h3>
                <p className="text-gray-600 mb-4">Elegant glass pieces to enhance your living space</p>
                <Link href="/products?category=home-decor" className="text-blue-600 hover:underline">
                  Explore →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=300&width=500" alt="Kitchenware" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Kitchenware</h3>
                <p className="text-gray-600 mb-4">Functional and beautiful glass products for your kitchen</p>
                <Link href="/products?category=kitchenware" className="text-blue-600 hover:underline">
                  Explore →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Office Accessories"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Office Accessories</h3>
                <p className="text-gray-600 mb-4">Sophisticated glass items for your workspace</p>
                <Link href="/products?category=office" className="text-blue-600 hover:underline">
                  Explore →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-10 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The quality of Ananta Glass products is exceptional. I've purchased multiple items and each one has
                exceeded my expectations."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                <div>
                  <p className="font-medium">Customer {i}</p>
                  <p className="text-sm text-gray-500">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-blue-50 rounded-2xl p-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for exclusive offers and updates on new products.
          </p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
