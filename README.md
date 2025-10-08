# 🍽️ FoodBridge AI - Intelligent Food Waste Reduction Platform

## 🏆 GNEC Hackathon 2025 - SDG 1 & SDG 2 Solution

FoodBridge AI is an intelligent platform that uses **artificial intelligence** to predict food surplus, match donors with recipients, and create a circular economy that fights both poverty and hunger.

## 🌟 The Problem

- **1.05 billion tonnes** of food wasted annually globally
- **783 million people** experiencing hunger worldwide  
- **$1 trillion** economic cost of food waste
- Current systems lack intelligent matching and prediction

## 💡 Our Solution

FoodBridge AI leverages **machine learning** and **real-time data** to:

1. **Predict Food Surplus** - AI analyzes weather, time patterns, and historical data to forecast when businesses will have excess food
2. **Smart Matching** - Advanced algorithms match food with recipients based on location, dietary needs, capacity, and urgency
3. **Real-time Coordination** - Live notifications and tracking ensure efficient food redistribution
4. **Impact Tracking** - Measure CO₂ saved, meals provided, and economic value in real-time

## 🎯 Key Features

### For Businesses
- ✨ **AI Surplus Prediction** - Know when you'll have excess food before it happens
- 📊 **Analytics Dashboard** - Track donations, impact, and tax benefits
- 🎯 **Automated Matching** - AI finds the best recipients automatically
- 💰 **Cost Savings** - Reduce disposal costs and get tax deductions

### For Recipients
- 🔍 **Smart Browse** - Find food matching your dietary needs and capacity
- 📍 **Location-Based** - See available food nearby in real-time
- 🎁 **Free Quality Food** - Access fresh, nutritious food for your community
- 📈 **Impact Metrics** - See how much you've helped save

### For Drivers
- 💵 **Earn Money** - Get paid for delivering food to those in need
- 🚗 **Flexible Schedule** - Work when you want
- 🌍 **Social Impact** - Make money while making a difference
- 📱 **Easy App** - Simple interface for accepting and tracking deliveries

## 🤖 AI/ML Features

### 1. Surplus Prediction Model
- Analyzes historical donation patterns
- Factors in weather conditions (OpenWeatherMap API)
- Considers local events and time patterns
- Provides confidence scores and recommendations

### 2. Smart Matching Algorithm
- Multi-factor scoring system:
  - Distance optimization (geospatial queries)
  - Urgency calculation (time-based)
  - Capacity matching
  - Dietary preference alignment
- Real-time match quality scoring (0-100%)

### 3. Natural Language Processing
- Hugging Face API integration
- Sentiment analysis for food descriptions
- Automatic categorization
- Quality assessment

## 🏗️ Technical Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │────────▶│   Backend    │────────▶│  AI Service  │
│   React.js   │◀────────│  Node.js     │◀────────│   Python     │
│    :5173     │         │   Express    │         │    Flask     │
│              │         │    :5000     │         │    :5001     │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                         │
       │                        │                         │
       ▼                        ▼                         ▼
  Tailwind CSS           MongoDB Atlas         Hugging Face API
  Socket.io Client       JWT Auth              Scikit-learn
  MapBox Maps            Real-time             Pandas/NumPy
```

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, Socket.io Client
- **Backend**: Node.js, Express, MongoDB, Socket.io, JWT
- **AI/ML**: Python Flask, Scikit-learn, Hugging Face, Pandas
- **APIs**: MapBox, OpenWeatherMap, Cloudinary, Hugging Face
- **Deployment**: Vercel (Frontend), Railway (Backend + AI)

## 📊 Impact Metrics

Our platform tracks:
- **CO₂ Emissions Saved** (kg)
- **Meals Provided** (count)
- **Money Saved** (USD)
- **People Served** (count)
- **Food Waste Reduced** (kg)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB Atlas account
- pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/foodbridge-ai.git
cd foodbridge-ai

# Install dependencies
pnpm install
cd client && pnpm install
cd ../server && pnpm install

# Setup Python AI service
cd ../ai-service
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
cd ..

# Configure environment variables
# Copy .env.example to .env in each folder and add your API keys

# Start all services
pnpm run dev
```

### Environment Variables Needed

```env
# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string

# Hugging Face (AI)
HUGGING_FACE_API_KEY=your_hf_token

# MapBox (Maps)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# OpenWeather (Weather data)
OPENWEATHER_API_KEY=your_openweather_key

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🌍 SDG Alignment

### SDG 1: No Poverty
- Creates economic opportunities for drivers
- Provides tax benefits for businesses
- Reduces food costs for families in need

### SDG 2: Zero Hunger
- Redistributes 1.05B tonnes of wasted food annually (potential)
- Provides nutritious meals to 783M hungry people (potential)
- Creates sustainable food security systems

## 📈 Business Model

- **Free for Recipients & NGOs**
- **Freemium for Businesses**: $0-50/month
- **Driver Commission**: 15% per delivery
- **Enterprise Solutions**: Custom pricing

