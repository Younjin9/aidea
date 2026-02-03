import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/shared/components/ui/Button';

const EventSharePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const meetingId = searchParams.get('meetingId');
  const eventId = searchParams.get('eventId');
  const expires = searchParams.get('expires');

  const [isExpired] = useState(() => {
    if (!expires) return true;
    const expiresAt = Number(expires);
    if (Number.isNaN(expiresAt)) return true;
    return Date.now() > expiresAt;
  });

  useEffect(() => {
    if (!meetingId || !eventId || isExpired) return;
    navigate(`/meetings/${meetingId}`, { replace: true, state: { highlightEventId: eventId } });
  }, [meetingId, eventId, isExpired, navigate]);

  if (!meetingId || !eventId || isExpired) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">링크가 만료되었어요</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">공유 링크의 유효 기간이 만료되었습니다.</p>
        <Button variant="primary" size="md" onClick={() => navigate('/meetings')}>
          모임 목록으로 가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-2">모임으로 이동 중...</h1>
      <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
    </div>
  );
};

export default EventSharePage;
