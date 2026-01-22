import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-center">
      <div 
        className="w-full h-full min-h-screen bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-hidden mx-auto"
        style={{ maxWidth: '430px' }}
      >
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
        
        {/* Bottom Tab Bar */}
        <BottomNavigation />
      </div>
    </div>
  );
};

export default MainLayout;
