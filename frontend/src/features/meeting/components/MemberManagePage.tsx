// 모임 멤버 관리
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Crown } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import ProfileImage from '@/shared/components/ui/ProfileImage';
import Modal from '@/shared/components/ui/Modal';
import {
  useMembers,
  usePendingMembers,
  useApproveMember,
  useRejectMember,
  useRemoveMember,
  useTransferHost,
} from '../hooks/useMembers';

interface Member {
  memberId: string | number;
  userId: string;
  nickname: string;
  profileImage?: string;
  role: 'HOST' | 'MEMBER';
  status: 'APPROVED' | 'PENDING';
  joinedAt: string;
  requestMessage?: string;
}

const MemberManagePage: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedMembers = (location.state as { members?: Member[] })?.members;

  // API Queries
  const { data: apiMembers, isLoading: isLoadingMembers, error: membersError } = useMembers(meetingId || '');
  const { data: apiPendingMembers, isLoading: isLoadingPending, error: pendingError } = usePendingMembers(meetingId || '');



  // API Mutations
  const { mutate: approveMember, isPending: isApproving } = useApproveMember(meetingId || '');
  const { mutate: rejectMember, isPending: isRejecting } = useRejectMember(meetingId || '');
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember(meetingId || '');
  const { mutate: transferHost, isPending: isTransferring } = useTransferHost(meetingId || '');

  // Member State - API 데이터 > 전달받은 멤버 순서로 사용
  const [members, setMembers] = useState<Member[]>(passedMembers || []);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);

  // API 데이터가 로드되면 state 업데이트 (안전하게 타입 단언 및 fallback)
  useEffect(() => {
    if (apiMembers) {
      setMembers(apiMembers as Member[] || []);
    } else if (membersError) {
      console.warn('멤버 목록 API 호출 실패:', membersError);
    }
  }, [apiMembers, membersError]);

  useEffect(() => {
    if (apiPendingMembers) {
      setPendingMembers(apiPendingMembers as Member[] || []);
    } else if (pendingError) {
      console.warn('대기 멤버 목록 API 호출 실패:', pendingError);
    }
  }, [apiPendingMembers, pendingError]);

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

    // API 호출 시도
    transferHost(selectedMember.userId, {
      onSuccess: () => {
        setMembers(prev => prev.map(m => {
          if (m.role === 'HOST') return { ...m, role: 'MEMBER' as const };
          if (m.userId === selectedMember.userId) return { ...m, role: 'HOST' as const };
          return m;
        }));
        setShowTransferModal(false);
        setSelectedMember(null);
      },
      onError: () => {
        // API 실패 시 로컬에서 처리 (fallback)
        setMembers(prev => prev.map(m => {
          if (m.role === 'HOST') return { ...m, role: 'MEMBER' as const };
          if (m.userId === selectedMember.userId) return { ...m, role: 'HOST' as const };
          return m;
        }));
        setShowTransferModal(false);
        setSelectedMember(null);
      },
    });
  };

  // 강퇴
  const handleKickConfirm = () => {
    if (!selectedMember) return;

    // API 호출 시도
    removeMember(String(selectedMember.memberId), {
      onSuccess: () => {
        setMembers(prev => prev.filter(m => m.memberId !== selectedMember.memberId));
        setShowKickModal(false);
        setSelectedMember(null);
      },
      onError: () => {
        // API 실패 시 로컬에서 처리 (fallback)
        setMembers(prev => prev.filter(m => m.memberId !== selectedMember.memberId));
        setShowKickModal(false);
        setSelectedMember(null);
      },
    });
  };

  // 참가 승인
  const handleApprove = (member: Member) => {
    approveMember(
      { memberId: String(member.memberId) },
      {
        onSuccess: () => {
          setPendingMembers(prev => prev.filter(m => m.memberId !== member.memberId));
          setMembers(prev => [...prev, { ...member, status: 'APPROVED' }]);
        },
        onError: () => {
          alert('승인 처리에 실패했습니다. 다시 시도해 주세요.');
        },
      }
    );
  };

  // 참가 거절
  const handleReject = (member: Member) => {
    rejectMember(
      { memberId: String(member.memberId) },
      {
        onSuccess: () => {
          setPendingMembers(prev => prev.filter(m => m.memberId !== member.memberId));
        },
        onError: () => {
          alert('거절 처리에 실패했습니다. 다시 시도해 주세요.');
        },
      }
    );
  };

  // 로딩 상태
  if (isLoadingMembers || isLoadingPending) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="mt-4 text-gray-500 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between p-4">
          <BackButton />
          <h1 className="font-semibold text-base">모임 멤버</h1>
          <button
            onClick={() => navigate(`/meetings/${meetingId}`, { state: { updatedMembers: members } })}
            className="text-sm text-gray-400 font-medium"
          >
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
                  <div className="absolute -bottom-0.5 -right-0.5 bg-yellow-400 rounded-full p-0.5 border border-white">
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
                    disabled={isTransferring}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md disabled:opacity-50"
                  >
                    {isTransferring && selectedMember?.userId === member.userId ? '양도 중...' : '모임장 양도'}
                  </button>
                  <button
                    onClick={() => { setSelectedMember(member); setShowKickModal(true); }}
                    disabled={isRemoving}
                    className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-md disabled:opacity-50"
                  >
                    {isRemoving && selectedMember?.userId === member.userId ? '강퇴 중...' : '강퇴'}
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
                      disabled={isApproving}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md disabled:opacity-50"
                    >
                      {isApproving ? '처리 중...' : '승인'}
                    </button>
                    <button
                      onClick={() => handleReject(member)}
                      disabled={isRejecting}
                      className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-md disabled:opacity-50"
                    >
                      {isRejecting ? '처리 중...' : '거절'}
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
