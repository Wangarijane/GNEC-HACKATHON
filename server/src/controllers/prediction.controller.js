// server/src/controllers/prediction.controller.js
import aiService from '../services/aiService.js';
import User from '../models/User.js';
import FoodItem from '../models/FoodItem.js';

// @desc    Get surplus prediction for business
// @route   GET /api/predictions/surplus
// @access  Private (Business)
export const getSurplusPrediction = async (req, res) => {
  try {
    if (req.user.userType !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can get surplus predictions'
      });
    }

    // Get business historical data
    const businessFood = await FoodItem.find({
      business: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const historicalAvg = businessFood.length > 0
      ? businessFood.reduce((sum, item) => sum + item.quantity.value, 0) / businessFood.length
      : 0;

    const businessData = {
      businessType: req.user.profile?.businessType || 'restaurant',
      historicalAvg,
      capacity: 100,
      hasPromotion: false,
      location: req.user.profile?.location
    };

    // Get AI prediction
    const prediction = await aiService.predictSurplus(req.user.id, businessData);

    res.json(prediction);

  } catch (error) {
    console.error('Get surplus prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting prediction'
    });
  }
};

// @desc    Trigger AI matching for a food item
// @route   POST /api/predictions/match/:foodId
// @access  Private (Business)
export const triggerAIMatching = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.foodId)
      .populate('business');

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    if (foodItem.business._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get nearby recipients
    const recipients = await User.find({
      userType: 'recipient',
      isActive: true,
      'profile.location': {
        $near: {
          $geometry: foodItem.location,
          $maxDistance: 50000 // 50km
        }
      }
    }).limit(20);

    if (recipients.length === 0) {
      return res.json({
        success: true,
        message: 'No recipients found nearby',
        data: { matches: [] }
      });
    }

    // Get AI matches
    const matchResult = await aiService.findMatches(
      foodItem._id,
      foodItem,
      recipients
    );

    res.json(matchResult);

  } catch (error) {
    console.error('Trigger AI matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering AI matching'
    });
  }
};