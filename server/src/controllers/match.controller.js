// server/src/controllers/match.controller.js
import Match from '../models/Match.js';
import FoodItem from '../models/FoodItem.js';
import User from '../models/User.js';

// @desc    Get matches for current user
// @route   GET /api/matches/my-matches
// @access  Private
export const getMyMatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (req.user.userType === 'business') {
      query.business = req.user.id;
    } else if (req.user.userType === 'recipient') {
      query.recipient = req.user.id;
    } else if (req.user.userType === 'driver') {
      query.driver = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const matches = await Match
      .find(query)
      .populate('foodItem', 'title description category quantity expiresAt images location')
      .populate('business', 'firstName lastName profile.businessName profile.location profile.phone')
      .populate('recipient', 'firstName lastName profile.organizationType profile.location profile.servingCapacity')
      .populate('driver', 'firstName lastName profile.vehicleType profile.vehiclePlate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Match.countDocuments(query);

    res.json({
      success: true,
      data: {
        matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching matches'
    });
  }
};

// @desc    Request food (create match)
// @route   POST /api/matches/request
// @access  Private (Recipient)
export const requestFood = async (req, res) => {
  try {
    const { foodItemId, message } = req.body;

    if (req.user.userType !== 'recipient') {
      return res.status(403).json({
        success: false,
        message: 'Only recipients can request food'
      });
    }

    const foodItem = await FoodItem.findById(foodItemId).populate('business');

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    if (foodItem.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Food item is no longer available'
      });
    }

    const existingMatch = await Match.findOne({
      foodItem: foodItemId,
      recipient: req.user.id,
      status: 'pending'
    });

    if (existingMatch) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this food item'
      });
    }

    const match = await Match.create({
      foodItem: foodItemId,
      business: foodItem.business._id,
      recipient: req.user.id,
      matchScore: {
        overall: 0.8,
        distance: 0.9,
        urgency: 0.7,
        capacity: 0.8,
        preference: 0.8
      },
      estimatedImpact: {
        mealsProvided: Math.floor(foodItem.quantity.value / 0.4),
        peopleServed: req.user.profile?.servingCapacity || 1,
        co2Saved: foodItem.quantity.value * 2.5,
        moneySaved: foodItem.estimatedValue
      },
      message
    });

    // Add match to food item
    await FoodItem.findByIdAndUpdate(foodItemId, {
      $push: { matches: { recipient: req.user.id, status: 'pending', createdAt: new Date() } }
    });

    await match.populate([
      { path: 'foodItem', select: 'title description category quantity' },
      { path: 'business', select: 'firstName lastName profile.businessName' },
      { path: 'recipient', select: 'firstName lastName profile.organizationType' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Food request submitted successfully',
      data: { match }
    });

  } catch (error) {
    console.error('Request food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while requesting food'
    });
  }
};

// @desc    Accept a match (recipient)
// @route   POST /api/matches/:id/accept
// @access  Private (Recipient)
export const acceptMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    if (match.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this match'
      });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Match is no longer pending'
      });
    }

    match.status = 'accepted';
    match.timeline.accepted = new Date();
    await match.save();

    await FoodItem.findByIdAndUpdate(match.foodItem, {
      status: 'claimed',
      'assignedTo.recipient': req.user.id,
      'assignedTo.assignedAt': new Date()
    });

    await Match.updateMany(
      { 
        foodItem: match.foodItem,
        _id: { $ne: match._id },
        status: 'pending'
      },
      { status: 'declined' }
    );

    res.json({
      success: true,
      message: 'Match accepted successfully',
      data: { match }
    });

  } catch (error) {
    console.error('Accept match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting match'
    });
  }
};

// @desc    Complete a match (mark as delivered)
// @route   POST /api/matches/:id/complete
// @access  Private (Driver/Business)
export const completeMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    match.status = 'completed';
    match.timeline.delivered = new Date();
    await match.save();

    await FoodItem.findByIdAndUpdate(match.foodItem, {
      status: 'delivered',
      'delivery.deliveryTime': new Date()
    });

    res.json({
      success: true,
      message: 'Match completed successfully',
      data: { match }
    });

  } catch (error) {
    console.error('Complete match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing match'
    });
  }
};

export default {
  getMyMatches,
  requestFood,
  acceptMatch,
  completeMatch
};
