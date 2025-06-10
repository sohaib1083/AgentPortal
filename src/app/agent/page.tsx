'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [agent, setAgent] = useState<any>(null)
  const [sales, setSales] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '' })
  const router = useRouter()

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales/by-agent')
      if (res.ok) {
        const data = await res.json()
        setSales(data)
      }
    } catch (err) {
      console.error('Failed to fetch sales', err)
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if user is authorized as an agent
        const authResponse = await fetch('/api/auth/check-agent', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!authResponse.ok) {
          // Redirect to login if unauthorized
          router.replace('/login')
          return
        }

        setIsAuthorized(true)
        
        // Fetch agent data
        const agentResponse = await fetch('/api/agents/me')

        if (agentResponse.ok) {
          const agentData = await agentResponse.json()
          setAgent(agentData)
          setProfileData({ name: agentData.name, email: agentData.email, password: '' })
          fetchSales()
        } else {
          console.error('Failed to fetch agent data')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Add this to your agent dashboard component
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Show agent dashboard if authorized
  if (isAuthorized && agent) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Agent Dashboard</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Profile</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-sm text-blue-600 hover:underline"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editing ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const res = await fetch('/api/agents/me', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(profileData),
                })
                if (res.ok) {
                  const data = await res.json()
                  setAgent(data)
                  fetchSales()
                  setEditing(false)
                }
              }}
              className="grid md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-2 py-1"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">New Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-2 py-1"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{agent.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{agent.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Level</p>
                <p className="font-medium">{agent.level}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Sales</p>
                <p className="font-medium">${agent.totalSales.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Recent sales */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
          {sales.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale._id} className="border-t">
                    <td className="px-3 py-2">{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{sale.productName}</td>
                    <td className="px-3 py-2 text-right">Rs. {sale.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No recent sales.</p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    )
  }

  // This shouldn't render, but just in case there's a race condition
  return null
}
