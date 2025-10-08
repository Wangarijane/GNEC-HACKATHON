# ai-service/models/surplus_prediction.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import numpy as np

class SurplusPredictionModel:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.features = [
            'day_of_week', 'hour', 'weather_temp', 'weather_condition',
            'local_events', 'historical_surplus', 'business_type', 
            'season', 'holiday_indicator', 'promotion_active'
        ]
    
    def prepare_features(self, data):
        """Engineer features for prediction"""
        df = pd.DataFrame(data)
        
        # Time features
        df['day_of_week'] = pd.to_datetime(df['timestamp']).dt.dayofweek
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        df['season'] = pd.to_datetime(df['timestamp']).dt.month % 12 // 3 + 1
        
        # Weather features (from API)
        df['weather_temp'] = df.get('temperature', 20)
        df['weather_condition'] = df.get('weather_code', 0)
        
        # Business features
        df['business_type'] = df.get('category', 'restaurant')
        df['promotion_active'] = df.get('has_promotion', 0)
        
        # Historical data
        df['historical_surplus'] = df.get('avg_weekly_surplus', 0)
        
        # Local events (calendar API integration)
        df['local_events'] = df.get('event_score', 0)
        df['holiday_indicator'] = df.get('is_holiday', 0)
        
        return df[self.features]
    
    def predict_surplus(self, business_data):
        """Predict surplus for next 24 hours"""
        features = self.prepare_features(business_data)
        features_scaled = self.scaler.transform(features)
        
        prediction = self.model.predict(features_scaled)
        confidence = self.model.score(features_scaled, prediction)
        
        return {
            'predicted_surplus': max(0, prediction[0]),
            'confidence': confidence,
            'recommendation': self._generate_recommendation(prediction[0])
        }
    
    def _generate_recommendation(self, surplus):
        if surplus > 50:
            return "High surplus expected. Consider reaching out to food banks early."
        elif surplus > 20:
            return "Moderate surplus expected. Normal posting recommended."
        else:
            return "Low surplus expected. Consider adjusting portions."

# Usage in Flask API
from api.models.surplus_prediction import SurplusPredictionModel

predictor = SurplusPredictionModel()

@app.route('/predict-surplus', methods=['POST'])
def predict_surplus():
    data = request.json
    prediction = predictor.predict_surplus(data)
    return jsonify(prediction)