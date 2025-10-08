// client/src/services/foodService.js
import api from './api';

const foodService = {
  // Get all food items (public)
  getAllFoodItems: (params = {}) => {
    return api.get('/food', { params });
  },

  // Get my food items (business owner)
  getMyFoodItems: (params = {}) => {
    return api.get('/food/my-items', { params });
  },

  // Get food item by ID
  getFoodItemById: (id) => {
    return api.get(`/food/${id}`);
  },

  // Create food item (business only)
  createFoodItem: (foodData) => {
    return api.post('/food', foodData);
  },

  // Update food item
  updateFoodItem: (id, foodData) => {
    return api.put(`/food/${id}`, foodData);
  },

  // Delete food item
  deleteFoodItem: (id) => {
    return api.delete(`/food/${id}`);
  },

  // Bulk delete food items
  bulkDeleteFoodItems: (ids) => {
    return api.post('/food/bulk-delete', { ids });
  },

  // Bulk update status
  bulkUpdateStatus: (ids, status) => {
    return api.post('/food/bulk-update-status', { ids, status });
  },

  // Get nearby food items
  getNearbyFoodItems: (lat, lng, radius = 10) => {
    return api.get('/food', {
      params: { lat, lng, radius, status: 'available' }
    });
  },

  // Update food item images
  updateFoodImages: (id, images) => {
    return api.put(`/food/${id}/images`, { images });
  },

  // Get food item statistics
  getFoodStats: () => {
    return api.get('/food/stats');
  }
};

export default foodService;