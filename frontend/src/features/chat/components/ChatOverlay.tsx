import React from 'react';
import { Lock } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

interface ChatOverlayProps {
    onJoin: () => void;
    isPending?: boolean;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ onJoin, isPending }) => {
    return (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">멤버만 참여할 수 있어요</h3>
            <p className="text-gray-600 mb-6 max-w-xs leading-relaxed">
                모임에 가입하고 멤버들과<br />즐겁게 대화를 나눠보세요!
            </p>
            <div className="w-full max-w-[200px]">
                <Button
                    variant={isPending ? "secondary" : "primary"}
                    fullWidth
                    onClick={onJoin}
                >
                    {isPending ? '참가 신청 취소' : '모임 가입하기'}
                </Button>
            </div>
        </div>
    );
};

export default ChatOverlay;
