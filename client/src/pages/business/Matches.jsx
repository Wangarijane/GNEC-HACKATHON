// client/src/pages/business/Matches.jsx
import React from 'react';

const Matches = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
        <p className="text-gray-600">View and manage matches between your surplus posts and recipients.</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
        <p className="text-gray-500">When your posts get matched with recipients, they will appear here for your review.</p>
      </div>
    </div>
  );
};

export default Matches;
