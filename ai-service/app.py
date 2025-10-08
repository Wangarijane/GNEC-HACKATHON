# ai-service/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
from datetime import datetime, timedelta
import json
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Hugging Face API configuration
HF_API_KEY = os.getenv('HUGGING_FACE_API_KEY')
HF_HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

# API endpoints
WEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "OK",
        "message": "FoodBridge AI Service is running!",
        "timestamp": datetime.now().isoformat()
    })

# ============================================================================
# FOOD SURPLUS PREDICTION
# ============================================================================

@app.route('/api/predict/surplus', methods=['POST'])
def predict_surplus():
    try:
        data = request.json
        business_id = data.get('business_id')
        
        # Get weather data for location
        weather_data = get_weather_data(data.get('lat'), data.get('lng'))
        
        # Prepare features for prediction
        features = prepare_prediction_features(data, weather_data)
        
        # Make prediction using simple model
        prediction = calculate_surplus_prediction(features)
        
        # Generate recommendation
        recommendation = generate_surplus_recommendation(prediction['predicted_surplus'])
        
        response = {
            "predicted_surplus": prediction['predicted_surplus'],
            "confidence": prediction['confidence'],
            "recommendation": recommendation,
            "factors": prediction['factors'],
            "weather_impact": weather_data['impact'] if weather_data else None
        }
        
        logger.info(f"Surplus prediction for business {business_id}: {prediction['predicted_surplus']} kg")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Surplus prediction error: {str(e)}")
        return jsonify({"error": "Prediction failed"}), 500

def prepare_prediction_features(data, weather_data):
    """Prepare features for surplus prediction"""
    now = datetime.now()
    
    # Time-based features
    features = {
        'hour': now.hour,
        'day_of_week': now.weekday(),
        'is_weekend': now.weekday() >= 5,
        'is_rush_hour': now.hour in [11, 12, 18, 19, 20],
        'season': (now.month % 12) // 3 + 1
    }
    
    # Business features
    features.update({
        'business_type': hash(data.get('business_type', 'restaurant')) % 10,
        'historical_avg': data.get('historical_avg_surplus', 15.0),
        'capacity': data.get('capacity', 100),
        'promotion_active': data.get('has_promotion', False)
    })
    
    # Weather features
    if weather_data:
        features.update({
            'temperature': weather_data.get('temperature', 20),
            'weather_condition': weather_data.get('condition_code', 800),
            'precipitation': weather_data.get('rain', 0)
        })
    
    # Event features
    features.update({
        'local_events': data.get('event_score', 0),
        'is_holiday': is_holiday(now)
    })
    
    return features

def calculate_surplus_prediction(features):
    """Simple rule-based surplus prediction model"""
    
    base_surplus = features['historical_avg']
    
    # Time adjustments
    time_multiplier = 1.0
    if features['is_weekend']:
        time_multiplier *= 1.2
    if features['is_rush_hour']:
        time_multiplier *= 0.8
    
    # Weather adjustments
    weather_multiplier = 1.0
    if 'temperature' in features:
        temp = features['temperature']
        if temp < 5 or temp > 35:  # Extreme temperatures
            weather_multiplier *= 1.3
        if features.get('precipitation', 0) > 0:
            weather_multiplier *= 1.4
    
    # Business type adjustments
    business_multiplier = 1.0
    if features['business_type'] % 3 == 0:  # Restaurants
        business_multiplier *= 1.1
    
    # Event adjustments
    event_multiplier = 1.0 - (features['local_events'] * 0.1)
    
    # Calculate prediction
    predicted_surplus = base_surplus * time_multiplier * weather_multiplier * business_multiplier * event_multiplier
    predicted_surplus = max(0, predicted_surplus)
    
    # Calculate confidence based on data completeness
    confidence = 0.7  # Base confidence
    if 'temperature' in features:
        confidence += 0.1
    if features['historical_avg'] > 0:
        confidence += 0.15
    
    confidence = min(0.95, confidence)
    
    # Identify key factors
    factors = []
    if time_multiplier > 1.1:
        factors.append("Weekend increase expected")
    if weather_multiplier > 1.2:
        factors.append("Weather impact: reduced foot traffic")
    if event_multiplier < 0.9:
        factors.append("Local events may reduce surplus")
    
    return {
        'predicted_surplus': round(predicted_surplus, 1),
        'confidence': round(confidence, 2),
        'factors': factors
    }

