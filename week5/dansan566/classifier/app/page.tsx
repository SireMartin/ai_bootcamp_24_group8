import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Animal Classifier</h1>
        <p className="mb-8">Click below to start classifying animals!</p>
        <Link href="/upload" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Upload Page
        </Link>
      </div>
    </div>
  )
}

