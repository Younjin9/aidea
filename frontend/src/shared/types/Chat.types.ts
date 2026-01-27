import type { BaseResponse } from './auth.types';

export interface ChatRoom {
  chatRoomId: number;
  meetingId: number;
  meetingTitle: string;
  meetingImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participantCount: number;
}

export interface ChatMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  senderProfileImage?: string;
  content: string;
  createdAt: string;
  type: 'TALK' | 'ENTER' | 'LEAVE' | 'IMAGE';
}

export type ChatRoomListResponse = BaseResponse<ChatRoom[]>;
export type ChatMessageListResponse = BaseResponse<ChatMessage[]>;
