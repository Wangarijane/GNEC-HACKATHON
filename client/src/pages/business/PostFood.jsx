// client/src/pages/business/PostFood.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera, MapPin, Clock, DollarSign, Tag, Plus } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import foodService from '../../services/foodService';

const PostFood = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      availableFrom: new Date().toISOString().slice(0, 16),
      location: {
        address: user?.profile?.location?.address || ''
      }
    }
  });

  const categories = [
    { value: 'meals', label: 'Prepared Meals' },
    { value: 'bakery', label: 'Bakery Items' },
    { value: 'produce', label: 'Fresh Produce' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks & Packaged Food' },
    { value: 'other', label: 'Other' }
  ];

  const units = [
    { value: 'kg', label: 'Kilograms' },
    { value: 'lbs', label: 'Pounds' },
    { value: 'servings', label: 'Servings' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'liters', label: 'Liters' },
    { value: 'gallons', label: 'Gallons' }
  ];

  const dietaryOptions = [
    'vegetarian', 'vegan', 'halal', 'kosher', 
    'gluten_free', 'nut_free', 'dairy_free'
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Format the data
      const foodData = {
        ...data,
        quantity: {
          value: parseFloat(data.quantityValue),
          unit: data.quantityUnit
        },
        estimatedValue: parseFloat(data.estimatedValue),
        availableFrom: new Date(data.availableFrom).toISOString(),
        expiresAt: new Date(data.expiresAt).toISOString(),
        images: images,
        location: {
          type: 'Point',
          coordinates: user?.profile?.location?.coordinates || [0, 0],
          address: data.location.address
        }
      };

      const response = await foodService.createFoodItem(foodData);
      
      if (response.data.success) {
        toast.success('Food item posted successfully!');
        navigate('/business');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post food item');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // In a real app, you'd upload to Cloudinary here
    // For now, just store file names
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...imageUrls].slice(0, 5)); // Max 5 images
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Surplus Food</h1>
        <p className="text-gray-600">
          Help reduce waste by sharing your surplus food with the community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Tag className="h-5 w-5 mr-2 text-primary-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Title *
              </label>
              <input
                type="text"
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., Fresh Vegetable Soup"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe the food, its condition, preparation method, etc."
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Value (USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input-field pl-10 ${errors.estimatedValue ? 'border-red-500' : ''}`}
                  placeholder="25.00"
                  {...register('estimatedValue', { 
                    required: 'Estimated value is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                />
              </div>
              {errors.estimatedValue && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedValue.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quantity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className={`input-field ${errors.quantityValue ? 'border-red-500' : ''}`}
                placeholder="5"
                {...register('quantityValue', { 
                  required: 'Quantity is required',
                  min: { value: 0.1, message: 'Quantity must be positive' }
                })}
              />
              {errors.quantityValue && (
                <p className="text-red-500 text-sm mt-1">{errors.quantityValue.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                className={`input-field ${errors.quantityUnit ? 'border-red-500' : ''}`}
                {...register('quantityUnit', { required: 'Unit is required' })}
              >
                <option value="">Select unit</option>
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
              {errors.quantityUnit && (
                <p className="text-red-500 text-sm mt-1">{errors.quantityUnit.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Availability
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available From *
              </label>
              <input
                type="datetime-local"
                className={`input-field ${errors.availableFrom ? 'border-red-500' : ''}`}
                {...register('availableFrom', { required: 'Available from date is required' })}
              />
              {errors.availableFrom && (
                <p className="text-red-500 text-sm mt-1">{errors.availableFrom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires At *
              </label>
              <input
                type="datetime-local"
                className={`input-field ${errors.expiresAt ? 'border-red-500' : ''}`}
                {...register('expiresAt', { 
                  required: 'Expiry date is required',
                  validate: value => {
                    const availableFrom = watch('availableFrom');
                    if (availableFrom && new Date(value) <= new Date(availableFrom)) {
                      return 'Expiry date must be after available from date';
                    }
                    return true;
                  }
                })}
              />
              {errors.expiresAt && (
                <p className="text-red-500 text-sm mt-1">{errors.expiresAt.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
            Pickup Location
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              className={`input-field ${errors['location.address'] ? 'border-red-500' : ''}`}
              placeholder="Enter pickup address"
              {...register('location.address', { required: 'Address is required' })}
            />
            {errors['location.address'] && (
              <p className="text-red-500 text-sm mt-1">{errors['location.address'].message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Recipients will come to this address to collect the food
            </p>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-primary-600" />
            Food Images
          </h3>
          
          <div className="space-y-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="food-images"
            />
            
            <label 
              htmlFor="food-images"
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors block"
            >
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-600">Click to upload food images</span>
              <p className="text-sm text-gray-500 mt-1">Up to 5 images, max 5MB each</p>
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Food ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dietary Information */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Dietary Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Labels (Check all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dietaryOptions.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={option}
                    {...register('dietaryInfo')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm capitalize">
                    {option.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Instructions
              </label>
              <textarea
                rows={3}
                className="input-field"
                placeholder="Any special instructions for pickup (entrance to use, contact person, etc.)"
                {...register('pickupInstructions')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Instructions
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Keep refrigerated, consume within 2 hours"
                {...register('storageInstructions')}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/business')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>Post Food Item</span>
                <Plus className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostFood;