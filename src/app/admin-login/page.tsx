'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (username === 'NexusAdmin' && password === 'Sohaib@2002') {
      router.push('/admin')
    } else {
      setError('Invalid admin credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef6e4]">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded shadow-md w-full max-w-sm border border-yellow-500">
        <h2 className="text-2xl font-bold text-center text-[#b9314f] mb-6">Admin Login</h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded outline-[#b9314f]"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded outline-[#b9314f]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#b9314f] text-white py-2 rounded font-bold hover:bg-[#91203b] transition"
        >
          Login
        </button>
      </form>
    </div>
  )
}
