// server/src/services/aiService.js
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

class AIService {
  // Predict food surplus for a business
  async predictSurplus(businessId, businessData) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/predict/surplus`, {
        business_id: businessId,
        business_type: businessData.businessType,
        historical_avg_surplus: businessData.historicalAvg || 0,
        capacity: businessData.capacity || 100,
        has_promotion: businessData.hasPromotion || false,
        lat: businessData.location?.coordinates[1],
        lng: businessData.location?.coordinates[0],
        timestamp: new Date().toISOString()
      }, {
        timeout: 10000 // 10 second timeout
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI Surplus Prediction Error:', error.message);
      return {
        success: false,
        error: error.message,
        // Fallback prediction
        data: {
          predicted_surplus: 15,
          confidence: 0.5,
          recommendation: 'Unable to get AI prediction. Using default estimate.',
          factors: ['AI service unavailable']
        }
      };
    }
  }

  // Find best matches for a food item
  async findMatches(foodItemId, foodItemData, recipients) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/match/food`, {
        food_item: {
          _id: foodItemId,
          category: foodItemData.category,
          quantity: foodItemData.quantity,
          expiresAt: foodItemData.expiresAt,
          location: foodItemData.location,
          dietaryInfo: foodItemData.dietaryInfo
        },
        recipients: recipients.map(r => ({
          _id: r._id,
          profile: {
            location: r.profile.location,
            organizationType: r.profile.organizationType,
            servingCapacity: r.profile.servingCapacity,
            dietaryRestrictions: r.profile.dietaryRestrictions
          }
        }))
      }, {
        timeout: 15000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI Matching Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: { matches: [] }
      };
    }
  }

  // Analyze food description using AI
  async analyzeDescription(description) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/analyze/sentiment`, {
        description
      }, {
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI Analysis Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: {
          sentiment: [{ label: 'NEUTRAL', score: 0.5 }],
          categories: [],
          freshness: 'unknown',
          quality_score: 0.7
        }
      };
    }
  }

  // Batch predict demand for multiple locations
  async batchPredictDemand(locations) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/batch/predict-demand`, {
        locations
      }, {
        timeout: 20000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI Batch Prediction Error:', error.message);
      return {
        success: false,
        error: error.message,
        data: { predictions: [] }
      };
    }
  }

  // Check if AI service is available
  async healthCheck() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/api/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default new AIService();