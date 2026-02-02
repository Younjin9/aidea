import React, { useState } from 'react';
import { Heart, Share2, Ellipsis } from 'lucide-react';
import BackButton from '@/shared/components/ui/BackButton';
import Modal from '@/shared/components/ui/Modal';

// ============================================
// DetailHeader Component
// ============================================

export interface DetailHeaderProps {
  title: string;
  isLiked: boolean;
  activeTab: 'home' | 'chat';
  onLikeToggle: () => void;
  onShare: () => void;
  onTabChange: (tab: 'home' | 'chat') => void;
  isHost: boolean;
  isMember: boolean;
  onConfirmReport: (content: string) => void;
  onConfirmLeave: () => void;
  onConfirmDelete?: () => void;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  isLiked,
  activeTab,
  onLikeToggle,
  onShare,
  onTabChange,
  isHost,
  isMember,
  onConfirmReport,
  onConfirmLeave,
  onConfirmDelete,
}) => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportContent, setReportContent] = useState('');

  const actionSheetActions = [
    ...(isHost ? [
      { label: '모임 삭제', onClick: () => { setShowActionSheet(false); setShowDeleteModal(true); }, variant: 'danger' as const }
    ] : []),
    ...(isMember && !isHost ? [
      { label: '모임 신고', onClick: () => { setShowActionSheet(false); setShowReportModal(true); } },
      { label: '모임 탈퇴', onClick: () => { setShowActionSheet(false); setShowLeaveModal(true); }, variant: 'danger' as const }
    ] : []),
    ...(!isHost && !isMember ? [
      { label: '모임 신고', onClick: () => { setShowActionSheet(false); setShowReportModal(true); } }
    ] : []),
  ];

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center p-4 relative">
          <BackButton />
          <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-sm">{title}</h1>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={onLikeToggle} className="p-2 hover:bg-gray-100 rounded-full transition">
              <Heart size={20} fill={isLiked ? '#e91e63' : 'none'} stroke={isLiked ? '#e91e63' : 'currentColor'} />
            </button>
            <button onClick={onShare} className="p-2 hover:bg-gray-100 rounded-full transition">
              <Share2 size={20} className="text-black" />
            </button>
            <button onClick={() => setShowActionSheet(true)} className="p-2 hover:bg-gray-100 rounded-full transition">
              <Ellipsis size={20} />
            </button>
          </div>
        </div>
        <div className="flex px-4 border-t border-gray-100">
          {(['home', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 py-3 font-medium text-sm relative text-center ${activeTab === tab ? 'text-black' : 'text-gray-500'}`}
            >
              {tab === 'home' ? '홈' : '채팅'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-dark" />}
            </button>
          ))}
        </div>
      </header>

      <Modal type="bottom" isOpen={showActionSheet} onClose={() => setShowActionSheet(false)} actions={actionSheetActions} />

      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="모임 신고"
        message="신고 사유를 작성해주세요."
        showInput
        inputPlaceholder="신고 내용을 입력해주세요"
        inputValue={reportContent}
        onInputChange={setReportContent}
        confirmText="신고"
        cancelText="취소"
        onConfirm={() => { onConfirmReport(reportContent); setReportContent(''); setShowReportModal(false); }}
      />

      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        message="모임에서 탈퇴하시겠습니까?"
        showCheckbox
        checkboxLabel="탈퇴에 동의합니다"
        confirmText="탈퇴"
        cancelText="취소"
        onConfirm={() => { onConfirmLeave(); setShowLeaveModal(false); }}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        message="모임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        showCheckbox
        checkboxLabel="삭제에 동의합니다"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={() => { onConfirmDelete?.(); setShowDeleteModal(false); }}
      />
    </>
  );
};

export default DetailHeader;
