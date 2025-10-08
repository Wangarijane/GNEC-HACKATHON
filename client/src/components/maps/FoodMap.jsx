// client/src/components/maps/FoodMap.jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useJSApiLoader } from '@react-google-maps/api';

const FoodMap = ({ userLocation, foodItems, onFoodSelect }) => {
    const [selectedFood, setSelectedFood] = useState(null);
    
    const { isLoaded } = useJSApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });
    
    const mapStyles = {
        width: '100%',
        height: '400px'
    };
    
    const center = userLocation || { lat: 40.7128, lng: -74.0060 }; // Default NYC
    
    const getMarkerColor = (urgency) => {
        if (urgency === 'high') return '#dc2626'; // red
        if (urgency === 'medium') return '#f59e0b'; // yellow
        return '#16a34a'; // green
    };
    
    const calculateUrgency = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);
        
        if (hoursUntilExpiry < 6) return 'high';
        if (hoursUntilExpiry < 24) return 'medium';
        return 'low';
    };
    
    if (!isLoaded) return <div>Loading map...</div>;
    
    return (
        <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={12}
            center={center}
        >
            {/* User location marker */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={{
                        url: '/icons/user-location.png',
                        scaledSize: new window.google.maps.Size(30, 30)
                    }}
                />
            )}
            
            {/* Food item markers */}
            {foodItems.map((food) => {
                const urgency = calculateUrgency(food.expiresAt);
                return (
                    <Marker
                        key={food._id}
                        position={{ lat: food.location.lat, lng: food.location.lng }}
                        icon={{
                            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="8" fill="${getMarkerColor(urgency)}" stroke="white" stroke-width="2"/>
                                    <text x="10" y="14" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🍽️</text>
                                </svg>
                            `)}`
                        }}
                        onClick={() => setSelectedFood(food)}
                    />
                );
            })}
            
            {/* Info window for selected food */}
            {selectedFood && (
                <InfoWindow
                    position={{ 
                        lat: selectedFood.location.lat, 
                        lng: selectedFood.location.lng 
                    }}
                    onCloseClick={() => setSelectedFood(null)}
                >
                    <div className="p-2 max-w-xs">
                        <h3 className="font-bold text-lg">{selectedFood.title}</h3>
                        <p className="text-sm text-gray-600">{selectedFood.description}</p>
                        <div className="mt-2 space-y-1">
                            <p><strong>Quantity:</strong> {selectedFood.quantity} kg</p>
                            <p><strong>Expires:</strong> {new Date(selectedFood.expiresAt).toLocaleDateString()}</p>
                            <p><strong>From:</strong> {selectedFood.businessName}</p>
                        </div>
                        <button
                            onClick={() => onFoodSelect(selectedFood)}
                            className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                        >
                            Request This Food
                        </button>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

export default FoodMap;