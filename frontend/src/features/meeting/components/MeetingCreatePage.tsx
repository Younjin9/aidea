import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const MeetingCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">모임 개설</h1>
        <div className="w-6" />
      </header>

      {/* 준비 중 메시지 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">준비중</h2>
        <p className="text-sm text-gray-500 text-center">
          
        </p>
      </div>
    </div>
  );
};

export default MeetingCreatePage;
