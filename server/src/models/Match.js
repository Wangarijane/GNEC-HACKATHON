// ============================================================================
// SERVER - MATCH MODEL
// ============================================================================

// server/src/models/Match.js
import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // AI Matching score and reasoning
  matchScore: {
    overall: { type: Number, min: 0, max: 1 },
    distance: { type: Number, min: 0, max: 1 },
    urgency: { type: Number, min: 0, max: 1 },
    capacity: { type: Number, min: 0, max: 1 },
    preference: { type: Number, min: 0, max: 1 }
  },
  
  estimatedImpact: {
    mealsProvided: Number,
    peopleServed: Number,
    co2Saved: Number, // kg CO2
    moneySaved: Number // USD
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  timeline: {
    matched: { type: Date, default: Date.now },
    accepted: Date,
    pickup: Date,
    delivered: Date
  },
  
  feedback: {
    businessRating: { type: Number, min: 1, max: 5 },
    recipientRating: { type: Number, min: 1, max: 5 },
    driverRating: { type: Number, min: 1, max: 5 },
    businessComment: String,
    recipientComment: String,
    driverComment: String
  }
}, {
  timestamps: true
});

matchSchema.index({ foodItem: 1, recipient: 1 }, { unique: true });
matchSchema.index({ status: 1 });
matchSchema.index({ 'timeline.matched': -1 });

export default mongoose.model('Match', matchSchema);