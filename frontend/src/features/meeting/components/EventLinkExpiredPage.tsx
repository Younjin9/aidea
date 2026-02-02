import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/shared/components/ui/Button';

const EventLinkExpiredPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-2">링크가 만료되었어요</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">공유 링크의 유효 기간이 만료되었습니다.</p>
      <div className="flex gap-2">
        <Button variant="outline" size="md" onClick={() => navigate('/shorts')}>
          쇼츠로 가기
        </Button>
        <Button variant="primary" size="md" onClick={() => navigate('/meetings')}>
          모임 목록
        </Button>
      </div>
    </div>
  );
};

export default EventLinkExpiredPage;
