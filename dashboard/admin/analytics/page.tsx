import React from 'react';
import { RevenueChart } from '@/components/admin/revenue-chart';

const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Analytics</h1>
      <RevenueChart />
    </div>
  );
};

export default AdminAnalyticsPage;