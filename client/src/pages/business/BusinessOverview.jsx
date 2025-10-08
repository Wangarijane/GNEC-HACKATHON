// client/src/pages/business/BusinessOverview.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Users, Zap, Clock, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import SurplusPredictionCard from '../../components/business/SurplusPredictionCard';
import RecentActivityCard from '../../components/business/RecentActivityCard';
import StatsCard from '../../components/ui/StatsCard';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BusinessOverview = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/users/dashboard-stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
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
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.profile?.businessName || user?.firstName}! 👋
            </h1>
            <p className="opacity-90">
              Ready to make a difference? Check your AI predictions and post surplus food.
            </p>
          </div>
          <Link 
            to="/business/post-food"
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post Food</span>
          </Link>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Donations"
            value={stats.totalDonations || 0}
            icon={Users}
            color="primary"
            subtitle="food items posted"
          />
          <StatsCard
            title="Active Posts"
            value={stats.activePosts || 0}
            icon={Clock}
            color="secondary"
            subtitle="currently available"
          />
          <StatsCard
            title="Impact Score"
            value={stats.impactScore || 0}
            icon={TrendingUp}
            color="accent"
            subtitle="based on quantity donated"
          />
          <StatsCard
            title="Pending Matches"
            value={stats.pendingMatches || 0}
            icon={AlertTriangle}
            color="orange"
            subtitle="waiting for your response"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SurplusPredictionCard />
        <RecentActivityCard />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/business/post-food"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
          >
            <Plus className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="font-medium">Post Food</span>
          </Link>
          
          <Link 
            to="/business/my-food"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
          >
            <Clock className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="font-medium">My Posts</span>
          </Link>
          
          <Link 
            to="/business/matches"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
          >
            <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="font-medium">Matches</span>
          </Link>
          
          <Link 
            to="/business/analytics"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
          >
            <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="font-medium">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BusinessOverview;