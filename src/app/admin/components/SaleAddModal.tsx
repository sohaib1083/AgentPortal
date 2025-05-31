'use client'

import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

type AgentType = {
  _id: string;
  name: string;
  agentCommissionPercentage: number;
  organizationCommissionPercentage: number;
};

interface SaleAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agents: AgentType[];
}

export default function SaleAddModal({ isOpen, onClose, onSuccess, agents }: SaleAddModalProps) {
  const backdropStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)' // For Safari support
  };
  
  const [formData, setFormData] = useState({
    agentId: '',
    customerName: '',
    productName: '',
    amount: 0,
    saleDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'pending',
    description: '', // Add this field for API compatibility
  })
  
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Reset form data when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        agentId: agents.length > 0 ? agents[0]._id : '',
        customerName: '',
        productName: '',
        amount: 0,
        saleDate: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'pending',
        description: '',
      });
      
      // Set default selected agent
      if (agents.length > 0) {
        setSelectedAgent(agents[0]);
      }
    }
  }, [isOpen, agents]);
  
  // Log agents prop changes
  useEffect(() => {
    console.log("SaleAddModal - agents:", agents);
  }, [agents]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'agentId') {
      const agent = agents.find(a => a._id === value);
      setSelectedAgent(agent || null);
    }
    
    if (name === 'amount') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Calculate commissions based on selected agent and sale amount
  const calculateCommissions = () => {
    if (!selectedAgent || formData.amount <= 0) {
      return { 
        agentCommissionAmount: 0,
        organizationCommissionAmount: 0,
        agentCommissionPercentage: selectedAgent?.agentCommissionPercentage || 0,
        organizationCommissionPercentage: selectedAgent?.organizationCommissionPercentage || 0
      };
    }
    
    const agentAmount = (formData.amount * selectedAgent.agentCommissionPercentage) / 100;
    const orgAmount = (formData.amount * selectedAgent.organizationCommissionPercentage) / 100;
    
    return {
      agentCommissionAmount: agentAmount,
      organizationCommissionAmount: orgAmount,
      agentCommissionPercentage: selectedAgent.agentCommissionPercentage,
      organizationCommissionPercentage: selectedAgent.organizationCommissionPercentage
    };
  };
  
  const commissions = calculateCommissions();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAgent) {
      setError('Please select an agent')
      return
    }
    
    if (formData.amount <= 0) {
      setError('Sale amount must be greater than 0')
      return
    }
    
    if (!formData.customerName.trim()) {
      setError('Please enter a customer name')
      return
    }
    
    if (!formData.productName.trim()) {
      setError('Please enter a property name')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    // Prepare data for API - ensure description is included to avoid validation errors
    const saleData = {
      ...formData,
      agentName: selectedAgent.name,
      description: formData.description || formData.productName, // Use product name as fallback
      ...commissions
    }
    
    console.log('Submitting sale data:', saleData)
    
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create sale')
      }
      
      // Close modal immediately on success
      onClose()
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving sale')
      setIsLoading(false)
    }
  }
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4"
      style={backdropStyle}
    >
      {/* Reduce max height and ensure scrollability */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] flex flex-col">
        {/* Fixed header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-[#dab88b]">
          <h2 className="text-xl font-semibold text-[#432818]">Record New Sale</h2>
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

        {/* Scrollable form content */}
        <div className="flex-grow overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Highlight the agent dropdown with background */}
              <div className="p-3 bg-[#fff3dd] rounded-md border border-[#dab88b]">
                <label className="block text-sm font-semibold text-[#432818] mb-2">
                  Select Agent
                </label>
                <select
                  name="agentId"
                  value={formData.agentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent bg-white"
                  required
                >
                  <option value="">Choose an agent</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                {agents.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    No agents available. Please create agents first.
                  </p>
                )}
              </div>
              
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-[#432818] mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent"
                  required
                />
              </div>
              
              {/* Property Name */}
              <div>
                <label className="block text-sm font-medium text-[#432818] mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent"
                  required
                />
              </div>
              
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-[#432818] mb-1">
                  Sale Amount (Rs.)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rs.</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-12 px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              {/* Sale Date */}
              <div>
                <label className="block text-sm font-medium text-[#432818] mb-1">
                  Sale Date
                </label>
                <input
                  type="date"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent"
                  required
                />
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[#432818] mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#432818] mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent h-20"
                />
              </div>
            </div>
            
            {/* Commission Preview */}
            {selectedAgent && (
              <div className="mt-6 p-4 bg-[#fff3dd] rounded-lg border border-[#dab88b]">
                <h3 className="text-sm font-medium text-[#432818] mb-2">Commission Preview</h3>
                
                <div className="flex h-7 rounded-lg overflow-hidden border border-gray-200 mb-3">
                  <div 
                    className="bg-gradient-to-r from-[#b9314f] to-[#dd4b68] text-white text-xs flex items-center justify-center font-medium"
                    style={{ width: `${selectedAgent.agentCommissionPercentage}%` }}
                  >
                    {selectedAgent.agentCommissionPercentage >= 15 ? `${selectedAgent.agentCommissionPercentage}%` : ''}
                  </div>
                  <div 
                    className="bg-gradient-to-r from-[#dab88b] to-[#e8c9a0] text-[#432818] text-xs flex items-center justify-center font-medium"
                    style={{ width: `${selectedAgent.organizationCommissionPercentage}%` }}
                  >
                    {selectedAgent.organizationCommissionPercentage >= 15 ? `${selectedAgent.organizationCommissionPercentage}%` : ''}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Agent:</span>
                    <p className="font-medium text-[#b9314f]">
                      Rs. {commissions.agentCommissionAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Organization:</span>
                    <p className="font-medium text-[#432818]">
                      Rs. {commissions.organizationCommissionAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Fixed footer */}
        <div className="flex-shrink-0 border-t border-[#dab88b] p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const formElement = document.querySelector('form');
                if (formElement) {
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                  formElement.dispatchEvent(submitEvent);
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-[#b9314f] text-white rounded-md hover:bg-[#91203b] disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}