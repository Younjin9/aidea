// ============================================
// 🎉 Meeting Types - 유경님
// 모임 목록 / 검색 / 개설 / 상세
// ============================================

import type { Member } from './Member.types';

export type MeetingStatus = 'RECRUITING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// ============================================
// Meeting Types
// ============================================

export interface Meeting {
  groupId: number; // Changed to number to match backend Long, and name meetingId->groupId
  title: string;
  description: string;
  imageUrl?: string;
  interestCategoryId: string;
  interestCategoryName?: string;
  memberCount: number; // For UI backward compatibility
  currentMembers?: number; // Backend field
  maxMembers: number;
  location: string; // Backend 'location' string (address)
  latitude: number;
  longitude: number;
  region: string;
  distanceKm?: number;
  isPublic: boolean;
  isLiked?: boolean;
  rules?: string[];
  ownerUserId: number; // Backend uses userId Long
  creator?: {
    userId: number;
    nickname: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
  myRole?: 'HOST' | 'MEMBER' | 'NONE'; // Backend driven permission
  myStatus?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE';

  // ✅ 추가: 백엔드에서 이제 기본으로 포함됨
  members?: Member[];
  events?: MeetingEvent[];
}

export interface MeetingDetail extends Meeting {
  members: Member[]; // Required in detail view
  events: MeetingEvent[]; // Required in detail view
}

// Map에서 사용하는 간단한 모임 타입
export interface MapMeeting {
  groupId: number;
  title: string;
  lat: number;
  lng: number;
  memberCount: number;
}

export interface CreateMeetingRequest {
  title: string;
  description: string;
  interestCategoryId: string;
  maxMembers: number;
  // Flattened location fields
  region: string;
  location: string; // Address string
  latitude: number;
  longitude: number;
  locationDetail?: string; // Added

  rules?: string[];
  isPublic: boolean;
  meetingDate: string; // Backend requires meetingDate
  imageUrl?: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  maxMembers?: number;
  rules?: string[];
  isPublic?: boolean;
}

export interface JoinMeetingRequest {
  requestMessage?: string;
}

export interface JoinMeetingResponse {
  status: 'PENDING' | 'APPROVED';
  memberId: string;
}

// ============================================
// Stats Types
// ============================================

export interface MeetingStats {
  memberCount: number;
  eventCount: number;
  attendanceRate: number;
  activityScore: number;
}

// ============================================
// UI Types - 화면 표시용
// ============================================

/**
 * UI에서 사용하는 간소화된 모임 타입
 */
export interface MeetingUI {
  id: number;
  groupId: string; // 원본 groupId (네비게이션용)
  image: string;
  title: string;
  category: string;
  location: string;
  members: number;
  maxMembers?: number;
  description?: string;
  date?: string;
  isLiked?: boolean;

  ownerUserId?: string | number; // 모임 생성자 ID
  myStatus?: 'PENDING' | 'APPROVED'; // 내 가입 상태
  myRole?: 'HOST' | 'MEMBER'; // 내 역할
}

export interface MeetingListParams {
  category?: string;
  region?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface MeetingEvent {
  eventId: number | string;
  title: string;
  date: string;
  scheduledAt?: string;
  placeName?: string;
  location?: string | { lat: number; lng: number };
  description?: string;
  attendees?: number;
  participantCount?: number;
  participants?: Member[];
  maxParticipants?: number;
  cost?: number;
  imageUrl?: string;
  mapUrl?: string;
  isHost?: boolean;
}


export interface ShareCreationResponse {
  shareToken: string;
  shareUrl: string;
  expiresAt: string;
  messages: string[];
}
