'use client'

import { useState } from 'react'
import { AgentType } from '../../../types/Agent'

interface AgentEditModalProps {
  agent: AgentType
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AgentEditModal({ agent, isOpen, onClose, onSuccess }: AgentEditModalProps) {
  const [formData, setFormData] = useState({
    name: agent.name,
    email: agent.email,
    level: agent.level,
    totalSales: agent.totalSales
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalSales' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/agents/${agent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update agent')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-[#b9314f]">Edit Agent</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#432818]">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded outline-[#dab88b]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#432818]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded outline-[#dab88b]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#432818]">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded outline-[#dab88b]"
            >
              <option value="L1">L1</option>
              <option value="L2">L2</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#432818]">Total Sales</label>
            <input
              type="number"
              name="totalSales"
              value={formData.totalSales}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded outline-[#dab88b]"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#b9314f] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#91203b] disabled:bg-[#d47a8d]"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}