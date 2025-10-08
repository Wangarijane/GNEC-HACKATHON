// client/src/components/food/FoodItemCard.jsx
import React from 'react';
import { Clock, MapPin, Users, Heart, Tag } from 'lucide-react';

const FoodItemCard = ({ food, showDistance = false, onRequest, onView }) => {
  const getUrgencyColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeUntilExpiry = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Expires soon';
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
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

  return (
    <div className="card card-hover relative overflow-hidden">
      {/* Urgency Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(food.urgencyLevel)}`}>
          {food.urgencyLevel} priority
        </span>
      </div>

      {/* Image */}
      <div className="relative h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
        {food.images && food.images.length > 0 ? (
          <img 
            src={food.images[0].url || food.images[0]} 
            alt={food.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {getCategoryIcon(food.category)}
          </div>
        )}
        
        {/* Dietary Info */}
        {food.dietaryInfo && food.dietaryInfo.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <div className="flex flex-wrap gap-1">
              {food.dietaryInfo.slice(0, 3).map((diet, index) => (
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
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{food.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>
        </div>

        {/* Quantity and Value */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {food.quantity.value} {food.quantity.unit}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              ${food.estimatedValue}
            </span>
          </div>
        </div>

        {/* Business Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">
                {food.business.firstName?.charAt(0)}
              </span>
            </div>
            <span className="text-gray-700">
              {food.business.profile?.businessName || `${food.business.firstName} ${food.business.lastName}`}
            </span>
          </div>
          
          {showDistance && food.distance && (
            <div className="flex items-center space-x-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{food.distance} km</span>
            </div>
          )}
        </div>

        {/* Expiry Info */}
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{getTimeUntilExpiry(food.expiresAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {onView && (
            <button 
              onClick={() => onView(food)}
              className="flex-1 btn-secondary text-sm py-2"
            >
              View Details
            </button>
          )}
          {onRequest && (
            <button 
              onClick={() => onRequest(food)}
              className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1"
            >
              <Heart className="h-4 w-4" />
              <span>Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;