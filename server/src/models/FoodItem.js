// server/src/models/FoodItem.js
import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Business reference is required']
  },
  title: {
    type: String,
    required: [true, 'Food title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['meals', 'bakery', 'produce', 'dairy', 'beverages', 'snacks', 'other']
  },
  quantity: {
    value: {
      type: Number,
      required: [true, 'Quantity value is required'],
      min: [0.1, 'Quantity must be positive']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: ['kg', 'lbs', 'servings', 'pieces', 'liters', 'gallons']
    }
  },
  estimatedValue: {
    type: Number,
    required: [true, 'Estimated value is required'],
    min: [0, 'Value must be positive']
  },
  images: [{
    url: String,
    publicId: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    }
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  dietaryInfo: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free', 'nut_free', 'dairy_free']
  }],
  allergens: [String],
  preparationDate: Date,
  storageInstructions: String,
  status: {
    type: String,
    enum: ['available', 'claimed', 'in_transit', 'delivered', 'expired', 'cancelled'],
    default: 'available'
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  pickupInstructions: String,
  contactInfo: {
    name: String,
    phone: String,
    email: String
  },
  tags: [String],
  
  // AI Prediction data
  predictedDemand: {
    score: Number,
    factors: [String]
  },
  
  // Matching data
  matches: [{
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Final assignment
  assignedTo: {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: Date
  },
  
  // Delivery tracking
  delivery: {
    pickupTime: Date,
    deliveryTime: Date,
    deliveryProof: {
      image: String,
      signature: String,
      notes: String
    }
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
foodItemSchema.index({ location: "2dsphere" });
foodItemSchema.index({ expiresAt: 1 });
foodItemSchema.index({ status: 1 });
foodItemSchema.index({ business: 1 });

// Calculate urgency based on expiry time
foodItemSchema.methods.calculateUrgency = function() {
  const now = new Date();
  const hoursUntilExpiry = (this.expiresAt - now) / (1000 * 60 * 60);
  
  if (hoursUntilExpiry <= 6) return 'high';
  if (hoursUntilExpiry <= 24) return 'medium';
  return 'low';
};

// Update urgency level before save
foodItemSchema.pre('save', function(next) {
  if (this.isModified('expiresAt') || this.isNew) {
    this.urgencyLevel = this.calculateUrgency();
  }
  next();
});

export default mongoose.model('FoodItem', foodItemSchema);