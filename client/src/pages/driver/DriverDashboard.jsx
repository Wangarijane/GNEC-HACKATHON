// client/src/pages/driver/DriverDashboard.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DriverLayout from '../../components/layout/DriverLayout';
import DriverOverview from './DriverOverview';
import AvailableDeliveries from './AvailableDeliveries';
import MyDeliveries from './MyDeliveries';
import DriverEarnings from './DriverEarnings';

const DriverDashboard = () => {
  return (
    <DriverLayout>
      <Routes>
        <Route index element={<DriverOverview />} />
        <Route path="available" element={<AvailableDeliveries />} />
        <Route path="my-deliveries" element={<MyDeliveries />} />
        <Route path="earnings" element={<DriverEarnings />} />
      </Routes>
    </DriverLayout>
  );
};

export default DriverDashboard;
