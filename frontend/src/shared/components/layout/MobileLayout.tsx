import React from 'react';
import { Outlet } from 'react-router-dom';

const MobileLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-lg relative flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default MobileLayout;
