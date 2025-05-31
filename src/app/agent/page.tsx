'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [agent, setAgent] = useState<any>(null)
  const router = useRouter()

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
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
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
        </div>
        
        {/* Add more agent-specific sections here */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity to display.</p>
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
