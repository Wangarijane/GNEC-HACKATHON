// client/src/components/business/SurplusPredictionCard.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import predictionService from '../../services/predictionService';
import toast from 'react-hot-toast';

const SurplusPredictionCard = () => {
  const { user } = useAuthStore();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await predictionService.getSurplusPrediction();
      
      if (response.data.success) {
        setPrediction(response.data.data);
      } else {
        // Use fallback data if AI service is down
        setPrediction(response.data.data);
        setError('AI service unavailable - showing estimate');
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError('Unable to fetch prediction');
      toast.error('Could not load AI prediction');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyLevel = (surplus) => {
    if (surplus > 40) return { level: 'high', color: 'red', icon: AlertTriangle };
    if (surplus > 20) return { level: 'medium', color: 'yellow', icon: TrendingUp };
    return { level: 'low', color: 'green', icon: CheckCircle };
  };

  const getUrgencyStyles = (color) => {
    const styles = {
      red: 'border-red-200 bg-red-50 text-red-800',
      yellow: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      green: 'border-green-200 bg-green-50 text-green-800'
    };
    return styles[color] || styles.green;
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="card text-center">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Prediction Unavailable</h3>
        <p className="text-gray-500 mb-4">Unable to load AI prediction at this time.</p>
        <button 
          onClick={fetchPrediction}
          className="btn-secondary flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const urgency = getUrgencyLevel(prediction.predicted_surplus);
  const UrgencyIcon = urgency.icon;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Zap className="h-5 w-5 mr-2 text-primary-600" />
          AI Surplus Prediction
        </h3>
        <button 
          onClick={fetchPrediction}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4 text-xs text-yellow-700">
          ⚠️ {error}
        </div>
      )}

      <div className={`border-2 rounded-lg p-4 mb-4 ${getUrgencyStyles(urgency.color)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <UrgencyIcon className="h-5 w-5" />
            <span className="font-semibold">Next 24 Hours</span>
          </div>
          <span className="text-2xl font-bold">
            {Math.round(prediction.predicted_surplus)} kg
          </span>
        </div>
        <div className="text-sm opacity-75">
          AI Confidence: {Math.round(prediction.confidence * 100)}%
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">💡 AI Recommendation</p>
              <p className="text-sm text-blue-700">{prediction.recommendation}</p>
            </div>
          </div>
        </div>

        {prediction.factors && prediction.factors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Factors:</h4>
            <ul className="space-y-1">
              {prediction.factors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {prediction.weather_impact && (
          <div className="text-xs text-gray-500">
            Weather Impact: <span className="capitalize">{prediction.weather_impact.replace('_', ' ')}</span>
          </div>
        )}

        <div className="pt-3 border-t">
          <button 
            onClick={() => window.location.href = '/business/post-food'}
            className="w-full btn-primary"
          >
            Post Surplus Food Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurplusPredictionCard;