'use client'

import { useEffect, useState } from 'react'

export default function AgentPortal() {
  const [agent, setAgent] = useState<any>(null)
  const [amount, setAmount] = useState('')

  const agentId = '68398d396a96165329bb33e2'

  const fetchAgent = async () => {
    const res = await fetch('/api/agents')
    const data = await res.json()
    const match = data.find((a: any) => a._id === agentId)
    setAgent(match)
  }

  const submitSale = async () => {
    if (!amount) return
    await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, amount: parseInt(amount) }),
    })
    setAmount('')
    fetchAgent()
  }

  useEffect(() => {
    fetchAgent()
  }, [])

  if (!agent) return <p className="p-6">Loading...</p>

  return (
    <div className="min-h-screen bg-[#fff8dc] text-[#2c1b18] p-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#b9314f]">
        Welcome, {agent.name}
      </h1>

      <div className="max-w-md mx-auto bg-white p-6 rounded shadow border border-yellow-300">
        <p><strong>Email:</strong> {agent.email}</p>
        <p><strong>Total Sales:</strong> Rs. {agent.totalSales.toLocaleString()}</p>
        <p><strong>Level:</strong> {agent.level}</p>
        <p><strong>Target Remaining:</strong> Rs. {Math.max(0, 500000 - agent.totalSales).toLocaleString()}</p>

        <div className="mt-4">
          <label className="block mb-1 font-medium">Add Sale</label>
          <input
            type="number"
            className="w-full border px-3 py-2 mb-2 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <button
            onClick={submitSale}
            className="bg-[#b9314f] text-white w-full py-2 rounded hover:bg-[#91203b]"
          >
            Submit Sale
          </button>
        </div>
      </div>
    </div>
  )
}
