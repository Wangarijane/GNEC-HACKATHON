// client/src/pages/driver/DriverOverview.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, DollarSign, Clock, TrendingUp, MapPin, Package } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import StatsCard from '../../components/ui/StatsCard';

const DriverOverview = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    activeDeliveries: 0,
    rating: 0
  });
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      // Mock data
      setStats({
        totalDeliveries: 142,
        totalEarnings: 1850,
        activeDeliveries: 2,
        rating: 4.8
      });

      setAvailableDeliveries([
        {
          id: 1,
          pickup: 'Green Garden Restaurant',
          dropoff: 'Downtown Food Bank',
          distance: 5.2,
          estimatedEarning: 12,
          urgency: 'high',
          pickupTime: '2:00 PM'
        },
        {
          id: 2,
          pickup: 'Sunrise Bakery',
          dropoff: 'Community Center',
          distance: 3.8,
          estimatedEarning: 8,
          urgency: 'medium',
          pickupTime: '3:30 PM'
        }
      ]);
    } catch (error) {
      console.error('Error fetching driver data:', error);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName}! 🚗
            </h1>
            <p className="opacity-90">
              {isOnline ? 'You\'re online and ready for deliveries' : 'Go online to start accepting deliveries'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleOnlineStatus}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isOnline 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white text-green-600 hover:bg-gray-100'
              }`}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`flex items-center justify-center p-4 rounded-lg ${
        isOnline ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        <span className={`font-medium ${isOnline ? 'text-green-700' : 'text-gray-600'}`}>
          Status: {isOnline ? 'Online & Available' : 'Offline'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Deliveries"
          value={stats.totalDeliveries}
          icon={Package}
          color="green"
          trend="+23"
        />
        <StatsCard
          title="Total Earnings"
          value={`${stats.totalEarnings}`}
          icon={DollarSign}
          color="primary"
          trend="+12%"
        />
        <StatsCard
          title="Active Deliveries"
          value={stats.activeDeliveries}
          icon={Clock}
          color="secondary"
        />
        <StatsCard
          title="Rating"
          value={stats.rating}
          icon={TrendingUp}
          color="accent"
          subtitle="⭐⭐⭐⭐⭐"
        />
      </div>

      {/* Available Deliveries */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            Available Deliveries
          </h3>
          <Link 
            to="/driver/available"
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View all →
          </Link>
        </div>

        {!isOnline ? (
          <div className="text-center py-8">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">Go Online to See Deliveries</h4>
            <p className="text-gray-500 mb-4">Turn on your availability to start accepting delivery requests.</p>
            <button 
              onClick={toggleOnlineStatus}
              className="btn-primary"
            >
              Go Online
            </button>
          </div>
        ) : availableDeliveries.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No Deliveries Available</h4>
            <p className="text-gray-500">Check back later for new delivery opportunities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableDeliveries.map((delivery) => (
              <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        delivery.urgency === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {delivery.urgency} priority
                      </span>
                      <span className="text-sm text-gray-500">
                        Pickup at {delivery.pickupTime}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">{delivery.pickup}</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-1">
                        <div className="w-1 h-6 border-l-2 border-dashed border-gray-300"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">{delivery.dropoff}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-green-600 mb-1">
                      ${delivery.estimatedEarning}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      {delivery.distance} km
                    </div>
                    <button className="btn-primary text-sm px-4 py-2">
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/driver/available"
          className="card card-hover text-center p-6"
        >
          <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Available Deliveries</h3>
          <p className="text-sm text-gray-600">Browse and accept delivery requests</p>
        </Link>

        <Link 
          to="/driver/my-deliveries"
          className="card card-hover text-center p-6"
        >
          <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">My Deliveries</h3>
          <p className="text-sm text-gray-600">Track your current and past deliveries</p>
        </Link>

        <Link 
          to="/driver/earnings"
          className="card card-hover text-center p-6"
        >
          <DollarSign className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Earnings</h3>
          <p className="text-sm text-gray-600">View your earnings and payment history</p>
        </Link>
      </div>
    </div>
  );
};

export default DriverOverview;