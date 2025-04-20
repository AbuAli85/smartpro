import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl mb-4">Page Not Found</h2>
        <p className="mb-6">The page you are looking for does not exist.</p>
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  )
}
