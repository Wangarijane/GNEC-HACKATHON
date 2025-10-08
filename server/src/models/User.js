// server/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: ['business', 'recipient', 'driver', 'admin']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    phone: String,
    avatar: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0] // [longitude, latitude]
      },
      address: String,
      city: String,
      country: String
    },
    
    // Business-specific fields
    businessName: String,
    businessType: {
      type: String,
      enum: ['restaurant', 'grocery', 'bakery', 'cafe', 'catering', 'other']
    },
    businessLicense: String,
    operatingHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
    },
    
    // Recipient-specific fields
    organizationType: {
      type: String,
      enum: ['individual', 'family', 'ngo', 'shelter', 'school', 'community_center']
    },
    servingCapacity: Number,
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free', 'nut_free', 'dairy_free']
    }],
    
    // Driver-specific fields
    vehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'bicycle', 'van', 'truck']
    },
    vehiclePlate: String,
    driversLicense: String,
    maxCapacity: Number // in kg
  },
  
  // Stats
  stats: {
    totalDonations: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    impactScore: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
userSchema.index({ "profile.location": "2dsphere" });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);