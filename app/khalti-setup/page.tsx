export default function KhaltiSetupPage() {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Setting Up Khalti Payment Integration</h1>
  
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">1. Create a Khalti Account</h2>
            <p>
              Visit{" "}
              <a
                href="https://khalti.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Khalti.com
              </a>{" "}
              and create a merchant account if you don't have one already.
            </p>
          </div>
  
          <div>
            <h2 className="text-xl font-semibold mb-3">2. Get Your API Keys</h2>
            <ol className="list-decimal ml-6 space-y-2">
              <li>Log in to your Khalti Merchant Dashboard</li>
              <li>Navigate to "Merchant Tools" or "API Keys" section</li>
              <li>Generate a new Secret Key if you don't have one</li>
              <li>Copy your Secret Key</li>
            </ol>
          </div>
  
          <div>
            <h2 className="text-xl font-semibold mb-3">3. Configure Your Environment Variables</h2>
            <p className="mb-3">
              Add your Khalti Secret Key to your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file:
            </p>
            <div className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
              <pre>KHALTI_SECRET_KEY=your_secret_key_here</pre>
            </div>
          </div>
  
          <div>
            <h2 className="text-xl font-semibold mb-3">4. Test Your Integration</h2>
            <p className="mb-3">For testing purposes, you can use the following test credentials:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Mobile Number: 9800000000</li>
              <li>MPIN: 1111</li>
              <li>OTP: 987654</li>
            </ul>
            <p className="mt-3">For card payments in test mode:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Card Number: 4111111111111111</li>
              <li>Expiry: Any future date</li>
              <li>CVV: Any 3 digits</li>
            </ul>
          </div>
  
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <h2 className="text-lg font-semibold mb-2 text-blue-800">Important Notes</h2>
            <ul className="list-disc ml-6 space-y-1 text-blue-700">
              <li>Make sure your Secret Key is kept secure and not exposed in client-side code</li>
              <li>For production, update your return URL to your actual domain</li>
              <li>Khalti requires a valid phone number format for Nepal (e.g., 98XXXXXXXX)</li>
              <li>The minimum transaction amount is NPR 10 (1000 paisa)</li>
            </ul>
          </div>
  
          <div className="pt-4">
            <a
              href="https://docs.khalti.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-flex items-center"
            >
              <span>Official Khalti Documentation</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    )
  }
  