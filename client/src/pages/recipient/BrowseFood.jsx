// client/src/pages/recipient/BrowseFood.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Sliders } from 'lucide-react';
import FoodItemCard from '../../components/food/FoodItemCard';
import foodService from '../../services/foodService';
import toast from 'react-hot-toast';

const BrowseFood = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    dietary: '',
    urgency: 'all',
    radius: 10
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFoodItems();
  }, [filters]);

  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 20,
        status: 'available',
        ...filters
      };

      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.urgency !== 'all') {
        params.urgency = filters.urgency;
      }
      if (filters.dietary) {
        params.dietary = filters.dietary;
      }

      const response = await foodService.getAllFoodItems(params);
      setFoodItems(response.data.data.foodItems);
    } catch (error) {
      console.error('Error fetching food items:', error);
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRequest = async (food) => {
    try {
      const response = await fetch('/api/matches/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          foodItemId: food._id,
          message: 'I would like to request this food item.'
        })
      });

      if (response.ok) {
        toast.success('Food request submitted successfully!');
        fetchFoodItems(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to request food');
      }
    } catch (error) {
      console.error('Error requesting food:', error);
      toast.error('Failed to request food');
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'meals', label: 'Prepared Meals' },
    { value: 'bakery', label: 'Bakery Items' },
    { value: 'produce', label: 'Fresh Produce' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
  ];

  const urgencyLevels = [
    { value: 'all', label: 'All Urgency Levels' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const dietaryOptions = [
    { value: '', label: 'All Dietary Types' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'gluten_free', label: 'Gluten Free' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Available Food</h1>
          <p className="text-gray-600 mt-1">Discover fresh food available in your area</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center space-x-2"
        >
          <Sliders className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search for food items..."
          className="input-field pl-10 w-full"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency
              </label>
              <select
                className="input-field"
                value={filters.urgency}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
              >
                {urgencyLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary
              </label>
              <select
                className="input-field"
                value={filters.dietary}
                onChange={(e) => handleFilterChange('dietary', e.target.value)}
              >
                {dietaryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius (km)
              </label>
              <select
                className="input-field"
                value={filters.radius}
                onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {loading ? 'Loading...' : `${foodItems.length} food items available`}
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : foodItems.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No food items found</h4>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((food) => (
              <FoodItemCard 
                key={food._id} 
                food={food} 
                showDistance={true}
                onRequest={handleRequest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseFood;