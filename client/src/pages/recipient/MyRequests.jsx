// client/src/pages/recipient/MyRequests.jsx
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const MyRequests = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchMyRequests();
  }, [activeTab]);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, fetch from API
      const mockRequests = [
        {
          _id: '1',
          status: 'accepted',
          createdAt: '2024-01-15T10:30:00Z',
          timeline: {
            matched: '2024-01-15T10:30:00Z',
            accepted: '2024-01-15T11:00:00Z'
          },
          foodItem: {
            _id: 'f1',
            title: 'Fresh Vegetable Soup',
            description: 'Homemade soup with seasonal vegetables',
            category: 'meals',
            quantity: { value: 8, unit: 'servings' },
            images: ['/images/soup.jpg']
          },
          business: {
            firstName: 'John',
            lastName: 'Smith',
            profile: { businessName: 'Green Garden Restaurant' }
          },
          estimatedImpact: {
            mealsProvided: 8,
            peopleServed: 4,
            co2Saved: 12.5,
            moneySaved: 35
          }
        },
        {
          _id: '2',
          status: 'pending',
          createdAt: '2024-01-15T14:20:00Z',
          timeline: {
            matched: '2024-01-15T14:20:00Z'
          },
          foodItem: {
            _id: 'f2',
            title: 'Bakery Assortment',
            description: 'Mixed pastries and bread',
            category: 'bakery',
            quantity: { value: 15, unit: 'pieces' },
            images: ['/images/bakery.jpg']
          },
          business: {
            firstName: 'Maria',
            lastName: 'Garcia',
            profile: { businessName: 'Sunrise Bakery' }
          },
          estimatedImpact: {
            mealsProvided: 15,
            peopleServed: 8,
            co2Saved: 18.2,
            moneySaved: 45
          }
        }
      ];

      let filteredRequests = mockRequests;
      if (activeTab !== 'all') {
        filteredRequests = mockRequests.filter(req => req.status === activeTab);
      }

      setRequests(filteredRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'accepted': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'declined': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const tabs = [
    { id: 'all', label: 'All Requests', count: requests.length },
    { id: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { id: 'accepted', label: 'Accepted', count: requests.filter(r => r.status === 'accepted').length },
    { id: 'completed', label: 'Completed', count: requests.filter(r => r.status === 'completed').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Food Requests</h1>
        <p className="text-gray-600 mt-1">Track your food requests and pickup status</p>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-accent-100 text-accent-600'
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

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="card text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {activeTab === 'all' ? 'No requests yet' : `No ${activeTab} requests`}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' 
                ? 'Start browsing available food items to make your first request.'
                : `You don't have any ${activeTab} requests at the moment.`
              }
            </p>
            <button className="btn-accent">Browse Food</button>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="card">
              <div className="flex items-start space-x-4">
                {/* Food Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {request.foodItem.images && request.foodItem.images[0] ? (
                    <img 
                      src={request.foodItem.images[0]} 
                      alt={request.foodItem.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl">🍱</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {request.foodItem.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        from {request.business.profile?.businessName || 
                              `${request.business.firstName} ${request.business.lastName}`}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-500">Quantity</span>
                      <p className="text-sm font-medium">
                        {request.foodItem.quantity.value} {request.foodItem.quantity.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Meals</span>
                      <p className="text-sm font-medium">{request.estimatedImpact.mealsProvided}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">CO₂ Saved</span>
                      <p className="text-sm font-medium">{request.estimatedImpact.co2Saved} kg</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Value</span>
                      <p className="text-sm font-medium">${request.estimatedImpact.moneySaved}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Requested {formatDate(request.createdAt)}</span>
                    </div>
                    {request.timeline.accepted && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Accepted {formatDate(request.timeline.accepted)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>View Details</span>
                    </button>
                    
                    {request.status === 'accepted' && (
                      <button className="btn-primary text-sm py-1 px-3">
                        Contact Business
                      </button>
                    )}
                    
                    {request.status === 'pending' && (
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyRequests;