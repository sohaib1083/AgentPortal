'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (res.ok) {
      router.push('/agent')
    } else {
      setError(data.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf0]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-lg w-full max-w-md space-y-6 border border-yellow-400"
      >
        <h2 className="text-2xl font-bold text-center text-[#b9314f]">Agent Login</h2>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#b9314f] text-white font-bold py-2 rounded hover:bg-[#91203b]"
        >
          Login
        </button>
      </form>
    </div>
  )
}
