import React from 'react';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import { UsersRound } from 'lucide-react';
import type { MeetingDetail } from '@/shared/types/Meeting.types';

interface MemberSectionProps {
  members: MeetingDetail['members'];
  isHost: boolean;
  onManage: () => void;
  isLoading?: boolean;
}

const MemberSection: React.FC<MemberSectionProps> = ({
  members = [],
  isHost,
  onManage,
  isLoading = false,
}) => {
  // APPROVED 상태의 멤버만 표시 (예: HOST 우선 정렬)
  const displayMembers = Array.isArray(members)
    ? members
        .filter(m => m.status === 'APPROVED')
        .sort((a, b) => {
          if (a.role === 'HOST') return -1;
          if (b.role === 'HOST') return 1;
          return 0;
        })
    : [];

  return (
    <section className="px-4 pb-8 border-t border-gray-200">
      <div className="flex items-center justify-between py-4">
        <h3 className="font-semibold">
          멤버 {displayMembers.length > 0 && <span className="text-xs font-normal text-gray-500">({displayMembers.length})</span>}
        </h3>
        {isHost && (
          <button
            onClick={onManage}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:opacity-60 transition"
            aria-label="멤버 관리"
          >
            <UsersRound size={16} />
            관리
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-400 text-sm py-4">멤버를 로드하는 중입니다...</p>
        ) : displayMembers.length > 0 ? (
          displayMembers.map((member) => (
            <div key={`${member.userId}-${member.role}`} className="flex items-center gap-3 py-2">
              <ProfileImage src={member.profileImage} alt={member.nickname} size="md" />
              <div className="flex-1">
                <p className="font-medium text-sm">{member.nickname}</p>
                {member.role === 'HOST' && <p className="text-xs text-gray-400">모임장</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm py-4">멤버가 없습니다</p>
        )}
      </div>
    </section>
  );
};

export default MemberSection;
