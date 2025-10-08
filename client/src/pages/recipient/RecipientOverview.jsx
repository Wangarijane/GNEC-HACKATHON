// client/src/pages/recipient/RecipientOverview.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Heart, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import StatsCard from '../../components/ui/StatsCard';
import FoodItemCard from '../../components/food/FoodItemCard';
import api from '../../services/api';
import foodService from '../../services/foodService';
import toast from 'react-hot-toast';

const RecipientOverview = () => {
  const { user } = useAuthStore();
  const [nearbyFood, setNearbyFood] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, foodResponse] = await Promise.all([
        api.get('/users/dashboard-stats'),
        foodService.getNearbyFoodItems(
          user?.profile?.location?.coordinates[1],
          user?.profile?.location?.coordinates[0],
          10
        )
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (foodResponse.data.success) {
        setNearbyFood(foodResponse.data.data.foodItems.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFood = async (food) => {
    try {
      const response = await api.post('/matches/request', {
        foodItemId: food._id,
        message: 'I would like to request this food item.'
      });

      if (response.data.success) {
        toast.success('Food request submitted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error requesting food:', error);
      toast.error(error.response?.data?.message || 'Failed to request food');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-accent-600 to-secondary-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome, {user?.firstName}! 🍽️
            </h1>
            <p className="opacity-90">
              Discover fresh food available in your area and make requests.
            </p>
          </div>
          <Link 
            to="/recipient/browse"
            className="bg-white text-accent-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>Browse Food</span>
          </Link>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Received"
            value={stats.totalReceived || 0}
            icon={Heart}
            color="accent"
            subtitle="food items received"
          />
          <StatsCard
            title="Active Requests"
            value={stats.activeRequests || 0}
            icon={Clock}
            color="secondary"
            subtitle="pending requests"
          />
          <StatsCard
            title="Impact Score"
            value={stats.impactScore || 0}
            icon={TrendingUp}
            color="primary"
            subtitle="positive impact made"
          />
          <StatsCard
            title="Money Saved"
            value={`${stats.savedMoney || 0}`}
            icon={MapPin}
            color="green"
            subtitle="in food value"
          />
        </div>
      )}

      {/* Nearby Food */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-accent-600" />
            Available Food Near You
          </h3>
          <Link 
            to="/recipient/browse"
            className="text-accent-600 hover:text-accent-700 font-medium text-sm"
          >
            View all →
          </Link>
        </div>

        {nearbyFood.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No food available nearby</h4>
            <p className="text-gray-500 mb-4">
              Check back later or expand your search radius.
            </p>
            <Link to="/recipient/browse" className="btn-accent">
              Browse All Food
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nearbyFood.map((food) => (
              <FoodItemCard 
                key={food._id} 
                food={food} 
                showDistance={true}
                onRequest={handleRequestFood}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipientOverview;