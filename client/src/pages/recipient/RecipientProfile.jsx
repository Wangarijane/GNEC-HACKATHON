// client/src/pages/recipient/RecipientProfile.jsx
import React, { useState } from 'react';
import { User, MapPin, Heart, TrendingUp, Edit3, Save, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import StatsCard from '../../components/ui/StatsCard';

const RecipientProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profile: {
      organizationType: user?.profile?.organizationType || 'individual',
      servingCapacity: user?.profile?.servingCapacity || 1,
      dietaryRestrictions: user?.profile?.dietaryRestrictions || [],
      phone: user?.profile?.phone || '',
      location: {
        address: user?.profile?.location?.address || '',
        city: user?.profile?.location?.city || '',
        country: user?.profile?.location?.country || ''
      }
    }
  });

  const [impactStats] = useState({
    totalReceived: 23,
    mealsProvided: 89,
    co2Saved: 156,
    moneySaved: 340
  });

  const organizationTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'family', label: 'Family' },
    { value: 'ngo', label: 'NGO/Non-Profit' },
    { value: 'shelter', label: 'Shelter' },
    { value: 'school', label: 'School' },
    { value: 'community_center', label: 'Community Center' }
  ];

  const dietaryOptions = [
    'vegetarian', 'vegan', 'halal', 'kosher', 
    'gluten_free', 'nut_free', 'dairy_free'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        location: {
          ...prev.profile.location,
          [field]: value
        }
      }
    }));
  };

  const handleDietaryChange = (restriction) => {
    const currentRestrictions = formData.profile.dietaryRestrictions;
    const updatedRestrictions = currentRestrictions.includes(restriction)
      ? currentRestrictions.filter(r => r !== restriction)
      : [...currentRestrictions, restriction];
    
    handleInputChange('profile.dietaryRestrictions', updatedRestrictions);
  };

  const handleSave = async () => {
    try {
      // In a real app, this would call the API to update the user profile
      updateUser({ ...user, ...formData });
      setIsEditing(false);
      console.log('Profile updated:', formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      profile: {
        organizationType: user?.profile?.organizationType || 'individual',
        servingCapacity: user?.profile?.servingCapacity || 1,
        dietaryRestrictions: user?.profile?.dietaryRestrictions || [],
        phone: user?.profile?.phone || '',
        location: {
          address: user?.profile?.location?.address || '',
          city: user?.profile?.location?.city || '',
          country: user?.profile?.location?.country || ''
        }
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and view your impact</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Food Items Received"
          value={impactStats.totalReceived}
          icon={Heart}
          color="accent"
          trend="+3 this month"
        />
        <StatsCard
          title="Meals Provided"
          value={impactStats.mealsProvided}
          icon={User}
          color="primary"
          trend="+12 this month"
        />
        <StatsCard
          title="CO₂ Saved"
          value={`${impactStats.co2Saved} kg`}
          icon={TrendingUp}
          color="green"
          trend="+18 kg this month"
        />
        <StatsCard
          title="Money Saved"
          value={`$${impactStats.moneySaved}`}
          icon={MapPin}
          color="secondary"
          trend="+$67 this month"
        />
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold">Personal Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{user?.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{user?.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  className="input-field"
                  value={formData.profile.phone}
                  onChange={(e) => handleInputChange('profile.phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900">{user?.profile?.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Type
              </label>
              {isEditing ? (
                <select
                  className="input-field"
                  value={formData.profile.organizationType}
                  onChange={(e) => handleInputChange('profile.organizationType', e.target.value)}
                >
                  {organizationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 capitalize">
                  {organizationTypes.find(t => t.value === user?.profile?.organizationType)?.label || 'Individual'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serving Capacity (people)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={formData.profile.servingCapacity}
                  onChange={(e) => handleInputChange('profile.servingCapacity', parseInt(e.target.value))}
                />
              ) : (
                <p className="text-gray-900">{user?.profile?.servingCapacity || 1} people</p>
              )}
            </div>
          </div>
        </div>

        {/* Location & Preferences */}
        <div className="space-y-6">
          {/* Location */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold">Location</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.profile.location.address}
                    onChange={(e) => handleLocationChange('address', e.target.value)}
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900">{user?.profile?.location?.address || 'Not provided'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input-field"
                      value={formData.profile.location.city}
                      onChange={(e) => handleLocationChange('city', e.target.value)}
                      placeholder="City"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.profile?.location?.city || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input-field"
                      value={formData.profile.location.country}
                      onChange={(e) => handleLocationChange('country', e.target.value)}
                      placeholder="Country"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.profile?.location?.country || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold">Dietary Preferences</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dietary Restrictions
              </label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  {dietaryOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.profile.dietaryRestrictions.includes(option)}
                        onChange={() => handleDietaryChange(option)}
                        className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                      />
                      <span className="text-sm capitalize">
                        {option.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.profile?.dietaryRestrictions?.length > 0 ? (
                    user.profile.dietaryRestrictions.map(restriction => (
                      <span 
                        key={restriction}
                        className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm capitalize"
                      >
                        {restriction.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No dietary restrictions specified</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientProfile;