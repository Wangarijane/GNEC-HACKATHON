// client/src/pages/business/BusinessDashboard.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BusinessLayout from '../../components/layout/BusinessLayout';
import BusinessOverview from './BusinessOverview';
import PostFood from './PostFood';
import MyFoodItems from './MyFoodItems';
import Matches from './Matches';
import Analytics from './Analytics';

const BusinessDashboard = () => {
  return (
    <BusinessLayout>
      <Routes>
        <Route index element={<BusinessOverview />} />
        <Route path="post-food" element={<PostFood />} />
        <Route path="my-food" element={<MyFoodItems />} />
        <Route path="matches" element={<Matches />} />
        <Route path="analytics" element={<Analytics />} />
      </Routes>
    </BusinessLayout>
  );
};

export default BusinessDashboard;