def generate_surplus_recommendation(surplus_amount):
    """Generate actionable recommendations based on predicted surplus"""
    if surplus_amount > 50:
        return "High surplus predicted! Consider posting items early and reaching out to multiple food banks."
    elif surplus_amount > 25:
        return "Moderate surplus expected. Post items 2-3 hours before closing time."
    elif surplus_amount > 10:
        return "Low-moderate surplus. Consider bundling items for larger recipients."
    else:
        return "Minimal surplus expected. Focus on portion control and accurate demand forecasting."

def get_weather_data(lat, lng):
    """Get weather data from OpenWeatherMap API"""
    if not WEATHER_API_KEY or not lat or not lng:
        return None
    
    try:
        url = f"{WEATHER_BASE_URL}?lat={lat}&lon={lng}&appid={WEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if response.status_code == 200:
            return {
                'temperature': data['main']['temp'],
                'condition_code': data['weather'][0]['id'],
                'condition': data['weather'][0]['description'],
                'rain': data.get('rain', {}).get('1h', 0),
                'impact': calculate_weather_impact(data)
            }
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
    
    return None

def calculate_weather_impact(weather_data):
    """Calculate weather impact on food demand"""
    temp = weather_data['main']['temp']
    condition_id = weather_data['weather'][0]['id']
    
    impact = "neutral"
    
    if temp < 0 or temp > 35:
        impact = "high_surplus"  # Extreme temps reduce foot traffic
    elif condition_id < 700:  # Rain, snow, storms
        impact = "moderate_surplus"
    elif 800 <= condition_id <= 801:  # Clear/few clouds
        impact = "low_surplus"  # Good weather increases foot traffic
    
    return impact

def is_holiday(date):
    """Simple holiday detection (extend as needed)"""
    # Basic holiday detection - extend with proper holiday calendar
    month_day = (date.month, date.day)
    holidays = [
        (1, 1),   # New Year
        (12, 25), # Christmas
        (7, 4),   # Independence Day (US)
        (11, 11), # Veterans Day
    ]
    return month_day in holidays

# ============================================================================
# SMART MATCHING ALGORITHM
# ============================================================================

@app.route('/api/match/food', methods=['POST'])
def match_food_with_recipients():
    try:
        data = request.json
        food_item = data.get('food_item')
        recipients = data.get('recipients', [])
        
        if not food_item or not recipients:
            return jsonify({"error": "Food item and recipients required"}), 400
        
        # Calculate matches
        matches = []
        for recipient in recipients:
            match_score = calculate_match_score(food_item, recipient)
            if match_score['overall_score'] > 0.3:  # Minimum threshold
                matches.append({
                    'recipient_id': recipient['_id'],
                    'recipient_name': recipient.get('name', 'Unknown'),
                    'score': match_score['overall_score'],
                    'distance_km': match_score['distance_km'],
                    'urgency_score': match_score['urgency_score'],
                    'capacity_score': match_score['capacity_score'],
                    'preference_score': match_score['preference_score'],
                    'estimated_impact': match_score['estimated_impact'],
                    'reasons': match_score['reasons']
                })
        
        # Sort by score
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top 5 matches
        return jsonify({
            'matches': matches[:5],
            'total_potential_recipients': len(matches)
        })
        
    except Exception as e:
        logger.error(f"Matching error: {str(e)}")
        return jsonify({"error": "Matching failed"}), 500

def calculate_match_score(food_item, recipient):
    """Calculate compatibility score between food and recipient"""
    
    # Distance score (closer = better)
    distance = calculate_distance(
        food_item['location']['coordinates'],
        recipient['profile']['location']['coordinates']
    )
    distance_score = max(0, 1 - (distance / 50))  # 50km max distance
    
    # Urgency score (more urgent = higher priority)
    urgency_score = calculate_urgency_score(food_item)
    
    # Capacity score (can recipient handle quantity?)
    capacity_score = calculate_capacity_score(food_item, recipient)
    
    # Preference score (dietary restrictions, food type)
    preference_score = calculate_preference_score(food_item, recipient)
    
    # Weighted overall score
    weights = {'distance': 0.4, 'urgency': 0.3, 'capacity': 0.2, 'preference': 0.1}
    overall_score = (
        distance_score * weights['distance'] +
        urgency_score * weights['urgency'] +
        capacity_score * weights['capacity'] +
        preference_score * weights['preference']
    )
    
    # Estimate impact
    estimated_impact = calculate_estimated_impact(food_item, recipient)
    
    # Generate reasons
    reasons = generate_match_reasons(distance_score, urgency_score, capacity_score, preference_score)
    
    return {
        'overall_score': round(overall_score, 3),
        'distance_km': round(distance, 1),
        'urgency_score': round(urgency_score, 2),
        'capacity_score': round(capacity_score, 2),
        'preference_score': round(preference_score, 2),
        'estimated_impact': estimated_impact,
        'reasons': reasons
    }

