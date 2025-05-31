'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '../components/Modal'
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiPlus, FiLogOut, FiDollarSign } from 'react-icons/fi'
import Link from 'next/link'
import SaleAddModal from '../components/SaleAddModal'
import SaleEditModal from '../components/SaleEditModal'
import SaleDeleteModal from '../components/SaleDeleteModal'

type SaleType = {
  _id: string
  agentId: {
    _id: string
    name: string
    email: string
  }
  customerName: string
  amount: number
  productName: string
  saleDate: Date
  status: string
  notes?: string
  agentCommissionPercentage: number
  agentCommissionAmount: number
  organizationCommissionPercentage: number
  organizationCommissionAmount: number
  createdAt: string
  updatedAt: string
}

export default function SalesManagement() {
  const [sales, setSales] = useState<SaleType[]>([])
  const [filteredSales, setFilteredSales] = useState<SaleType[]>([])
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [editingSale, setEditingSale] = useState<SaleType | null>(null)
  const [deletingSale, setDeletingSale] = useState<SaleType | null>(null)
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('saleDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: '',
    end: ''
  })
  
  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalSales: 0,
    totalCommission: 0,
    pendingSales: 0,
    completedSales: 0,
    cancelledSales: 0
  })
  
  // 1. Add a state variable to store agents
  const [agents, setAgents] = useState<any[]>([])
  
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check-admin')
        
        if (response.ok) {
          setIsAuthorized(true)
          fetchSales()
          fetchAgents() // Add this line
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

  // Fetch sales data
  const fetchSales = async () => {
    try {
      const timestamp = new Date().getTime(); // Cache busting
      const response = await fetch(`/api/sales?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales')
      }
      
      const data = await response.json()
      console.log('Fetched sales data:', data)
      
      setSales(data)
      setFilteredSales(data)
      calculateSummaryStats(data)
    } catch (error) {
      console.error('Error fetching sales:', error)
      showModal('Failed to load sales', 'error')
    }
  }
  
  // 2. Add a function to fetch agents
  const fetchAgents = async () => {
    try {
      const timestamp = new Date().getTime(); // Cache busting
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
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Add this debug code to display the agents count
  useEffect(() => {
    console.log(`Agents loaded: ${agents.length}`);
  }, [agents]);

  // Calculate summary statistics
  const calculateSummaryStats = (salesData: SaleType[]) => {
    const stats = {
      totalSales: salesData.reduce((sum, sale) => sum + sale.amount, 0),
      totalCommission: salesData.reduce((sum, sale) => sum + sale.organizationCommissionAmount, 0),
      pendingSales: salesData.filter(sale => sale.status === 'pending').length,
      completedSales: salesData.filter(sale => sale.status === 'completed').length,
      cancelledSales: salesData.filter(sale => sale.status === 'cancelled').length
    }
    
    setSummaryStats(stats)
  }

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

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-IN')}`
  }
  
  // Format date helper
  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Apply filters and search
  useEffect(() => {
    if (!sales.length) return

    let result = [...sales]
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(sale => 
        sale.customerName.toLowerCase().includes(term) || 
        sale.productName.toLowerCase().includes(term) ||
        sale.agentId.name.toLowerCase().includes(term)
      )
    }
    
    // Apply agent filter
    if (agentFilter !== 'all') {
      result = result.filter(sale => sale.agentId._id === agentFilter)
    }
    
    // Apply date range filter
    if (dateRangeFilter.start) {
      const startDate = new Date(dateRangeFilter.start)
      result = result.filter(sale => new Date(sale.saleDate) >= startDate)
    }
    
    if (dateRangeFilter.end) {
      const endDate = new Date(dateRangeFilter.end)
      endDate.setHours(23, 59, 59, 999) // Set to end of day
      result = result.filter(sale => new Date(sale.saleDate) <= endDate)
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'customerName':
          comparison = a.customerName.localeCompare(b.customerName)
          break
        case 'productName':
          comparison = a.productName.localeCompare(b.productName)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'saleDate':
          comparison = new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
          break
        case 'agentName':
          comparison = a.agentId.name.localeCompare(b.agentId.name)
          break
        default:
          comparison = 0
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    setFilteredSales(result)
    calculateSummaryStats(result)
  }, [sales, searchTerm, agentFilter, dateRangeFilter, sortBy, sortDirection])

  // Handle edit sale
  const handleEditClick = (sale: SaleType) => {
    // Make sure we're correctly mapping date fields for the modal
    const mappedSale = {
      ...sale,
      // Keep the original saleDate and ensure it's a string in ISO format
      saleDate: sale.saleDate instanceof Date 
        ? sale.saleDate.toISOString().split('T')[0]
        : new Date(sale.saleDate).toISOString().split('T')[0],
      notes: sale.notes || '',
      // Extract just the ID string from the agentId object
      agentId: sale.agentId._id, // This is critical - just use the ID string
    };
    
    console.log("Opening edit modal with fixed sale data:", mappedSale);
    setEditingSale(mappedSale as any)
  }

  // Handle delete sale
  const handleDeleteClick = (sale: SaleType) => {
    setDeletingSale(sale)
  }

  // Handle add sale success
  const handleAddSaleSuccess = () => {
    fetchSales(); // Refresh sales data
    fetchAgents(); // Refresh agents data to update dashboard
  }

  // Handle edit sale success
  const handleEditSaleSuccess = () => {
    fetchSales();
    fetchAgents();
  }

  // Handle delete sale success
  const handleDeleteSaleConfirm = async () => {
    if (!deletingSale) return
    
    try {
      const response = await fetch(`/api/sales/${deletingSale._id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete sale')
      }
      
      setDeletingSale(null)
      fetchSales()
      fetchAgents()
      showModal('Sale deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting sale:', error)
      showModal('Failed to delete sale', 'error')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fcf5e5]">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#b9314f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-lg font-medium text-[#b9314f]">Loading sales data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcf5e5]">
      {/* Header with navigation */}
      <header className="bg-white shadow-sm border-b border-[#dab88b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#432818] tracking-tight">Sales Management</h1>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-[#432818] hover:text-[#b9314f] font-medium transition-colors">
                Back to Agents
              </Link>
              <button
                onClick={() => router.push('/admin-login?logout=true')}
                className="bg-[#b9314f] text-white px-4 py-2 rounded hover:bg-[#91203b] transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-[#dab88b] shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-[#fff3dd] text-[#b9314f]">
                <FiDollarSign size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sales</h3>
                <p className="mt-1 text-3xl font-bold text-[#432818]">{formatCurrency(summaryStats.totalSales)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#dab88b] shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-[#fff3dd] text-[#b9314f]">
                <FiDollarSign size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Org Commission</h3>
                <p className="mt-1 text-3xl font-bold text-[#432818]">{formatCurrency(summaryStats.totalCommission)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#dab88b] shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-[#fff3dd] text-[#b9314f]">
                <FiDollarSign size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed Sales</h3>
                <p className="mt-1 text-3xl font-bold text-[#432818]">{summaryStats.completedSales}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#dab88b] shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-[#fff3dd] text-[#b9314f]">
                <FiDollarSign size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Sales</h3>
                <p className="mt-1 text-3xl font-bold text-[#432818]">{summaryStats.pendingSales}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sales Table Panel */}
        <div className="bg-white shadow-md rounded-lg border border-[#dab88b] overflow-hidden">
          {/* Panel header */}
          <div className="border-b border-[#dab88b] bg-[#fff3dd] px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-semibold text-[#432818]">Sales Records</h2>
              
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                {/* Search Input */}
                <div className="relative flex-grow md:max-w-xs">
                  <input
                    type="text"
                    placeholder="Search sales..."
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
                
                {/* Add Sale Button */}
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="bg-[#b9314f] text-white px-4 py-2 rounded-md hover:bg-[#91203b] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <FiPlus size={16} /> Add Sale
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters Row */}
          {showFilters && (
            <div className="px-6 py-4 bg-[#fff3dd] border-b border-[#dab88b]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#432818] mb-1 text-sm font-medium">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateRangeFilter.start}
                      onChange={(e) => setDateRangeFilter({...dateRangeFilter, start: e.target.value})}
                      className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                    />
                    <input
                      type="date"
                      value={dateRangeFilter.end}
                      onChange={(e) => setDateRangeFilter({...dateRangeFilter, end: e.target.value})}
                      className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#432818] mb-1 text-sm font-medium">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dab88b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent text-sm"
                  >
                    <option value="saleDate">Sale Date</option>
                    <option value="amount">Amount</option>
                    <option value="customerName">Customer Name</option>
                    <option value="productName">Product</option>
                    <option value="agentName">Agent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#432818] mb-1 text-sm font-medium">Sort Direction</label>
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

              {/* Reset filters button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setAgentFilter('all')
                    setDateRangeFilter({ start: '', end: '' })
                    setSortBy('saleDate')
                    setSortDirection('desc')
                  }}
                  className="px-4 py-2 text-[#b9314f] border border-[#b9314f] rounded-md hover:bg-[#fff3dd] transition-colors text-sm font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Sales Table */}
          {filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#dab88b]">
                <thead>
                  <tr className="bg-[#fff3dd]">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('saleDate')}>
                      <div className="flex items-center gap-1">
                        Date
                        {sortBy === 'saleDate' && (
                          <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('customerName')}>
                      <div className="flex items-center gap-1">
                        Customer
                        {sortBy === 'customerName' && (
                          <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('agentName')}>
                      <div className="flex items-center gap-1">
                        Agent
                        {sortBy === 'agentName' && (
                          <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('productName')}>
                      <div className="flex items-center gap-1">
                        Product
                        {sortBy === 'productName' && (
                          <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('amount')}>
                      <div className="flex items-center gap-1">
                        Amount
                        {sortBy === 'amount' && (
                          <span className="text-[#b9314f]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                      Commission Split
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#dab88b]">
                  {filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-[#fff3dd] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(sale.saleDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#432818]">{sale.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{sale.agentId.name}</div>
                        <div className="text-xs text-gray-500">{sale.agentId.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sale.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#432818]">{formatCurrency(sale.amount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500 mb-1">Commission Split:</div>
                        <div className="w-full">
                          {/* Visual commission split */}
                          <div className="flex h-6 rounded-lg overflow-hidden border border-gray-200">
                            <div 
                              className="bg-gradient-to-r from-[#b9314f] to-[#dd4b68] text-white text-xs flex items-center justify-center font-medium"
                              style={{ width: `${sale.agentCommissionPercentage}%` }}
                            >
                              {sale.agentCommissionPercentage >= 15 ? `${sale.agentCommissionPercentage}%` : ''}
                            </div>
                            <div 
                              className="bg-gradient-to-r from-[#dab88b] to-[#e8c9a0] text-[#432818] text-xs flex items-center justify-center font-medium"
                              style={{ width: `${sale.organizationCommissionPercentage}%` }}
                            >
                              {sale.organizationCommissionPercentage >= 15 ? `${sale.organizationCommissionPercentage}%` : ''}
                            </div>
                          </div>
                          
                          {/* Amount breakdown */}
                          <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                            <div>
                              <span className="text-gray-500">Agent:</span> 
                              <span className="font-medium ml-1 text-[#b9314f]">
                                {formatCurrency(sale.agentCommissionAmount)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Org:</span> 
                              <span className="font-medium ml-1 text-[#432818]">
                                {formatCurrency(sale.organizationCommissionAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => {
                              console.log("Edit button clicked for sale:", sale);
                              handleEditClick(sale);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center gap-1"
                          >
                            <FiEdit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(sale)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-[#432818] text-lg font-medium">No sales records found</p>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                {searchTerm || dateRangeFilter.start || dateRangeFilter.end
                  ? 'Try adjusting your search or filter parameters to find what you\'re looking for.'
                  : 'Get started by adding your first sale using the "Add Sale" button.'
                }
              </p>
              <button
                onClick={() => setAddModalOpen(true)}
                className="mt-4 bg-[#b9314f] text-white px-4 py-2 rounded-md hover:bg-[#91203b] transition-colors inline-flex items-center gap-2 text-sm font-medium"
              >
                <FiPlus size={16} /> Add First Sale
              </button>
            </div>
          )}

          {/* Pagination placeholder */}
          {filteredSales.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-[#dab88b] sm:px-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredSales.length}</span> sales
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-[#dab88b] mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">© 2025 Agent Portal. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Edit Sale Modal */}
      {!!editingSale && (
        <div className="fixed top-0 left-0 bg-red-500 text-white p-2 z-[200]">
          Edit Modal should be open for {editingSale?._id}
        </div>
      )}
      
      <SaleEditModal
        sale={editingSale}
        isOpen={!!editingSale}
        onClose={() => {
          console.log("Closing edit modal");
          setEditingSale(null);
        }}
        onSuccess={handleEditSaleSuccess}
        agents={agents}
      />
      
      {/* Delete Sale Modal */}
      <SaleDeleteModal
        sale={deletingSale}
        isOpen={!!deletingSale}
        onClose={() => setDeletingSale(null)}
        onConfirm={handleDeleteSaleConfirm}
      />
      
      {/* Status Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
      >
        {modalMessage}
      </Modal>

      {/* Add Sale Modal */}
      <SaleAddModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSaleSuccess}
        agents={agents}
      />
    </div>
  )
}