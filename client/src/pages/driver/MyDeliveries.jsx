// client/src/pages/driver/MyDeliveries.jsx
import React from 'react';

const MyDeliveries = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
        <p className="text-gray-600">Track the deliveries you have accepted.</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">No deliveries yet</h3>
        <p className="text-gray-500">Accepted deliveries will be shown here.</p>
      </div>
    </div>
  );
};

export default MyDeliveries;
