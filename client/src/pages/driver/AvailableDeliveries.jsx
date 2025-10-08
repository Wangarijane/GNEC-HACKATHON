// client/src/pages/driver/AvailableDeliveries.jsx
import React from 'react';

const AvailableDeliveries = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Available Deliveries</h1>
        <p className="text-gray-600">Browse deliveries you can accept.</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">No deliveries available</h3>
        <p className="text-gray-500">New delivery opportunities will appear here.</p>
      </div>
    </div>
  );
};

export default AvailableDeliveries;
