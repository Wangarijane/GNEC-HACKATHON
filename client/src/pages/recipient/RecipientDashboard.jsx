// client/src/pages/recipient/RecipientDashboard.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RecipientLayout from '../../components/layout/RecipientLayout';
import RecipientOverview from './RecipientOverview';
import BrowseFood from './BrowseFood';
import MyRequests from './MyRequests';
import RecipientProfile from './RecipientProfile';

const RecipientDashboard = () => {
  return (
    <RecipientLayout>
      <Routes>
        <Route index element={<RecipientOverview />} />
        <Route path="browse" element={<BrowseFood />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="profile" element={<RecipientProfile />} />
      </Routes>
    </RecipientLayout>
  );
};

export default RecipientDashboard;