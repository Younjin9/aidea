// ============================================
// 🎉 Meeting Types - 유경님
// 모임 목록 / 검색 / 개설 / 상세
// ============================================

import type { Location } from './common.types';
import type { Member } from './Member.types';

export type MeetingStatus = 'RECRUITING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// ============================================
// Meeting Types
// ============================================

export interface Meeting {
  groupId: string;
  title: string;
  description: string;
  imageUrl?: string;
  interestCategoryId: string;
  interestCategoryName?: string;
  memberCount: number;
  maxMembers: number;
  location: Location;
  distanceKm?: number;
  isPublic: boolean;
  rules?: string[];
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingDetail extends Meeting {
  members: Member[];
  events: MeetingEvent[];
  myRole?: 'HOST' | 'USER';
  myStatus?: 'PENDING' | 'APPROVED';
}

// ============================================
// MapMeeting - 지도 위치 기반 검색용 (Moved to Map Types below)
// ============================================

export interface MapMeeting {
  groupId: string;
  title: string;
  imageUrl?: string;
  memberCount: number;
  maxMembers: number;
  location: Location;
  distanceKm?: number;
  isPublic: boolean;
  markerColor?: string;
  clustered?: boolean;
}

export interface MeetingEvent {
  eventId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  location?: string;
  mapUrl?: string;
  cost?: string;
  maxParticipants?: number;
  participantCount: number;
  imageUrl?: string;
  participants?: Array<{
    userId: string | number;
    nickname: string;
    profileImage?: string;
    isHost?: boolean;
  }>;
}

export interface MeetingTag {
  tagId: string;
  interestId: number;
  interestName: string;
}

// ============================================
// Request Types
// ============================================

export interface MeetingListParams {
  page?: number;
  size?: number;
  interestCategoryId?: string;
  keyword?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sortBy?: 'distance' | 'recent' | 'popular';
}

export interface CreateMeetingRequest {
  title: string;
  description: string;
  interestCategoryId: string;
  maxMembers: number;
  location: {
    latitude: number;
    longitude: number;
    region: string;
  };
  rules?: string[];
  isPublic: boolean;
  image?: File;
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

