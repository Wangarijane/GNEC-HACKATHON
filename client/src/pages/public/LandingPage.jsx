// client/src/pages/public/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Heart, 
  Building, 
  Truck, 
  Zap, 
  Users, 
  Globe, 
  TrendingUp,
  CheckCircle,
  Star,
  Quote
} from 'lucide-react';

const LandingPage = () => {
  const stats = [
    { number: '1.05B', label: 'Tonnes of food wasted annually', icon: Globe },
    { number: '783M', label: 'People experiencing hunger', icon: Users },
    { number: '$1T', label: 'Economic cost of food waste', icon: TrendingUp },
    { number: '8%', label: 'Of global greenhouse gas emissions', icon: Zap }
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Predictions',
      description: 'Smart algorithms predict food surplus and match with recipients in real-time using advanced machine learning.'
    },
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'Intelligent matching system considers location, dietary needs, capacity, and urgency to optimize food distribution.'
    },
    {
      icon: Globe,
      title: 'Real-time Impact Tracking',
      description: 'Track your environmental and social impact with detailed metrics on CO2 saved, meals provided, and waste reduced.'
    },
    {
      icon: TrendingUp,
      title: 'Economic Benefits',
      description: 'Businesses save on disposal costs, get tax benefits, while drivers earn money and communities get fed.'
    }
  ];

  const userTypes = [
    {
      type: 'business',
      icon: Building,
      title: 'For Businesses',
      description: 'Turn your surplus food into social impact while saving money on disposal costs.',
      benefits: ['Reduce disposal costs', 'Tax deductions', 'Positive brand impact', 'AI predictions'],
      color: 'primary'
    },
    {
      type: 'recipient',
      icon: Heart,
      title: 'For Recipients',
      description: 'Access fresh, quality food for your community, family, or organization.',
      benefits: ['Free fresh food', 'Dietary preferences', 'Community impact', 'Easy pickup'],
      color: 'secondary'
    },
    {
      type: 'driver',
      icon: Truck,
      title: 'For Drivers',
      description: 'Earn money while making a difference by delivering food to those in need.',
      benefits: ['Flexible schedule', 'Competitive pay', 'Social impact', 'Easy app'],
      color: 'accent'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Restaurant Owner",
      image: "/images/testimonial-1.jpg",
      quote: "FoodBridge AI helped us reduce food waste by 80% while building stronger community relationships."
    },
    {
      name: "David Chen",
      role: "Food Bank Director", 
      image: "/images/testimonial-2.jpg",
      quote: "The AI matching is incredible. We receive exactly what our community needs, when they need it."
    },
    {
      name: "Maria Rodriguez",
      role: "Delivery Driver",
      image: "/images/testimonial-3.jpg",
      quote: "I love earning extra income while helping fight hunger. The app makes everything so easy."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">FoodBridge AI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Fighting Hunger with{' '}
                <span className="text-gradient">AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform food waste into nourishment. Our AI-powered platform connects surplus food 
                with communities in need, creating a sustainable solution for hunger and waste.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  to="/register" 
                  className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4"
                >
                  <span>Join the Movement</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <button className="btn-secondary text-lg px-8 py-4">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-primary-600" />
          </div>
        </div>
        <div className="absolute top-40 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
            <Zap className="h-8 w-8 text-secondary-600" />
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're donating, receiving, or delivering food, FoodBridge AI 
              has tools designed specifically for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {userTypes.map((userType, index) => {
              const Icon = userType.icon;
              return (
                <div key={index} className="card card-hover text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 bg-${userType.color}-100 rounded-full flex items-center justify-center`}>
                    <Icon className={`h-8 w-8 text-${userType.color}-600`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{userType.title}</h3>
                  <p className="text-gray-600 mb-6">{userType.description}</p>
                  
                  <ul className="space-y-2 mb-8">
                    {userType.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    to={`/register?type=${userType.type}`}
                    className={`btn-${userType.color === 'primary' ? 'primary' : 'accent'} w-full`}
                  >
                    Get Started as {userType.title.split(' ')[1]}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered process makes food redistribution simple, efficient, and impactful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Predicts Surplus</h3>
              <p className="text-gray-600">
                Our AI analyzes patterns, weather, events, and historical data to predict 
                when and where food surplus will occur.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-secondary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Matching</h3>
              <p className="text-gray-600">
                Advanced algorithms match available food with recipients based on location, 
                dietary needs, capacity, and urgency.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-accent-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Seamless Delivery</h3>
              <p className="text-gray-600">
                Qualified drivers handle pickup and delivery, with real-time tracking 
                and proof of delivery for complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of businesses, organizations, and individuals making a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card text-center">
                <Quote className="h-8 w-8 text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join the AI-powered movement to eliminate food waste and fight hunger. 
            Every meal matters, every action counts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Today</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">1M+</div>
              <div className="opacity-90">Meals Redistributed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="opacity-90">Businesses Joined</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">2.5K</div>
              <div className="opacity-90">Tonnes CO₂ Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">FoodBridge AI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Fighting hunger and food waste with artificial intelligence. 
                Building a sustainable future, one meal at a time.
              </p>
              <div className="text-sm text-gray-500">
                © 2025 FoodBridge AI. Built for GNEC Hackathon 2025.
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;