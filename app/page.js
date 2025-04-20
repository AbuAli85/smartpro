import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Bilingual Contract Generator</h1>
        <p className="text-center mb-6">Create, manage, and sign bilingual contracts with ease.</p>

        <div className="flex flex-col space-y-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded text-center hover:bg-blue-600 transition-colors"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-4 py-2 bg-gray-500 text-white rounded text-center hover:bg-gray-600 transition-colors"
          >
            Register
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded text-center hover:bg-blue-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
