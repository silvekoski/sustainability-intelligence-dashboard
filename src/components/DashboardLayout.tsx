import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50">
      <div className='flex flex-col pr-[33.333333%]'>
        <Header />
        <main className='flex-1 overflow-hidden'>
          <div className='overflow-auto w-full h-full'>
            <Outlet />
          </div>
        </main>
      </div>
      <div className='fixed right-0 top-0 w-1/3 h-screen z-10'>
        <iframe 
          className='w-full h-full' 
          src="https://www.youtube.com/embed/zZ7AimPACzc?autoplay=1&mute=1&loop=1&playlist=zZ7AimPACzc" 
          title="10 hour loop playing Subway Surfers" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
        />
      </div>
    </div>
  );
};