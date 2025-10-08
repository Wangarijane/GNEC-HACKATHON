// client/src/pages/business/MyFoodItems.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  DollarSign,
  Package,
  Filter,
  Search,
  RefreshCw,
  Share,
  MoreVertical
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import foodService from '../../services/foodService';
import toast from 'react-hot-toast';

const MyFoodItems = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    urgency: 'all',
    dateRange: 'all'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    all: 0,
    available: 0,
    claimed: 0,
    delivered: 0,
    expired: 0
  });

  useEffect(() => {
    fetchMyFoodItems();
  }, [activeTab, searchTerm, sortBy, filters, currentPage]);

  const fetchMyFoodItems = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy
      };

      // Add status filter
      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      // Add search
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add category filter
      if (filters.category !== 'all') {
        params.category = filters.category;
      }

      // Add urgency filter
      if (filters.urgency !== 'all') {
        params.urgency = filters.urgency;
      }

      // Add date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        }
        
        if (startDate) {
          params.startDate = startDate.toISOString();
        }
      }

      // Fetch data from backend
      const response = await foodService.getMyFoodItems(params);
      
      if (response.data.success) {
        setFoodItems(response.data.data.foodItems);
        setTotalItems(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.pages);
        
        // Update stats if available
        if (response.data.data.stats) {
          setStats(response.data.data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      toast.error(error.response?.data?.message || 'Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this food item? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await foodService.deleteFoodItem(itemId);
      
      if (response.data.success) {
        setFoodItems(prev => prev.filter(item => item._id !== itemId));
        toast.success('Food item deleted successfully');
        // Refresh to update counts
        fetchMyFoodItems();
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete food item');
    }
  };

  const handleEditItem = (itemId) => {
    navigate(`/business/post-food?edit=${itemId}`);
  };

  const handleViewDetails = (itemId) => {
    navigate(`/business/food/${itemId}`);
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to perform bulk action');
      return;
    }

    const selectedIds = Array.from(selectedItems);
    
    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
            const response = await foodService.bulkDeleteFoodItems(selectedIds);
            if (response.data.success) {
              setSelectedItems(new Set());
              toast.success(`${selectedIds.length} items deleted successfully`);
              fetchMyFoodItems();
            }
          }
          break;
          
        case 'mark_expired':
          const response = await foodService.bulkUpdateStatus(selectedIds, 'expired');
          if (response.data.success) {
            setSelectedItems(new Set());
            toast.success(`${selectedIds.length} items marked as expired`);
            fetchMyFoodItems();
          }
          break;
          
        default:
          toast.info('Feature coming soon');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    }
  };

  const handleToggleSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === foodItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(foodItems.map(item => item._id)));
    }
  };

  const handleShareItem = (item) => {
    const url = `${window.location.origin}/food/${item._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Food item link copied to clipboard!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <Clock className="h-4 w-4 text-green-600" />;
      case 'claimed': return <Users className="h-4 w-4 text-blue-600" />;
      case 'in_transit': return <Package className="h-4 w-4 text-purple-600" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'claimed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilExpiry = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return { text: 'Expired', color: 'text-red-600' };
    if (hours < 1) return { text: 'Expires soon', color: 'text-red-600' };
    if (hours < 6) return { text: `${hours}h left`, color: 'text-red-600' };
    if (hours < 24) return { text: `${hours}h left`, color: 'text-yellow-600' };
    const days = Math.floor(hours / 24);
    return { text: `${days}d left`, color: 'text-green-600' };
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meals': return '🍽️';
      case 'bakery': return '🥖';
      case 'produce': return '🥬';
      case 'dairy': return '🥛';
      case 'beverages': return '🥤';
      case 'snacks': return '🍿';
      default: return '🍱';
    }
  };

  const tabs = [
    { id: 'all', label: 'All Items', count: stats.all },
    { id: 'available', label: 'Available', count: stats.available },
    { id: 'claimed', label: 'Claimed', count: stats.claimed },
    { id: 'delivered', label: 'Delivered', count: stats.delivered },
    { id: 'expired', label: 'Expired', count: stats.expired }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'expiring', label: 'Expiring Soon' },
    { value: 'value_high', label: 'Value: High to Low' },
    { value: 'value_low', label: 'Value: Low to High' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Food Items</h1>
          <p className="text-gray-600 mt-1">
            Manage your posted food items and track their status
            {totalItems > 0 && (
              <span className="ml-2 text-sm">
                ({totalItems} total item{totalItems !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center space-x-2 ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          
          <button
            onClick={() => fetchMyFoodItems()}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <Link to="/business/post-food" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Post New Food</span>
          </Link>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search food items..."
            className="input-field pl-10 w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        {/* Sort */}
        <select
          className="input-field lg:w-48"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, category: e.target.value }));
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Categories</option>
                <option value="meals">Prepared Meals</option>
                <option value="bakery">Bakery Items</option>
                <option value="produce">Fresh Produce</option>
                <option value="dairy">Dairy Products</option>
                <option value="beverages">Beverages</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                className="input-field"
                value={filters.urgency}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, urgency: e.target.value }));
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Levels</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Posted
              </label>
              <select
                className="input-field"
                value={filters.dateRange}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, dateRange: e.target.value }));
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('mark_expired')}
                className="btn-secondary text-sm py-1 px-3"
              >
                Mark Expired
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700 text-sm font-medium py-1 px-3"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                  setSelectedItems(new Set());
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Food Items Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : foodItems.length === 0 ? (
          <div className="card text-center py-12">
            <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {activeTab === 'all' ? 'No food items posted yet' : `No ${activeTab} food items`}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filters.category !== 'all' || filters.urgency !== 'all' || filters.dateRange !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : activeTab === 'all' 
                  ? 'Start by posting your first food item to help reduce waste.'
                  : `You don't have any ${activeTab} food items at the moment.`
              }
            </p>
            {activeTab === 'all' && !searchTerm && (
              <Link to="/business/post-food" className="btn-primary">
                Post Your First Food Item
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((item) => {
                const expiryInfo = getTimeUntilExpiry(item.expiresAt);
                
                return (
                  <div key={item._id} className="card relative">
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item._id)}
                        onChange={() => handleToggleSelect(item._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status}</span>
                      </span>
                    </div>

                    {/* Image */}
                    <div 
                      className="relative h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden cursor-pointer"
                      onClick={() => handleViewDetails(item._id)}
                    >
                      {item.images && item.images.length > 0 && item.images[0].url ? (
                        <img 
                          src={item.images[0].url} 
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${getCategoryIcon(item.category)}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          {getCategoryIcon(item.category)}
                        </div>
                      )}
                      
                      {/* Urgency Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getUrgencyColor(item.urgencyLevel)}`}>
                          {item.urgencyLevel} priority
                        </span>
                      </div>

                      {/* Dietary Info */}
                      {item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <div className="absolute bottom-2 right-2">
                          <div className="flex flex-wrap gap-1">
                            {item.dietaryInfo.slice(0, 2).map((diet, index) => (
                              <span 
                                key={index}
                                className="bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full text-gray-700"
                              >
                                {diet.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div>
                        <h3 
                          className="font-semibold text-lg text-gray-900 mb-1 cursor-pointer hover:text-primary-600 transition-colors line-clamp-1"
                          onClick={() => handleViewDetails(item._id)}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      </div>

                      {/* Quantity and Value */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {item.quantity.value} {item.quantity.unit}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 font-medium">
                            ${item.estimatedValue}
                          </span>
                        </div>
                      </div>

                      {/* Expiry Info */}
                      <div className={`flex items-center space-x-1 text-sm font-medium ${expiryInfo.color}`}>
                        <Clock className="h-4 w-4" />
                        <span>{expiryInfo.text}</span>
                      </div>

                      {/* Match Info */}
                      {item.matches && item.matches.length > 0 && item.status === 'available' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <div className="flex items-center space-x-2 text-sm text-blue-700">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">
                              {item.matches.length} recipient{item.matches.length > 1 ? 's' : ''} interested
                            </span>
                          </div>
                        </div>
                      )}

                      {item.status === 'claimed' && item.assignedTo && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <div className="flex items-center space-x-2 text-sm text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span>Assigned to {item.assignedTo.recipient.firstName}</span>
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Posted {formatDate(item.createdAt)}</span>
                        <span>Expires {formatDate(item.expiresAt)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <button 
                          onClick={() => handleViewDetails(item._id)}
                          className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                        
                        {item.status === 'available' && (
                          <>
                            <button 
                              onClick={() => handleEditItem(item._id)}
                              className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleShareItem(item)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Share className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNumber = i + 1;
                    // Show first, last, current, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === pageNumber
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyFoodItems;
