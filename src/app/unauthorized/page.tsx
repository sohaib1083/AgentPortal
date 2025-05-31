'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Unauthorized() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-[#fcf5e5] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-[#dab88b]">
        <div className="text-4xl mb-4 text-center">🚫</div>
        <h1 className="text-2xl font-bold text-[#b9314f] mb-4 text-center">Access Denied</h1>
        <p className="text-[#2c1b18] mb-6 text-center">
          You don't have permission to access the admin area.
        </p>
        <div className="flex flex-col space-y-3">
          <Link
            href="/admin-login"
            className="bg-[#b9314f] text-white px-4 py-2 rounded text-center hover:bg-[#91203b] transition"
          >
            Login as Admin
          </Link>
          <Link
            href="/"
            className="border border-[#dab88b] px-4 py-2 rounded text-center hover:bg-[#fff3dd] transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}