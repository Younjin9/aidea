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
<<<<<<< HEAD
  senderId: number | string;
=======
  senderId: string;
>>>>>>> 07aa0750c67c41862888b229e90a94d07fe97e69
  senderName: string;
  senderProfileImage?: string;
  content: string;
  createdAt: string;
  type: 'TALK' | 'ENTER' | 'LEAVE' | 'IMAGE';
}

export type ChatRoomListResponse = BaseResponse<ChatRoom[]>;
export type ChatMessageListResponse = BaseResponse<ChatMessage[]>;
