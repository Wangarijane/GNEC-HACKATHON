// client/src/components/business/RecentActivityCard.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const RecentActivityCard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    setLoading(true);
    try {
      // Get recent matches for activity feed
      const response = await api.get('/matches/my-matches?limit=5');
      
      if (response.data.success) {
        const activities = response.data.data.matches.map(match => {
          let type, message, icon, color;
          
          switch (match.status) {
            case 'pending':
              type = 'match';
              message = `New match for "${match.foodItem.title}"`;
              icon = Users;
              color = 'green';
              break;
            case 'accepted':
              type = 'accepted';
              message = `Match accepted for "${match.foodItem.title}"`;
              icon = CheckCircle;
              color = 'blue';
              break;
            case 'completed':
              type = 'delivered';
              message = `Food delivered: "${match.foodItem.title}"`;
              icon = CheckCircle;
              color = 'green';
              break;
            default:
              type = 'update';
              message = `Update on "${match.foodItem.title}"`;
              icon = AlertCircle;
              color = 'gray';
          }
          
          return {
            id: match._id,
            type,
            message,
            recipient: match.recipient?.firstName + ' ' + match.recipient?.lastName,
            time: getTimeAgo(match.createdAt),
            icon,
            color
          };
        });
        
        setActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'text-green-600 bg-green-100',
      blue: 'text-blue-600 bg-blue-100',
      orange: 'text-orange-600 bg-orange-100',
      gray: 'text-gray-600 bg-gray-100'
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary-600" />
          Recent Activity
        </h3>
        <button 
          onClick={fetchRecentActivity}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-2">Start by posting a food item!</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getColorClasses(activity.color)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  {activity.recipient && (
                    <p className="text-sm text-gray-500">
                      {activity.recipient}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activities.length > 0 && (
        <div className="pt-4 border-t mt-4">
          <Link 
            to="/business/matches"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all activity →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;