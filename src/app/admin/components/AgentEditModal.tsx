'use client'

import { useEffect, useState } from 'react'
import { AgentType } from '../../../types/Agent'

interface AgentEditModalProps {
  agent: AgentType | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AgentEditModal({ agent, isOpen, onClose, onSuccess }: AgentEditModalProps) {
  const backdropStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)' // For Safari support
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: 'L1',
    totalSales: 0,
    agentCommissionPercentage: 60,
    organizationCommissionPercentage: 40,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Update form data when agent changes
  useEffect(() => {
    if (agent) {
      console.log('Setting form data from agent:', agent); // Debug log
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        level: agent.level || 'L1',
        totalSales: agent.totalSales || 0,
        agentCommissionPercentage: agent.agentCommissionPercentage !== undefined ? agent.agentCommissionPercentage : 60,
        organizationCommissionPercentage: agent.organizationCommissionPercentage !== undefined ? agent.organizationCommissionPercentage : 40,
      })
    }
  }, [agent])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Handle commission percentages specially
    if (name === 'agentCommissionPercentage' || name === 'organizationCommissionPercentage') {
      const numValue = parseInt(value) || 0
      
      // Enforce valid percentage range
      const clampedValue = Math.max(0, Math.min(100, numValue))
      
      if (name === 'agentCommissionPercentage') {
        setFormData({
          ...formData,
          agentCommissionPercentage: clampedValue,
          organizationCommissionPercentage: 100 - clampedValue
        })
      } else {
        setFormData({
          ...formData,
          organizationCommissionPercentage: clampedValue,
          agentCommissionPercentage: 100 - clampedValue
        })
      }
    } else {
      // Handle other fields normally
      setFormData({
        ...formData,
        [name]: name === 'totalSales' ? parseFloat(value) : value,
      })
    }
  }

  // Make sure your handleSubmit function properly sends all commission data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    
    // Verify commission percentages add up to 100%
    if (formData.agentCommissionPercentage + formData.organizationCommissionPercentage !== 100) {
      setError('Commission percentages must total 100%');
      return;
    }
    
    setIsSubmitting(true);
    setError('')

    try {
      console.log('Submitting agent update:', {
        id: agent._id,
        formData: formData
      })
      
      const response = await fetch(`/api/agents/${agent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update agent')
      }

      console.log('Agent updated successfully:', data)
      
      // Force a refresh of the parent component's data
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating agent:', err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4"
      style={backdropStyle}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-[#432818]">Edit Agent</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#432818]">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-[#dab88b] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#b9314f] focus:border-[#b9314f]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#432818]">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-[#dab88b] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#b9314f] focus:border-[#b9314f]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#432818]">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="mt-1 block w-full border border-[#dab88b] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#b9314f] focus:border-[#b9314f]"
              >
                <option value="L1">L1</option>
                <option value="L2">L2</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#432818]">Total Sales (Rs.)</label>
              <input
                type="number"
                name="totalSales"
                value={formData.totalSales}
                onChange={handleChange}
                className="mt-1 block w-full border border-[#dab88b] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#b9314f] focus:border-[#b9314f]"
              />
            </div>
            
            {/* Commission Percentage Fields */}
            <div>
              <label className="block text-sm font-medium text-[#432818]">Agent Commission (%)</label>
              <input
                type="number"
                name="agentCommissionPercentage"
                value={formData.agentCommissionPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="mt-1 block w-full border border-[#dab88b] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#b9314f] focus:border-[#b9314f]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#432818]">Organization Commission (%)</label>
              <input
                type="number"
                name="organizationCommissionPercentage"
                value={formData.organizationCommissionPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="mt-1 block w-full border border-[#dab88b] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#b9314f] focus:border-[#b9314f]"
              />
            </div>
            
            {/* Visual representation of commission split */}
            <div className="mt-4 mb-6 border-t border-[#dab88b] pt-4">
              <label className="block text-sm font-medium text-[#432818] mb-2">Commission Split Preview</label>
              
              <div className="flex items-center">
                <div className="flex-grow h-6 bg-gray-200 rounded-l-full">
                  <div 
                    className="bg-[#b9314f] h-6 rounded-l-full flex items-center justify-center text-xs text-white font-medium" 
                    style={{ width: `${formData.agentCommissionPercentage}%` }}
                  >
                    {formData.agentCommissionPercentage > 10 ? `${formData.agentCommissionPercentage}%` : ''}
                  </div>
                </div>
                <div className="flex-grow h-6 bg-gray-300 rounded-r-full flex items-center justify-center text-xs text-gray-700 font-medium">
                  {formData.organizationCommissionPercentage > 10 ? `${formData.organizationCommissionPercentage}%` : ''}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <div>
                  <span className="w-2 h-2 bg-[#b9314f] inline-block rounded-full mr-1"></span>
                  <span>Agent</span>
                </div>
                <div>
                  <span className="w-2 h-2 bg-gray-300 inline-block rounded-full mr-1"></span>
                  <span>Organization</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 border border-[#dab88b] text-[#432818] rounded-md hover:bg-[#fff3dd] focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#b9314f] text-white rounded-md hover:bg-[#91203b] focus:outline-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}