import React, { useRef, useCallback } from 'react';
import RecommendedMeetingCard from './RecommendedMeetingCard';
import { useInfiniteMeetings } from '@/features/meeting/hooks/useMeetings';

const ShortsFeed: React.FC = () => {
    // 무한 스크롤 훅 사용 (10개씩 로드)
    const { 
        meetings, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        status 
    } = useInfiniteMeetings();

    const observer = useRef<IntersectionObserver | null>(null);
    
    // 마지막 요소에 ref를 연결하여 스크롤 감지
    const lastMeetingElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isFetchingNextPage) return; // 로딩 중이면 중복 요청 방지
        if (observer.current) observer.current.disconnect(); // 이전 관찰자 해제
        
        observer.current = new IntersectionObserver(entries => {
            // 마지막 요소가 보이고, 다음 페이지가 있다면 로드
            if (entries[0].isIntersecting && hasNextPage) {
                console.log("🎬 Load next page of shorts...");
                fetchNextPage();
            }
        }, { threshold: 0.5 }); // 50% 정도 보였을 때 미리 로드
        
        if (node) observer.current.observe(node);
    }, [isFetchingNextPage, fetchNextPage, hasNextPage]);

    if (status === 'pending') {
         return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white">
                <div className="animate-pulse">Loading Shorts...</div>
            </div>
        );
    }

    if (!meetings || meetings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white">
                <p className="text-gray-400">추천할 모임이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
            {meetings.map((meeting, index) => {
                // 마지막 카드에 Observer Ref 연결
                if (meetings.length === index + 1) {
                    return (
                        <div ref={lastMeetingElementRef} key={meeting.id} className="w-full h-full snap-start snap-always relative">
                            <RecommendedMeetingCard meeting={meeting} />
                        </div>
                    );
                }
                return (
                     <div key={meeting.id} className="w-full h-full snap-start snap-always relative">
                        <RecommendedMeetingCard meeting={meeting} />
                    </div>
                );
            })}
            
            {/* 추가 로딩 표시 (필요 시) */}
            {isFetchingNextPage && (
                 <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
                    <span className="text-white text-xs bg-black/60 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                        새로운 모임 불러오는 중...
                    </span>
                 </div>
            )}
        </div>
    );
};

export default ShortsFeed;
