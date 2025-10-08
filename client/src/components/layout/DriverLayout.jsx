// client/src/components/layout/DriverLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Package, 
  DollarSign,
  LogOut,
  Heart,
  Bell,
  User,
  Truck
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const DriverLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/driver', icon: Home },
    { name: 'Available Deliveries', href: '/driver/available', icon: MapPin },
    { name: 'My Deliveries', href: '/driver/my-deliveries', icon: Package },
    { name: 'Earnings', href: '/driver/earnings', icon: DollarSign },
  ];

  const isActive = (href) => {
    if (href === '/driver') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/driver" className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gradient">FoodBridge AI</div>
              <div className="text-xs text-gray-500">Driver Portal</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.profile?.vehicleType || 'Driver'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;