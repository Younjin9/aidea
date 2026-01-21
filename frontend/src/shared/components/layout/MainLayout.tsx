import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-lg relative flex flex-col">
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
