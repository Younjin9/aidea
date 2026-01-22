import { useQuery } from '@tanstack/react-query';
// import { chatApi } from '@/shared/api/chatAPI';
import type { ChatRoom } from '@/shared/types/Chat.types';

export const useChatList = () => {
  return useQuery<ChatRoom[]>({
    queryKey: ['chatRooms'],
    queryFn: async () => {
      // const response = await chatApi.getChatRooms();
      // return response.success ? response.data : [];
      
      // 더미 데이터 반환 (테스트용)
      return [
        {
          chatRoomId: 1,
          meetingId: 101,
          meetingTitle: "강남역 맛집 탐방",
          meetingImage: "",
          lastMessage: "오늘 몇 시에 모이나요?",
          lastMessageTime: "오전 10:30",
          unreadCount: 2,
          participantCount: 4
        },
        {
          chatRoomId: 2,
          meetingId: 102,
          meetingTitle: "주말 등산 모임",
          meetingImage: "",
          lastMessage: "준비물 챙기셨나요?",
          lastMessageTime: "어제",
          unreadCount: 0,
          participantCount: 10
        }
      ] as ChatRoom[];
    },
    initialData: [],
  });
};
