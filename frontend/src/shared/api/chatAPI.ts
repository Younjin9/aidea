import { apiClient } from '@/shared/api/client';
import type { ChatRoomListResponse, ChatMessageListResponse } from '@/shared/types/Chat.types';
import type { BaseResponse } from '@/shared/types/auth.types';

export const chatApi = {
  // 1. 채팅방 목록 조회
  getChatRooms: async (): Promise<ChatRoomListResponse> => {
    const response = await apiClient.get<ChatRoomListResponse>('/chat/rooms');
    return response as unknown as ChatRoomListResponse;
  },

  // 2. 채팅 메시지 조회
  getMessages: async (meetingId: number): Promise<ChatMessageListResponse> => {
    const response = await apiClient.get<ChatMessageListResponse>(`/chat/rooms/${meetingId}`);
    return response as unknown as ChatMessageListResponse;
  },

  // 3. 메시지 읽음 처리
  markAsRead: async (meetingId: number): Promise<BaseResponse<null>> => {
    const response = await apiClient.post<BaseResponse<null>>(`/chat/rooms/${meetingId}/read`);
    return response as unknown as BaseResponse<null>;
  }
};
