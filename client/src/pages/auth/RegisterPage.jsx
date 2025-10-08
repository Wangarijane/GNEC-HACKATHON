// client/src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { User, Mail, Lock, Building, Heart, Truck } from 'lucide-react';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [selectedUserType, setSelectedUserType] = useState('');
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const userTypes = [
    {
      type: 'business',
      title: 'Business Owner',
      description: 'Restaurant, grocery store, or food business wanting to donate surplus food',
      icon: Building,
      color: 'primary'
    },
    {
      type: 'recipient',
      title: 'Food Recipient',
      description: 'Individual, family, NGO, or organization in need of food assistance',
      icon: Heart,
      color: 'secondary'
    },
    {
      type: 'driver',
      title: 'Delivery Driver',
      description: 'Help transport food from donors to recipients and earn money',
      icon: Truck,
      color: 'accent'
    }
  ];

  const onSubmit = async (data) => {
    const userData = {
      ...data,
      userType: selectedUserType
    };

    const result = await registerUser(userData);
    
    if (result.success) {
      toast.success('Registration successful! Welcome to FoodBridge AI!');
      
      // Redirect based on user type
      const dashboardRoute = selectedUserType === 'business' ? '/business' :
                            selectedUserType === 'recipient' ? '/recipient' :
                            selectedUserType === 'driver' ? '/driver' : '/';
      
      navigate(dashboardRoute, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Join FoodBridge AI</h1>
          <p className="text-gray-600">Help us reduce food waste and fight hunger together</p>
        </div>

        <div className="card">
          {/* Step 1: User Type Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Choose Your Role</h2>
              <div className="space-y-4">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.type}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedUserType === type.type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                      onClick={() => setSelectedUserType(type.type)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-6 w-6 mt-1 text-${type.color}-600`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{type.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedUserType === type.type
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-300'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={nextStep}
                disabled={!selectedUserType}
                className="w-full btn-primary mt-6 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: User Information */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back
                </button>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      className={`input-field pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="First name"
                      {...register('firstName', { required: 'First name is required' })}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Last name"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    className={`input-field pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Create a password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === watch('password') || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;