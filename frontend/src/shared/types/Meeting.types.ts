// ============================================
// 🎉 Meeting Types - 유경님
// 모임 목록 / 검색 / 개설 / 상세
// ============================================

import type { Location } from './common.types';

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
  members: MeetingMember[];
  events: MeetingEvent[];
  myRole?: 'HOST' | 'MEMBER';
  myStatus?: 'PENDING' | 'APPROVED';
}

export interface MeetingMember {
  userId: string;
  nickname: string;
  profileImage?: string;
  role: 'HOST' | 'MEMBER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'LEFT';
  joinedAt?: string;
  requestMessage?: string;
  responseMessage?: string;
}

// ============================================
// MapMeeting - 지도 위치 기반 검색용
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
}

export interface MeetingEvent {
  eventId: string;
  title: string;
  scheduledAt: string;
  participantCount: number;
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
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sortBy?: 'distance' | 'recent' | 'popular';
}

export interface CreateMeetingRequest {
  title: string;
  description: string;
  interestCategoryId: string;
  maxMembers: number;
  location: {
    lat: number;
    lng: number;
    region: string;
  };
  rules?: string[];
  isPublic: boolean;
  image?: File;
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
// Map Types
// ============================================

export interface MapMeeting extends Meeting {
  markerColor?: string;
  clustered?: boolean;
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
  image: string;
  title: string;
  category: string;
  location: string;
  members: number;
  date?: string;
  isLiked?: boolean;
}