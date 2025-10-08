// server/src/controllers/food.controller.js
import FoodItem from '../models/FoodItem.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import axios from 'axios';

// @desc    Create new food item
// @route   POST /api/food
// @access  Private (Business only)
export const createFoodItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (req.user.userType !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can post food items'
      });
    }

    const foodData = {
      ...req.body,
      business: req.user.id
    };

    if (!foodData.location && req.user.profile.location) {
      foodData.location = {
        type: 'Point',
        coordinates: req.user.profile.location.coordinates,
        address: req.user.profile.location.address
      };
    }

    const foodItem = await FoodItem.create(foodData);
    await foodItem.populate('business', 'firstName lastName profile.businessName');

    // Trigger AI matching in background
    triggerAIMatchingBackground(foodItem._id);

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: { foodItem }
    });

  } catch (error) {
    console.error('Food creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during food item creation'
    });
  }
};

// @desc    Get all food items (public with filters)
// @route   GET /api/food
// @access  Public
export const getAllFoodItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'available',
      category,
      lat,
      lng,
      radius = 10,
      urgency,
      dietary,
      search
    } = req.query;

    let query = { status };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (urgency && urgency !== 'all') {
      query.urgencyLevel = urgency;
    }

    if (dietary) {
      query.dietaryInfo = { $in: dietary.split(',') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let foodItemsQuery = FoodItem.find(query);

    if (lat && lng) {
      foodItemsQuery = FoodItem.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radius * 1000
          }
        }
      });
    }

    const skip = (page - 1) * limit;

    const foodItems = await foodItemsQuery
      .populate('business', 'firstName lastName profile.businessName profile.location')
      .sort({ urgencyLevel: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoodItem.countDocuments(query);

    // Calculate distance if lat/lng provided
    const foodItemsWithDistance = foodItems.map(item => {
      const itemObj = item.toObject();
      if (lat && lng && item.location && item.location.coordinates) {
        itemObj.distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          item.location.coordinates[1],
          item.location.coordinates[0]
        );
      }
      return itemObj;
    });

    res.json({
      success: true,
      data: {
        foodItems: foodItemsWithDistance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching food items'
    });
  }
};

// @desc    Get my food items (business owner)
// @route   GET /api/food/my-items
// @access  Private (Business)
export const getMyFoodItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      search,
      category,
      urgency,
      sort = 'newest',
      startDate
    } = req.query;

    let query = { business: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (urgency && urgency !== 'all') {
      query.urgencyLevel = urgency;
    }

    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    }

    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'expiring':
        sortOptions = { expiresAt: 1 };
        break;
      case 'value_high':
        sortOptions = { estimatedValue: -1 };
        break;
      case 'value_low':
        sortOptions = { estimatedValue: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const foodItems = await FoodItem
      .find(query)
      .populate('business', 'firstName lastName profile.businessName')
      .populate('matches.recipient', 'firstName lastName profile.organizationType')
      .populate('assignedTo.recipient', 'firstName lastName profile.organizationType profile.businessName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoodItem.countDocuments(query);

    // Get real-time stats from database
    const stats = {
      all: await FoodItem.countDocuments({ business: req.user.id }),
      available: await FoodItem.countDocuments({ business: req.user.id, status: 'available' }),
      claimed: await FoodItem.countDocuments({ business: req.user.id, status: 'claimed' }),
      delivered: await FoodItem.countDocuments({ business: req.user.id, status: 'delivered' }),
      expired: await FoodItem.countDocuments({ business: req.user.id, status: 'expired' })
    };

    res.json({
      success: true,
      data: {
        foodItems,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my food items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching food items'
    });
  }
};

// @desc    Get food item by ID
// @route   GET /api/food/:id
// @access  Public
export const getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem
      .findById(req.params.id)
      .populate('business', 'firstName lastName profile.businessName profile.location profile.phone email')
      .populate('matches.recipient', 'firstName lastName profile.organizationType profile.location')
      .populate('assignedTo.recipient', 'firstName lastName profile.organizationType profile.businessName')
      .populate('assignedTo.driver', 'firstName lastName profile.vehicleType profile.vehiclePlate');

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.json({
      success: true,
      data: { foodItem }
    });

  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching food item'
    });
  }
};

