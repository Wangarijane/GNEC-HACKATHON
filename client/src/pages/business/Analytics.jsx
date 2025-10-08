// client/src/pages/business/Analytics.jsx
import React from 'react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track impact metrics, donation trends, and efficiency over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Impact Overview</h3>
          <p className="text-gray-500">Visualizations and metrics will appear here.</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Donations Over Time</h3>
          <p className="text-gray-500">Charts for donations and matches will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
