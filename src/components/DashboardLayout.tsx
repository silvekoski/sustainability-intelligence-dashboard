import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};