// @desc    Update food item
// @route   PUT /api/food/:id
// @access  Private (Business owner only)
export const updateFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    if (foodItem.business.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this food item'
      });
    }

    const updatedFoodItem = await FoodItem
      .findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('business', 'firstName lastName profile.businessName');

    res.json({
      success: true,
      message: 'Food item updated successfully',
      data: { foodItem: updatedFoodItem }
    });

  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during food item update'
    });
  }
};

// @desc    Delete food item
// @route   DELETE /api/food/:id
// @access  Private (Business owner)
export const deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    if (foodItem.business.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this food item'
      });
    }

    await Match.deleteMany({ foodItem: req.params.id });
    await FoodItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Food item deleted successfully'
    });

  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during food item deletion'
    });
  }
};

// @desc    Bulk delete food items
// @route   POST /api/food/bulk-delete
// @access  Private (Business)
export const bulkDeleteFoodItems = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid food item IDs'
      });
    }

    const items = await FoodItem.find({ 
      _id: { $in: ids },
      business: req.user.id 
    });

    if (items.length !== ids.length) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete some of these items'
      });
    }

    await Match.deleteMany({ foodItem: { $in: ids } });
    const result = await FoodItem.deleteMany({ 
      _id: { $in: ids },
      business: req.user.id 
    });

    res.json({
      success: true,
      message: `${result.deletedCount} food items deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk deletion'
    });
  }
};

// @desc    Bulk update status
// @route   POST /api/food/bulk-update-status
// @access  Private (Business)
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid food item IDs'
      });
    }

    if (!['available', 'claimed', 'delivered', 'expired', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const result = await FoodItem.updateMany(
      { 
        _id: { $in: ids },
        business: req.user.id 
      },
      { 
        $set: { status, updatedAt: Date.now() }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} food items updated successfully`,
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk update'
    });
  }
};

// @desc    Get food statistics for business
// @route   GET /api/food/stats
// @access  Private (Business)
export const getFoodStats = async (req, res) => {
  try {
    const stats = {
      total: await FoodItem.countDocuments({ business: req.user.id }),
      available: await FoodItem.countDocuments({ business: req.user.id, status: 'available' }),
      claimed: await FoodItem.countDocuments({ business: req.user.id, status: 'claimed' }),
      delivered: await FoodItem.countDocuments({ business: req.user.id, status: 'delivered' }),
      expired: await FoodItem.countDocuments({ business: req.user.id, status: 'expired' }),
      totalValue: 0,
      totalMatches: 0,
      impactMetrics: {
        co2Saved: 0,
        mealsDonated: 0,
        peopleServed: 0
      }
    };

    // Calculate total value
    const valueResult = await FoodItem.aggregate([
      { $match: { business: req.user._id } },
      { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
    ]);

    if (valueResult.length > 0) {
      stats.totalValue = valueResult[0].total;
    }

    // Count total matches
    const items = await FoodItem.find({ business: req.user.id }).select('matches quantity');
    stats.totalMatches = items.reduce((sum, item) => sum + (item.matches?.length || 0), 0);

    // Calculate impact metrics from delivered items
    const deliveredItems = await FoodItem.find({ 
      business: req.user.id, 
      status: 'delivered' 
    });

    stats.impactMetrics.co2Saved = deliveredItems.reduce((sum, item) => {
      return sum + (item.quantity.value * 2.5);
    }, 0);

    stats.impactMetrics.mealsDonated = deliveredItems.reduce((sum, item) => {
      return sum + Math.floor(item.quantity.value / 0.4);
    }, 0);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

// Background AI matching trigger
async function triggerAIMatchingBackground(foodItemId) {
  try {
    // This runs in background, doesn't block response
    setTimeout(async () => {
      const foodItem = await FoodItem.findById(foodItemId);
      if (!foodItem) return;

      const recipients = await User.find({
        userType: 'recipient',
        isActive: true,
        'profile.location': {
          $near: {
            $geometry: foodItem.location,
            $maxDistance: 50000
          }
        }
      }).limit(20);

      if (recipients.length > 0) {
        // Call AI service to create matches
        await axios.post(`${process.env.AI_SERVICE_URL}/api/match/food`, {
          food_item: foodItem,
          recipients
        });
      }
    }, 1000);
  } catch (error) {
    console.error('Background AI matching error:', error);
  }
}