'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './components/Modal'
import AgentEditModal from './components/AgentEditModal'
import DeleteConfirmModal from './components/DeleteConfirmModal';
import SalesTab from './components/SalesTab';
import { AgentType } from '../../types/Agent'
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiUserPlus, FiLogOut, FiUsers, FiBriefcase, FiAward, FiDollarSign } from 'react-icons/fi'

export default function AdminDashboard() {
  const [agents, setAgents] = useState<AgentType[]>([])
  const [filteredAgents, setFilteredAgents] = useState<AgentType[]>([])
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AgentType | null>(null)
  const [deletingAgent, setDeletingAgent] = useState<AgentType | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAgentData, setNewAgentData] = useState({
    name: '',
    email: '',
    password: '',
    level: 'L1',
    totalSales: 0,
    agentCommissionPercentage: 60, // Default value: agent gets 60%
    organizationCommissionPercentage: 40, // Default value: organization gets 40%
  })

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [commissionFilter, setCommissionFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('agents');
  
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check-admin')
        
        if (response.ok) {
          setIsAuthorized(true)
          fetchAgents()
        } else {
          router.replace('/admin-login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.replace('/admin-login')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  // Update your fetchAgents function
  const fetchAgents = async () => {
    try {
      console.log('Fetching agents data...');
      const timestamp = new Date().getTime(); // Add timestamp for cache busting
      const response = await fetch(`/api/agents?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      
      const data = await response.json();
      console.log('Fetched agents data:', data);
      
      // Add detailed logging for the commission fields
      data.forEach((agent: AgentType) => {
        console.log(`Agent ${agent.name}:`, {
          id: agent._id,
          agentCommission: agent.agentCommissionPercentage,
          orgCommission: agent.organizationCommissionPercentage,
          agentCommissionType: typeof agent.agentCommissionPercentage,
          orgCommissionType: typeof agent.organizationCommissionPercentage,
        });
      });
      
      setAgents(data);
      setFilteredAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      showModal('Failed to load agents', 'error');
    }
  }

  // Add this function to validate percentages
  const validateCommissionPercentages = (): boolean => {
    const total = newAgentData.agentCommissionPercentage + newAgentData.organizationCommissionPercentage;
    return total === 100;
  }

  // Handle new agent input change
  const handleNewAgentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle commission percentages specially
    if (name === 'agentCommissionPercentage' || name === 'organizationCommissionPercentage') {
      const numValue = parseInt(value) || 0;
      
      // Enforce valid percentage range
      const clampedValue = Math.max(0, Math.min(100, numValue));
      
      if (name === 'agentCommissionPercentage') {
        setNewAgentData({
          ...newAgentData,
          agentCommissionPercentage: clampedValue,
          organizationCommissionPercentage: 100 - clampedValue
        });
      } else {
        setNewAgentData({
          ...newAgentData,
          organizationCommissionPercentage: clampedValue,
          agentCommissionPercentage: 100 - clampedValue
        });
      }
    } else {
      // Handle other fields normally
      setNewAgentData({
        ...newAgentData,
        [name]: name === 'totalSales' ? parseFloat(value) : value,
      });
    }
  }

  // Handle adding a new agent
  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if commission percentages add up to 100%
    if (!validateCommissionPercentages()) {
      showModal('Commission percentages must total 100%', 'error');
      return;
    }
    
    try {
      console.log('Sending new agent data:', newAgentData); // Debug log
      
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify(newAgentData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create agent');
      }
      
      const data = await response.json();
      console.log('New agent created:', data);
      
      // Reset form and update agent list
      setNewAgentData({
        name: '',
        email: '',
        password: '',
        level: 'L1',
        totalSales: 0,
        agentCommissionPercentage: 60, // Reset to default
        organizationCommissionPercentage: 40 // Reset to default
      });
      
      setShowAddForm(false);
      fetchAgents();
      showModal('Agent created successfully', 'success');
    } catch (error) {
      console.error('Error adding agent:', error);
      showModal(error instanceof Error ? error.message : 'Failed to create agent', 'error');
    }
  }

  // Handle edit button click
  const handleEditClick = (agent: AgentType) => {
    console.log('Editing agent with role:', agent)
    setEditingAgent(agent)
  }

  // Replace your existing handleDeleteAgent function
  const handleDeleteClick = (agent: AgentType) => {
    setDeletingAgent(agent);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAgent) return;
    
    try {
      const response = await fetch(`/api/agents/${deletingAgent._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      
      // Remove agent from state
      setAgents(agents.filter(agent => agent._id !== deletingAgent._id));
      showModal('Agent deleted successfully', 'success');
      setDeletingAgent(null); // Close the confirmation modal
    } catch (error) {
      console.error('Error deleting agent:', error);
      showModal('Failed to delete agent', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeletingAgent(null);
  };

  // Handle sort toggle
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new column and default to ascending
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  // Handle modal
  const showModal = (message: string, type: 'success' | 'error') => {
    setModalMessage(message)
    setModalType(type)
    setModalOpen(true)
    
    // Auto-close success messages
    if (type === 'success') {
      setTimeout(() => {
        setModalOpen(false)
      }, 3000)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/admin-login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Stats calculations
  const totalAgents = filteredAgents.length
  const totalSales = filteredAgents.reduce((sum, agent) => sum + agent.totalSales, 0)
  const l1Agents = filteredAgents.filter(agent => agent.level === 'L1').length
  const l2Agents = filteredAgents.filter(agent => agent.level === 'L2').length

  // Format currency helper (already added)
  const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  // Apply filters and search
  useEffect(() => {
    if (!agents.length) return

    let result = [...agents]
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(agent => 
        agent.name.toLowerCase().includes(term) || 
        agent.email.toLowerCase().includes(term)
      )
    }
    
    // Apply level filter
    if (levelFilter !== 'all') {
      result = result.filter(agent => agent.level === levelFilter)
    }
    
    // Apply commission filter
    if (commissionFilter !== 'all') {
      if (commissionFilter === 'agent-favored') {
        result = result.filter(agent => agent.agentCommissionPercentage >= 60);
      } else if (commissionFilter === 'org-favored') {
        result = result.filter(agent => agent.organizationCommissionPercentage >= 60);
      } else if (commissionFilter === 'balanced') {
        result = result.filter(agent => 
          agent.agentCommissionPercentage >= 40 && 
          agent.agentCommissionPercentage <= 60
        );
      }
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'level':
          comparison = a.level.localeCompare(b.level)
          break
        case 'totalSales':
          comparison = a.totalSales - b.totalSales
          break
        default:
          comparison = 0
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    console.log('Filtered agents:', result);
    setFilteredAgents(result)
  }, [agents, searchTerm, levelFilter, commissionFilter, sortBy, sortDirection])

  // Refetch agents when authorized
  useEffect(() => {
    if (isAuthorized) {
      console.log('Fetching agents as authorized user');
      fetchAgents();
    }
  }, [isAuthorized])

  // Debug function to check commission data
  useEffect(() => {
    if (filteredAgents.length > 0) {
      console.log('Commission data check:', filteredAgents.map(agent => ({
        id: agent._id,
        name: agent.name,
        agentCommission: agent.agentCommissionPercentage,
        orgCommission: agent.organizationCommissionPercentage
      })));
    }
  }, [filteredAgents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fcf5e5]">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#b9314f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-lg font-medium text-[#b9314f]">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // This will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-[#fcf5e5]">
      {/* Header with shadow for depth */}
      <header className="bg-white shadow-sm border-b border-[#dab88b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#432818] tracking-tight">Agent Portal Admin</h1>
            <button
              onClick={handleLogout}
              className="bg-[#b9314f] text-white px-4 py-2 rounded hover:bg-[#91203b] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#432818]">Admin Dashboard</h1>
          {/* Logout button... */}
        </div>

        {/* Add the tab navigation here */}
        <div className="mb-6 border-b border-[#dab88b]">
          <div className="flex space-x-4">
            <button 
              className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'agents' 
                  ? 'border-[#b9314f] text-[#b9314f]' 
                  : 'border-transparent text-gray-500 hover:text-[#432818]'
              }`}
              onClick={() => setActiveTab('agents')}
            >
              <FiUsers size={18} />
              Agents
            </button>
            <button 
              className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'sales' 
                  ? 'border-[#b9314f] text-[#b9314f]' 
                  : 'border-transparent text-gray-500 hover:text-[#432818]'
              }`}
              onClick={() => setActiveTab('sales')}
            >
              <FiDollarSign size={18} />
              Sales
            </button>
          </div>
        </div>
        
        {/* Conditionally render content based on active tab */}
        {activeTab === 'agents' ? (
          // Your existing agents table and related components
          <div className="bg-white shadow-md rounded-lg border border-[#dab88b] overflow-hidden">
            {/* Existing agents content... */}
            {/* Search, filters, table, etc. */}
            {/* Panel header */}
            <div className="border-b border-[#dab88b] bg-[#fff3dd] px-6 py-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold text-[#432818]">Agent Management</h2>
                
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-grow md:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search agents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <FiSearch size={16} />
                    </div>
                  </div>
                  
                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 border border-[#dab88b] rounded-md flex items-center justify-center gap-2 hover:bg-[#fff3dd] transition-colors text-sm font-medium"
                  >
                    <FiFilter size={16} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  
                  {/* Add Agent Button */}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-[#b9314f] text-white px-4 py-2 rounded-md hover:bg-[#91203b] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FiUserPlus size={16} /> {showAddForm ? 'Cancel' : 'Add Agent'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filters Row */}
            {showFilters && (
              <div className="px-6 py-4 bg-[#fff3dd] border-b border-[#dab88b]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#432818] mb-1 text-sm font-medium">Agent Level</label>
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                    >
                      <option value="all">All Levels</option>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[#432818] mb-1 text-sm font-medium">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="level">Level</option>
                      <option value="totalSales">Total Sales</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[#432818] mb-1 text-sm font-medium">Direction</label>
                    <select
                      value={sortDirection}
                      onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                {/* Add this to your filters section */}
                <div className="mb-4">
                  <label htmlFor="commissionFilter" className="block text-sm font-medium text-[#432818] mb-1">
                    Commission Filter
                  </label>
                  <select
                    id="commissionFilter"
                    className="mt-1 block w-full border border-[#dab88b] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#b9314f] focus:border-[#b9314f]"
                    value={commissionFilter}
                    onChange={(e) => setCommissionFilter(e.target.value)}
                  >
                    <option value="all">All Splits</option>
                    <option value="agent-favored">Agent Favored (≥60%)</option>
                    <option value="org-favored">Organization Favored (≥60%)</option>
                    <option value="balanced">Balanced (40-60%)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Add agent form */}
            {showAddForm && (
              <div className="px-6 py-4 border-b border-[#dab88b]">
                <form onSubmit={handleAddAgent} className="bg-[#fff3dd] rounded-lg border border-[#dab88b] p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[#432818] border-b border-[#dab88b] pb-2">Add New Agent</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[#432818] mb-1 text-sm font-medium">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newAgentData.name}
                        onChange={handleNewAgentChange}
                        className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#432818] mb-1 text-sm font-medium">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newAgentData.email}
                        onChange={handleNewAgentChange}
                        className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#432818] mb-1 text-sm font-medium">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={newAgentData.password}
                        onChange={handleNewAgentChange}
                        className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                    </div>
                    <div>
                      <label className="block text-[#432818] mb-1 text-sm font-medium">Level</label>
                      <select
                        name="level"
                        value={newAgentData.level}
                        onChange={handleNewAgentChange}
                        className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                      >
                        <option value="L1">L1</option>
                        <option value="L2">L2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#432818] mb-1 text-sm font-medium">Total Sales (Rs.)</label>
                      <input
                        type="number"
                        name="totalSales"
                        value={newAgentData.totalSales}
                        onChange={handleNewAgentChange}
                        className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#432818] mb-1 text-sm font-medium">Agent Commission (%)</label>
                      <input
                        type="number"
                        name="agentCommissionPercentage"
                        value={newAgentData.agentCommissionPercentage}
                        onChange={handleNewAgentChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#432818] mb-1 text-sm font-medium">Organization Commission (%)</label>
                      <input
                        type="number"
                        name="organizationCommissionPercentage"
                        value={newAgentData.organizationCommissionPercentage}
                        onChange={handleNewAgentChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Commission Split Preview - New Section */}
                  <div className="mt-4 mb-4 border-t border-[#dab88b] pt-4">
                    <label className="block text-sm font-medium text-[#432818] mb-2">Commission Split Preview</label>
                    
                    <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <div 
                        className="bg-gradient-to-r from-[#b9314f] to-[#dd4b68] text-white text-xs flex items-center justify-center font-medium transition-all duration-300"
                        style={{ width: `${newAgentData.agentCommissionPercentage}%` }}
                      >
                        {newAgentData.agentCommissionPercentage >= 15 ? `${newAgentData.agentCommissionPercentage}%` : ''}
                      </div>
                      <div 
                        className="bg-gradient-to-r from-[#dab88b] to-[#e8c9a0] text-[#432818] text-xs flex items-center justify-center font-medium transition-all duration-300"
                        style={{ width: `${newAgentData.organizationCommissionPercentage}%` }}
                      >
                        {newAgentData.organizationCommissionPercentage >= 15 ? `${newAgentData.organizationCommissionPercentage}%` : ''}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs mt-1 text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-[#b9314f] rounded-full"></span>
                        <span>Agent</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Organization</span>
                        <span className="w-2 h-2 bg-[#dab88b] rounded-full"></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#b9314f] text-white px-4 py-2 rounded-md hover:bg-[#91203b] transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <FiUserPlus size={16} /> Add Agent
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Agent Table */}
            {activeTab === 'agents' ? (
              filteredAgents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#dab88b]">
                    <thead>
                      <tr className="bg-[#fff3dd]">
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('name')}>
                          <div className="flex items-center gap-1">
                            Name
                            {sortBy === 'name' && (
                              <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('email')}>
                          <div className="flex items-center gap-1">
                            Email
                            {sortBy === 'email' && (
                              <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('level')}>
                          <div className="flex items-center gap-1">
                            Level
                            {sortBy === 'level' && (
                              <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('totalSales')}>
                          <div className="flex items-center gap-1">
                            Total Sales
                            {sortBy === 'totalSales' && (
                              <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        {/* Add Commission Split Column Header */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                          Commission Split
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#dab88b]">
                      {filteredAgents.map((agent) => (
                        <tr key={agent._id} className="hover:bg-[#fff3dd] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[#432818]">{agent.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{agent.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              agent.level === 'L2' 
                              ? 'bg-[#b9314f] text-white' 
                              : 'bg-[#dab88b] text-[#432818]'
                            }`}>
                              {agent.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 font-medium">{formatCurrency(agent.totalSales)}</div>
                          </td>
                          
                          {/* Commission Split Cell - Beautiful Visual Version */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full">
                              {/* Visual split bar */}
                              <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200">
                                <div 
                                  className="bg-gradient-to-r from-[#b9314f] to-[#dd4b68] text-white text-xs flex items-center justify-center font-medium"
                                  style={{ width: `${agent.agentCommissionPercentage}%` }}
                                >
                                  {agent.agentCommissionPercentage >= 15 ? `${agent.agentCommissionPercentage}%` : ''}
                                </div>
                                <div 
                                  className="bg-gradient-to-r from-[#dab88b] to-[#e8c9a0] text-[#432818] text-xs flex items-center justify-center font-medium"
                                  style={{ width: `${agent.organizationCommissionPercentage}%` }}
                                >
                                  {agent.organizationCommissionPercentage >= 15 ? `${agent.organizationCommissionPercentage}%` : ''}
                                </div>
                              </div>

                              {/* Labels */}
                              <div className="flex justify-between text-xs mt-1 text-gray-600">
                                <div className="flex items-center">
                                  <span className="w-2 h-2 bg-[#b9314f] rounded-full mr-1"></span>
                                  <span>Agent</span>
                                </div>
                                <div className="flex items-center">
                                  <span>Organization</span>
                                  <span className="w-2 h-2 bg-[#dab88b] rounded-full ml-1"></span>
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-4">
                              <button
                                onClick={() => handleEditClick(agent)}
                                className="text-blue-600 hover:text-blue-900 transition-colors flex items-center gap-1"
                              >
                                <FiEdit size={16} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(agent)}
                                className="text-red-600 hover:text-red-900 transition-colors flex items-center gap-1"
                              >
                                <FiTrash2 size={16} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-[#432818] text-lg font-medium">
                    {searchTerm || levelFilter !== 'all' 
                      ? 'No agents match your search criteria.' 
                      : 'No agents found. Add your first agent with the button above.'}
                  </p>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    {searchTerm || levelFilter !== 'all' 
                      ? 'Try adjusting your search or filter parameters to find what you\'re looking for.'
                      : 'Get started by creating your first agent using the "Add Agent" button.'
                    }
                  </p>
                </div>
              )
            ) : (
              <SalesTab />
            )}

            {/* Pagination placeholder - if needed later */}
            {filteredAgents.length > 0 && (
              <div className="bg-white px-4 py-3 border-t border-[#dab88b] sm:px-6">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredAgents.length}</span> agents
                </div>
              </div>
            )}
          </div>
        ) : (
          // Render the sales tab when selected
          <SalesTab />
        )}
        
        {/* Your modals for agents can stay here */}
        <AgentEditModal
          agent={editingAgent}
          isOpen={!!editingAgent}
          onClose={() => setEditingAgent(null)}
          onSuccess={() => {
            console.log('Agent edit success, forcing fresh data fetch...');
            
            // Force a completely fresh fetch with new cache bust
            setTimeout(() => {
              fetchAgents();
            }, 100); // Small delay to ensure server has processed the change
            
            showModal('Agent updated successfully', 'success');
          }}
        />
        
        {/* Status Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
        >
          {modalMessage}
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          agent={deletingAgent}
          isOpen={!!deletingAgent}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  )
}
