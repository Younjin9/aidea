// 모임 멤버 관리
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import Modal from '@/shared/components/ui/Modal';

interface Member {
  userId: string;
  nickname: string;
  profileImage?: string;
  role: 'HOST' | 'MEMBER';
  status: 'APPROVED' | 'PENDING';
  joinedAt: string;
  requestMessage?: string;
}

// TODO: API로 대체
const MOCK_MEMBERS: Member[] = [
  { userId: 'user1', nickname: '김구름', profileImage: undefined, role: 'HOST', status: 'APPROVED', joinedAt: '2024-01-20' },
  { userId: 'user2', nickname: '김구름2', profileImage: undefined, role: 'MEMBER', status: 'APPROVED', joinedAt: '2024-01-20' },
];

const MOCK_PENDING_MEMBERS: Member[] = [
  { userId: 'user3', nickname: '양종태', profileImage: undefined, role: 'MEMBER', status: 'PENDING', joinedAt: '2024-01-21', requestMessage: '안녕하세요 어쩌고 저쩌고' },
];

const MemberManagePage: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  console.log('meetingId:', meetingId); // TODO: API 호출 시 사용

  // Member State
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [pendingMembers, setPendingMembers] = useState<Member[]>(MOCK_PENDING_MEMBERS);

  // Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Derived State
  const approvedMembers = members.filter(m => m.status === 'APPROVED');
  const hostMember = approvedMembers.find(m => m.role === 'HOST');
  const regularMembers = approvedMembers.filter(m => m.role !== 'HOST');

  // 모임장 양도
  const handleTransferConfirm = () => {
    if (!selectedMember) return;
    // TODO: API 호출
    console.log('모임장 양도:', selectedMember.userId);
    setShowTransferModal(false);
    setSelectedMember(null);
  };

  // 강퇴
  const handleKickConfirm = () => {
    if (!selectedMember) return;
    // TODO: API 호출
    setMembers(prev => prev.filter(m => m.userId !== selectedMember.userId));
    setShowKickModal(false);
    setSelectedMember(null);
  };

  // 참가 승인/거절
  const handleApprove = (member: Member) => {
    setPendingMembers(prev => prev.filter(m => m.userId !== member.userId));
    setMembers(prev => [...prev, { ...member, status: 'APPROVED' }]);
  };

  const handleReject = (member: Member) => {
    setPendingMembers(prev => prev.filter(m => m.userId !== member.userId));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between p-4">
          <BackButton />
          <h1 className="font-semibold text-base">모임 멤버</h1>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-400 font-medium">
            완료
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4">
        {/* 현재 멤버 */}
        <section className="py-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">현재 멤버 {approvedMembers.length}명</h2>
          <div className="space-y-4">
            {/* HOST */}
            {hostMember && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ProfileImage src={hostMember.profileImage} alt={hostMember.nickname} size="md" />
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                    <Crown size={12} className="text-white fill-white" />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{hostMember.nickname}</span>
              </div>
            )}

            {/* 일반 멤버 */}
            {regularMembers.map((member) => (
              <div key={member.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ProfileImage src={member.profileImage} alt={member.nickname} size="md" />
                  <span className="text-sm font-medium text-gray-900">{member.nickname}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedMember(member); setShowTransferModal(true); }}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md"
                  >
                    모임장 양도
                  </button>
                  <button
                    onClick={() => { setSelectedMember(member); setShowKickModal(true); }}
                    className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-md"
                  >
                    강퇴
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 참가 신청 멤버 */}
        {pendingMembers.length > 0 && (
          <section className="py-4 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">참가 신청 멤버</h2>
            <div className="space-y-4">
              {pendingMembers.map((member) => (
                <div key={member.userId} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <ProfileImage src={member.profileImage} alt={member.nickname} size="md" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">{member.nickname}</span>
                      {member.requestMessage && (
                        <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{member.requestMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(member)}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(member)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-md"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 모임장 양도 모달 */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        message={`${selectedMember?.nickname}님에게 모임장을 양도하시겠습니까?`}
        showCheckbox={true}
        checkboxLabel="양도에 동의합니다"
        confirmText="양도"
        cancelText="취소"
        onConfirm={handleTransferConfirm}
      />

      {/* 강퇴 모달 */}
      <Modal
        isOpen={showKickModal}
        onClose={() => setShowKickModal(false)}
        message={`${selectedMember?.nickname}님을 강퇴하시겠습니까?`}
        showCheckbox={true}
        checkboxLabel="강퇴에 동의합니다"
        confirmText="강퇴"
        cancelText="취소"
        onConfirm={handleKickConfirm}
      />
    </div>
  );
};

export default MemberManagePage;
