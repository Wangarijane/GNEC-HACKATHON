// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BusinessDashboard from './pages/business/BusinessDashboard';
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={
                isAuthenticated && user?.userType ? (
                  <Navigate to={getDashboardRoute(user.userType)} replace />
                ) : (
                  <LoginPage />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated && user?.userType ? (
                  <Navigate to={getDashboardRoute(user.userType)} replace />
                ) : (
                  <RegisterPage />
                )
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/business/*" 
              element={
                <ProtectedRoute allowedRoles={['business']}>
                  <BusinessDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recipient/*" 
              element={
                <ProtectedRoute allowedRoles={['recipient']}>
                  <RecipientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/*" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all redirect */}
            <Route 
              path="*" 
              element={
                isAuthenticated ? (
                  <Navigate to={getDashboardRoute(user?.userType)} replace />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

// Helper function to get dashboard route based on user type
const getDashboardRoute = (userType) => {
  switch (userType) {
    case 'business': return '/business';
    case 'recipient': return '/recipient';
    case 'driver': return '/driver';
    default: return '/';
  }
};

export default App;