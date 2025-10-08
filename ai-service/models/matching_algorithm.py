# ai-service/models/matching_algorithm.py
import numpy as np
from geopy.distance import geodesic
from datetime import datetime, timedelta

class SmartMatcher:
    def __init__(self):
        self.weight_distance = 0.4
        self.weight_urgency = 0.3
        self.weight_capacity = 0.2
        self.weight_preference = 0.1
    
    def calculate_match_score(self, food_item, recipient):
        """Calculate compatibility score between food and recipient"""
        
        # Distance score (closer = better)
        distance = geodesic(
            (food_item['lat'], food_item['lng']),
            (recipient['lat'], recipient['lng'])
        ).kilometers
        
        distance_score = max(0, 1 - (distance / 50))  # 50km max reasonable distance
        
        # Urgency score (more urgent = higher priority)
        time_until_expiry = (
            datetime.fromisoformat(food_item['expires_at']) - datetime.now()
        ).total_seconds() / 3600  # hours
        
        urgency_score = max(0, 1 - (time_until_expiry / 48))  # 48 hours max
        
        # Capacity score (can recipient handle the quantity?)
        needed_quantity = recipient.get('quantity_needed', food_item['quantity'])
        capacity_score = min(1, needed_quantity / food_item['quantity'])
        
        # Preference score (dietary restrictions, food type preferences)
        preference_score = self._calculate_preference_match(food_item, recipient)
        
        # Weighted final score
        final_score = (
            distance_score * self.weight_distance +
            urgency_score * self.weight_urgency +
            capacity_score * self.weight_capacity +
            preference_score * self.weight_preference
        )
        
        return {
            'overall_score': final_score,
            'distance_score': distance_score,
            'urgency_score': urgency_score,
            'capacity_score': capacity_score,
            'preference_score': preference_score,
            'estimated_impact': self._calculate_impact(food_item, recipient)
        }
    
    def _calculate_preference_match(self, food_item, recipient):
        """Calculate how well food matches recipient preferences"""
        score = 0.5  # baseline
        
        # Dietary restrictions
        if 'dietary_restrictions' in recipient:
            restrictions = recipient['dietary_restrictions']
            food_tags = food_item.get('tags', [])
            
            if 'vegetarian' in restrictions and 'vegetarian' in food_tags:
                score += 0.3
            if 'vegan' in restrictions and 'vegan' in food_tags:
                score += 0.3
            if 'gluten_free' in restrictions and 'gluten_free' in food_tags:
                score += 0.2
        
        # Food type preferences
        preferred_types = recipient.get('preferred_food_types', [])
        if food_item['category'] in preferred_types:
            score += 0.2
            
        return min(1.0, score)
    
    def _calculate_impact(self, food_item, recipient):
        """Calculate potential social impact of this match"""
        meals_provided = food_item['quantity'] / 0.5  # assume 0.5kg per meal
        people_served = recipient.get('people_served', 1)
        
        return {
            'meals_provided': int(meals_provided),
            'people_served': people_served,
            'co2_saved': food_item['quantity'] * 2.5,  # kg CO2 per kg food
            'money_saved': food_item['estimated_value']
        }
    
    def find_best_matches(self, food_item, recipients, limit=5):
        """Find best recipient matches for a food item"""
        matches = []
        
        for recipient in recipients:
            score_data = self.calculate_match_score(food_item, recipient)
            matches.append({
                'recipient_id': recipient['_id'],
                'recipient_name': recipient['name'],
                'score_data': score_data
            })
        
        # Sort by score and return top matches
        matches.sort(key=lambda x: x['score_data']['overall_score'], reverse=True)
        return matches[:limit]