def calculate_distance(coord1, coord2):
    """Calculate distance between two coordinates using Haversine formula"""
    from math import radians, sin, cos, sqrt, atan2
    
    lat1, lon1 = radians(coord1[1]), radians(coord1[0])
    lat2, lon2 = radians(coord2[1]), radians(coord2[0])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    # Earth radius in kilometers
    r = 6371
    distance = r * c
    
    return distance

def calculate_urgency_score(food_item):
    """Calculate urgency based on expiry time"""
    try:
        expiry_time = datetime.fromisoformat(food_item['expiresAt'].replace('Z', '+00:00'))
        now = datetime.now()
        hours_until_expiry = (expiry_time - now).total_seconds() / 3600
        
        if hours_until_expiry <= 2:
            return 1.0  # Very urgent
        elif hours_until_expiry <= 6:
            return 0.8  # Urgent
        elif hours_until_expiry <= 24:
            return 0.6  # Moderate
        else:
            return 0.4  # Low urgency
    except:
        return 0.5  # Default

def calculate_capacity_score(food_item, recipient):
    """Calculate if recipient can handle the food quantity"""
    food_quantity = food_item['quantity']['value']
    recipient_capacity = recipient['profile'].get('servingCapacity', 50)
    
    if recipient_capacity <= 0:
        return 0.5  # Default
    
    ratio = food_quantity / recipient_capacity
    
    if 0.1 <= ratio <= 1.5:  # Optimal range
        return 1.0
    elif ratio < 0.1:  # Too little food
        return 0.3
    elif ratio > 3:  # Too much food
        return 0.2
    else:
        return 0.7

def calculate_preference_score(food_item, recipient):
    """Calculate dietary/preference compatibility"""
    score = 0.5  # Base score
    
    food_dietary_info = food_item.get('dietaryInfo', [])
    recipient_restrictions = recipient['profile'].get('dietaryRestrictions', [])
    
    # Check dietary restrictions compatibility
    for restriction in recipient_restrictions:
        if restriction in food_dietary_info:
            score += 0.2
        elif restriction == 'vegetarian' and 'vegan' in food_dietary_info:
            score += 0.2
    
    # Category preferences
    food_category = food_item.get('category', '')
    preferred_categories = recipient['profile'].get('preferredCategories', [])
    
    if food_category in preferred_categories:
        score += 0.2
    
    return min(1.0, score)

def calculate_estimated_impact(food_item, recipient):
    """Calculate potential impact of this match"""
    food_quantity = food_item['quantity']['value']
    estimated_value = food_item.get('estimatedValue', 0)
    
    # Rough estimates
    meals_provided = int(food_quantity / 0.4)  # ~400g per meal
    people_served = recipient['profile'].get('servingCapacity', 1)
    co2_saved = food_quantity * 2.5  # kg CO2 per kg food waste avoided
    
    return {
        'meals_provided': meals_provided,
        'people_served': min(people_served, meals_provided),
        'co2_saved_kg': round(co2_saved, 1),
        'money_saved_usd': round(estimated_value, 2)
    }

def generate_match_reasons(distance_score, urgency_score, capacity_score, preference_score):
    """Generate human-readable reasons for the match"""
    reasons = []
    
    if distance_score > 0.8:
        reasons.append("Very close location")
    elif distance_score > 0.6:
        reasons.append("Nearby location")
    
    if urgency_score > 0.8:
        reasons.append("Food expires soon - urgent!")
    
    if capacity_score > 0.8:
        reasons.append("Perfect quantity match")
    
    if preference_score > 0.7:
        reasons.append("Matches dietary preferences")
    
    if not reasons:
        reasons.append("Good overall compatibility")
    
    return reasons

# ============================================================================
# HUGGING FACE INTEGRATION
# ============================================================================

