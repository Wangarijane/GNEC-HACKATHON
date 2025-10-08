// client/src/services/predictionService.js
import api from './api';

const predictionService = {
  // Get surplus prediction for current business
  getSurplusPrediction: () => {
    return api.get('/predictions/surplus');
  },

  // Trigger AI matching for a food item
  triggerMatching: (foodItemId) => {
    return api.post(`/predictions/match/${foodItemId}`);
  },

  // Get AI analysis for food description
  analyzeDescription: (description) => {
    return api.post('/predictions/analyze', { description });
  }
};

export default predictionService;