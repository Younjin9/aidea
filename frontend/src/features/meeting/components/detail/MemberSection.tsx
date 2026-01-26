import React from 'react';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import { UsersRound } from 'lucide-react';
import type { MeetingDetail } from '@/shared/types/Meeting.types';

const MemberSection: React.FC<{ members: MeetingDetail['members']; isHost: boolean; onManage: () => void }> = ({ members, isHost, onManage }) => (
  <section className="px-4 pb-8 border-t border-gray-200">
    <div className="flex items-center justify-between py-4">
      <h3 className="font-semibold">멤버</h3>
      {isHost && (
        <button onClick={onManage} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:opacity-60 transition">
          <UsersRound size={16} />관리
        </button>
      )}
    </div>
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.userId} className="flex items-center gap-3 py-2">
          <ProfileImage src={member.profileImage} alt={member.nickname} size="md" />
          <p className="font-medium text-sm">{member.nickname}</p>
        </div>
      ))}
    </div>
  </section>
);

export default MemberSection;
