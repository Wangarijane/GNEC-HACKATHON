// client/src/pages/driver/DriverEarnings.jsx
import React from 'react';

const DriverEarnings = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600">Overview of your delivery earnings and bonuses.</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">No earnings data</h3>
        <p className="text-gray-500">Your earnings summary will appear once you complete deliveries.</p>
      </div>
    </div>
  );
};

export default DriverEarnings;
