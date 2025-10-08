// ============================================================================
// CLIENT - LOGIN PAGE
// ============================================================================

// client/src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    
    if (result.success) {
      toast.success('Login successful!');
      
      // Redirect based on user type
      const userType = result.data.user.userType;
      const dashboardRoute = userType === 'business' ? '/business' :
                            userType === 'recipient' ? '/recipient' :
                            userType === 'driver' ? '/driver' : '/';
      
      navigate(dashboardRoute, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue reducing food waste</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
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
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Demo Accounts for Testing:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="font-medium">Business</p>
                <p className="text-gray-600">business@demo.com</p>
                <p className="text-gray-600">demo123</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="font-medium">Recipient</p>
                <p className="text-gray-600">recipient@demo.com</p>
                <p className="text-gray-600">demo123</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="font-medium">Driver</p>
                <p className="text-gray-600">driver@demo.com</p>
                <p className="text-gray-600">demo123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;