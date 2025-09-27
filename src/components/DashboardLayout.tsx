import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { DashboardSidebar } from './DashboardSidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      </div>
    </div>
  );
};