import React from 'react';
import { Outlet } from 'react-router-dom';

const MobileLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-center">
      <div 
        className="w-full h-full min-h-screen bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-hidden mx-auto"
        style={{ maxWidth: '430px' }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default MobileLayout;
