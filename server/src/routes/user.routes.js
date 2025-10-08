// server/src/routes/user.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getUserProfile, updateUserProfile, getDashboardStats } from '../controllers/user.controller.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/profile/:id', getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/dashboard-stats', protect, getDashboardStats);

router.get('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, radius = 10, userType } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    let query = {
      isActive: true,
      _id: { $ne: req.user.id }
    };

    if (userType) {
      query.userType = userType;
    }

    const users = await User.find({
      ...query,
      'profile.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      }
    }).select('firstName lastName userType profile.businessName profile.location profile.avatar stats');

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby users'
    });
  }
});

export default router;
