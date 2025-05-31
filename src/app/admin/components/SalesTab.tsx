import { useState, useEffect } from 'react';
import { FiPlusCircle, FiEdit2, FiTrash2, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import SaleEditModal from './SaleEditModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import SaleAddModal from './SaleAddModal';

// Update the SaleType definition to include agentName
type SaleType = {
  _id: string;
  agentId: {
    _id: string;
    name: string;
    email: string;
  };
  agentName?: string; // Add this property
  customerName: string;
  productName: string;
  amount: number;
  date?: string; // Optional for compatibility with existing data
  saleDate: Date;
  description?: string; // Make this optional
  notes?: string;
  agentCommissionPercentage: number;
  agentCommissionAmount: number;
  organizationCommissionPercentage: number;
  organizationCommissionAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
};

type AgentType = {
  _id: string;
  name: string;
  email: string;
  agentCommissionPercentage: number;
  organizationCommissionPercentage: number;
};

export default function SalesTab() {
  const [sales, setSales] = useState<SaleType[]>([]);
  const [filteredSales, setFilteredSales] = useState<SaleType[]>([]);
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [editingSale, setEditingSale] = useState<SaleType | null>(null);
  const [deletingSale, setDeletingSale] = useState<SaleType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [propertyFilter, setPropertyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingSales: 0,
    completedSales: 0,
    cancelledSales: 0,
    totalRevenue: 0,
    organizationEarnings: 0,
    agentEarnings: 0
  });
  
  // Fetch sales data
  const fetchSales = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime(); // Cache busting
      
      const response = await fetch(`/api/sales?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      
      const data = await response.json();
      console.log('Fetched sales:', data);
      setSales(data);
      setFilteredSales(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch agents for dropdown
  const fetchAgents = async () => {
    try {
      const timestamp = new Date().getTime(); 
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
  
  // Calculate stats from sales data
  const calculateStats = (salesData: SaleType[]) => {
    const stats = {
      totalSales: salesData.length,
      pendingSales: salesData.filter(s => s.status === 'pending').length,
      completedSales: salesData.filter(s => s.status === 'completed').length,
      cancelledSales: salesData.filter(s => s.status === 'cancelled').length,
      totalRevenue: salesData.reduce((sum, sale) => sum + sale.amount, 0),
      organizationEarnings: salesData.reduce((sum, sale) => sum + sale.organizationCommissionAmount, 0),
      agentEarnings: salesData.reduce((sum, sale) => sum + sale.agentCommissionAmount, 0)
    };
    
    setStats(stats);
  };
  
  // Apply filters
  useEffect(() => {
    let filtered = [...sales];
    
    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        (sale.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (sale.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        sale.agentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Agent filter
    if (agentFilter !== 'all') {
      filtered = filtered.filter(sale => sale.agentId._id === agentFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }
    
    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(sale => {
        // Use saleDate if available, otherwise fall back to date, and ensure it exists
        const saleDate = sale.saleDate || (sale.date ? new Date(sale.date) : null);
        return saleDate ? saleDate >= new Date(dateRange.start) : false;
      });
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(sale => {
        // Use saleDate if available, otherwise fall back to date, and ensure it exists
        const saleDate = sale.saleDate || (sale.date ? new Date(sale.date) : null);
        return saleDate ? saleDate <= new Date(dateRange.end) : false;
      });
    }
    
    // Property filter
    if (propertyFilter) {
      filtered = filtered.filter(sale => 
        sale.productName.toLowerCase().includes(propertyFilter.toLowerCase())
      );
    }
    
    setFilteredSales(filtered);
  }, [sales, searchTerm, agentFilter, statusFilter, dateRange, propertyFilter]);
  
  // Load data on component mount
  useEffect(() => {
    fetchSales();
    fetchAgents();
  }, []);
  
  // Handle sale deletion
  const handleDeleteConfirm = async () => {
    if (!deletingSale) return;
    
    try {
      const response = await fetch(`/api/sales/${deletingSale._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete sale');
      }
      
      // Refresh sales data
      fetchSales();
      setDeletingSale(null);
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      console.error('Invalid date:', dateString);
      return 'Invalid Date';
    }
  };
  
  // Get status styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // When creating a new sale, include all the required fields:
  const createEmptySale = (): any => {
    return {
      _id: '',
      agentId: { 
        _id: agents.length > 0 ? agents[0]._id : '',
        name: agents.length > 0 ? agents[0].name : '',
        email: agents.length > 0 ? agents[0].email : ''
      },
      agentName: agents.length > 0 ? agents[0].name : '', // Add this
      customerName: '',
      amount: 0,
      productName: '',
      saleDate: new Date(),
      status: 'pending',
      notes: '',
      agentCommissionPercentage: agents.length > 0 ? agents[0].agentCommissionPercentage : 60,
      agentCommissionAmount: 0,
      organizationCommissionPercentage: agents.length > 0 ? agents[0].organizationCommissionPercentage : 40,
      organizationCommissionAmount: 0
    };
  };
  
  return (
    <div className="w-full">
      {/* Header with action buttons */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h2 className="text-xl font-semibold text-[#432818] mb-2 sm:mb-0">Sales Management</h2>
        <button
          onClick={() => setIsAddModalOpen(true)} // Open the add modal
          className="flex items-center gap-2 px-4 py-2 bg-[#b9314f] text-white rounded-md hover:bg-[#91203b] transition-colors"
        >
          <FiPlusCircle size={18} />
          Record Sale
        </button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-lg border border-[#dab88b] shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <div className="text-2xl font-bold text-[#432818]">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>{stats.totalSales} sales</span>
            <span className="text-gray-500">
              {stats.completedSales} completed
            </span>
          </div>
        </div>
        
        {/* Organization Earnings */}
        <div className="bg-white p-4 rounded-lg border border-[#dab88b] shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Organization Earnings</h3>
          <div className="text-2xl font-bold text-[#432818]">
            {formatCurrency(stats.organizationEarnings)}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {((stats.organizationEarnings / stats.totalRevenue) * 100).toFixed(1)}% of total revenue
          </div>
        </div>
        
        {/* Agent Earnings */}
        <div className="bg-white p-4 rounded-lg border border-[#dab88b] shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Agent Earnings</h3>
          <div className="text-2xl font-bold text-[#b9314f]">
            {formatCurrency(stats.agentEarnings)}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {((stats.agentEarnings / stats.totalRevenue) * 100).toFixed(1)}% of total revenue
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-[#dab88b] mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search sales..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b9314f] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#fff3dd] text-[#432818] rounded-md hover:bg-[#ffe8c7] transition-colors text-sm"
          >
            <FiFilter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {/* Extended Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            {/* Agent Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Agent
              </label>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b9314f]"
              >
                <option value="all">All Agents</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b9314f]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b9314f]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b9314f]"
                />
              </div>
            </div>
            
            {/* Property Filter */}
            <div className="mb-4">
              <label htmlFor="propertyFilter" className="block text-sm font-medium text-[#432818] mb-1">
                Filter by Property
              </label>
              <input
                type="text"
                id="propertyFilter"
                className="mt-1 block w-full border border-[#dab88b] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#b9314f] focus:border-[#b9314f]"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                placeholder="Type to filter properties..."
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Sales Table */}
      <div className="bg-white rounded-lg border border-[#dab88b] overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading sales data...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#dab88b]">
              <thead>
                <tr className="bg-[#fff3dd]">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Agent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Agent Comm.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Org. Comm.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#432818] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#dab88b]">
                {filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-[#fff3dd] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-800">
                          {formatDate(sale.date) !== 'N/A' ? formatDate(sale.date) : new Date(sale.saleDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.agentName || sale.agentId.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.customerName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.productName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2 font-medium">Rs.</span>
                        <span className="text-sm font-medium text-gray-900">{sale.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {sale.description || sale.productName || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#b9314f] font-medium">
                        Rs. {sale.agentCommissionAmount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#432818] font-medium">
                        Rs. {sale.organizationCommissionAmount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(sale.status)}`}>
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingSale(sale)}
                          className="text-[#b9314f] hover:text-[#91203b]"
                          title="Edit sale"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeletingSale(sale)}
                          className="text-gray-500 hover:text-red-600"
                          title="Delete sale"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No sales found. Record a new sale to get started.
          </div>
        )}
      </div>
      
      {/* Sale Edit Modal */}
      <SaleEditModal
        sale={editingSale}
        isOpen={!!editingSale}
        onClose={() => setEditingSale(null)}
        onSuccess={() => fetchSales()}
        agents={agents}
      />
      
      {/* Add Sale Modal */}
      <SaleAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchSales(); 
          // Optionally show success toast/message here
        }}
        agents={agents}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingSale}
        onClose={() => setDeletingSale(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sale"
        message={`Are you sure you want to delete this sale record?\nThis action cannot be undone.`}
      />
    </div>
  );
}