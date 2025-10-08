// server/src/controllers/user.controller.js
import User from '../models/User.js';
import FoodItem from '../models/FoodItem.js';
import Match from '../models/Match.js';

// @desc    Get user profile with real stats
// @route   GET /api/users/profile/:id
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get real stats from database based on user type
    let stats = {};

    if (user.userType === 'business') {
      stats = {
        totalDonations: await FoodItem.countDocuments({ business: user._id }),
        totalValue: 0,
        activeListings: await FoodItem.countDocuments({ business: user._id, status: 'available' }),
        totalMatches: 0
      };

      const valueResult = await FoodItem.aggregate([
        { $match: { business: user._id } },
        { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
      ]);
      if (valueResult.length > 0) {
        stats.totalValue = valueResult[0].total;
      }

      const matches = await Match.countDocuments({ business: user._id });
      stats.totalMatches = matches;

    } else if (user.userType === 'recipient') {
      stats = {
        totalReceived: await Match.countDocuments({ recipient: user._id, status: 'completed' }),
        activeRequests: await Match.countDocuments({ recipient: user._id, status: { $in: ['pending', 'accepted'] } }),
        totalValue: 0,
        mealsReceived: 0
      };

      const completedMatches = await Match.find({ 
        recipient: user._id, 
        status: 'completed' 
      }).populate('foodItem');

      stats.totalValue = completedMatches.reduce((sum, match) => {
        return sum + (match.foodItem?.estimatedValue || 0);
      }, 0);

      stats.mealsReceived = completedMatches.reduce((sum, match) => {
        const quantity = match.foodItem?.quantity?.value || 0;
        return sum + Math.floor(quantity / 0.4);
      }, 0);

    } else if (user.userType === 'driver') {
      stats = {
        totalDeliveries: await Match.countDocuments({ driver: user._id, status: 'completed' }),
        activeDeliveries: await Match.countDocuments({ driver: user._id, status: 'in_transit' }),
        totalEarnings: 0,
        rating: user.stats.rating
      };

      // Calculate earnings (assuming $10-20 per delivery)
      stats.totalEarnings = stats.totalDeliveries * 15;
    }

    res.json({
      success: true,
      data: { user, stats }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.userType;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Get dashboard stats for current user
// @route   GET /api/users/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    let stats = {};

    if (req.user.userType === 'business') {
      // Real-time business stats
      const totalDonations = await FoodItem.countDocuments({ business: req.user.id });
      const activePosts = await FoodItem.countDocuments({ business: req.user.id, status: 'available' });
      const pendingMatches = await Match.countDocuments({ business: req.user.id, status: 'pending' });

      const deliveredItems = await FoodItem.find({ business: req.user.id, status: 'delivered' });
      const impactScore = deliveredItems.reduce((sum, item) => sum + item.quantity.value, 0);

      stats = {
        totalDonations,
        activePosts,
        impactScore: Math.round(impactScore * 10),
        pendingMatches
      };

    } else if (req.user.userType === 'recipient') {
      const totalReceived = await Match.countDocuments({ recipient: req.user.id, status: 'completed' });
      const activeRequests = await Match.countDocuments({ 
        recipient: req.user.id, 
        status: { $in: ['pending', 'accepted'] } 
      });

      const completedMatches = await Match.find({ 
        recipient: req.user.id, 
        status: 'completed' 
      }).populate('foodItem');

      const savedMoney = completedMatches.reduce((sum, match) => {
        return sum + (match.foodItem?.estimatedValue || 0);
      }, 0);

      const impactScore = completedMatches.reduce((sum, match) => {
        return sum + (match.foodItem?.quantity?.value || 0);
      }, 0);

      stats = {
        totalReceived,
        activeRequests,
        impactScore: Math.round(impactScore * 10),
        savedMoney
      };

    } else if (req.user.userType === 'driver') {
      const totalDeliveries = await Match.countDocuments({ driver: req.user.id, status: 'completed' });
      const activeDeliveries = await Match.countDocuments({ 
        driver: req.user.id, 
        status: 'in_transit' 
      });
      const totalEarnings = totalDeliveries * 15;

      stats = {
        totalDeliveries,
        totalEarnings,
        activeDeliveries,
        impactScore: totalDeliveries * 20,
        rating: req.user.stats.rating || 5.0
      };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  getDashboardStats
};