@app.route('/api/analyze/sentiment', methods=['POST'])
def analyze_food_description():
    """Analyze food description to extract insights"""
    try:
        data = request.json
        description = data.get('description', '')
        
        if not description:
            return jsonify({"error": "Description required"}), 400
        
        # Use Hugging Face for sentiment analysis
        sentiment_result = query_hugging_face_sentiment(description)
        
        # Extract food categories using simple keyword matching
        categories = extract_food_categories(description)
        
        # Estimate freshness from description
        freshness = estimate_freshness(description)
        
        return jsonify({
            'sentiment': sentiment_result,
            'categories': categories,
            'freshness': freshness,
            'quality_score': calculate_quality_score(description)
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({"error": "Analysis failed"}), 500

def query_hugging_face_sentiment(text):
    """Query Hugging Face sentiment analysis API"""
    try:
        API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
        response = requests.post(API_URL, headers=HF_HEADERS, json={"inputs": text}, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0]
    except Exception as e:
        logger.error(f"HuggingFace API error: {str(e)}")
    
    return [{"label": "NEUTRAL", "score": 0.5}]  # Default

def extract_food_categories(description):
    """Extract food categories from description using keywords"""
    categories = []
    
    category_keywords = {
        'meals': ['meal', 'dinner', 'lunch', 'breakfast', 'dish', 'prepared'],
        'bakery': ['bread', 'cake', 'pastry', 'cookie', 'muffin', 'croissant'],
        'produce': ['fruit', 'vegetable', 'apple', 'banana', 'carrot', 'lettuce', 'tomato'],
        'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
        'beverages': ['juice', 'soda', 'water', 'coffee', 'tea'],
        'snacks': ['chips', 'crackers', 'nuts', 'candy']
    }
    
    description_lower = description.lower()
    
    for category, keywords in category_keywords.items():
        if any(keyword in description_lower for keyword in keywords):
            categories.append(category)
    
    return categories if categories else ['other']

def estimate_freshness(description):
    """Estimate food freshness from description"""
    description_lower = description.lower()
    
    fresh_indicators = ['fresh', 'new', 'just made', 'today', 'crisp']
    old_indicators = ['day old', 'yesterday', 'leftover', 'excess']
    
    fresh_score = sum(1 for indicator in fresh_indicators if indicator in description_lower)
    old_score = sum(1 for indicator in old_indicators if indicator in description_lower)
    
    if fresh_score > old_score:
        return 'high'
    elif old_score > fresh_score:
        return 'medium'
    else:
        return 'unknown'

def calculate_quality_score(description):
    """Calculate overall quality score based on description"""
    positive_words = ['fresh', 'delicious', 'quality', 'excellent', 'perfect', 'good']
    negative_words = ['old', 'stale', 'expired', 'bad', 'poor']
    
    description_lower = description.lower()
    
    positive_count = sum(1 for word in positive_words if word in description_lower)
    negative_count = sum(1 for word in negative_words if word in description_lower)
    
    base_score = 0.7
    score = base_score + (positive_count * 0.1) - (negative_count * 0.2)
    
    return max(0, min(1, score))

# ============================================================================
# BATCH PROCESSING FOR PREDICTIONS
# ============================================================================

@app.route('/api/batch/predict-demand', methods=['POST'])
def batch_predict_demand():
    """Batch process demand predictions for multiple locations"""
    try:
        data = request.json
        locations = data.get('locations', [])
        
        predictions = []
        for location in locations:
            prediction = predict_area_demand(location)
            predictions.append(prediction)
        
        return jsonify({
            'predictions': predictions,
            'total_processed': len(predictions)
        })
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({"error": "Batch processing failed"}), 500

def predict_area_demand(location):
    """Predict food demand for a specific area"""
    # Simple demand prediction based on location characteristics
    population_density = location.get('population_density', 100)
    poverty_rate = location.get('poverty_rate', 0.1)
    food_access_score = location.get('food_access_score', 0.5)
    
    # Calculate demand factors
    demand_multiplier = (
        (population_density / 1000) * 0.4 +
        (poverty_rate * 10) * 0.4 +
        (1 - food_access_score) * 0.2
    )
    
    base_demand = 50  # Base demand in kg per day
    predicted_demand = base_demand * demand_multiplier
    
    return {
        'location': location.get('name', 'Unknown'),
        'coordinates': location.get('coordinates'),
        'predicted_daily_demand_kg': round(predicted_demand, 1),
        'demand_level': 'high' if predicted_demand > 75 else 'medium' if predicted_demand > 25 else 'low',
        'factors': {
            'population_density': population_density,
            'poverty_rate': poverty_rate,
            'food_access_score': food_access_score
        }
    }

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f" FoodBridge AI Service starting on port {port}")
    print(f" HuggingFace API configured: {'YES' if HF_API_KEY else '❌'}")
    print(f" Weather API configured: {'YES' if WEATHER_API_KEY else '❌'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)