// ============================================
// 👤 User Types - 유경님
// 마이페이지 / 프로필
// ============================================

import type { Provider, Gender, Location } from './common.types';
// import type { Meeting } from './Meeting.types';

// ============================================
// User Types
// ============================================

export interface User {
  userId: string;
  email: string;
  nickname: string;
  bio?: string;
  profileImage?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: Gender;
  location?: Location | { lat: number; lng: number; region: string };
  interests?: string[];
  provider?: Provider;
  providerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  groupCount?: number;
  reviewCount?: number;
  reputation?: number;
}

// ============================================
// Request Types
// ============================================

export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: Gender;
}

export interface UpdateProfileImageResponse {
  profileImage: string;
}

// ============================================
// My Meetings Types
// ============================================

export type MeetingStatusFilter = 'active' | 'all';

// ============================================
// Stats Types
// ============================================

export interface UserStats {
  groupCount: number;
  eventCount: number;
  attendanceRate: number;
  activityScore: number;
  reviewCount: number;
}

export interface UserReputation {
  userId: string;
  score: number;
  reviewCount: number;
  attendanceRate: number;
  responseRate: number;
}

// ============================================
// Settings Types
// ============================================

export interface NotificationSettings {
  chatEnabled: boolean;
  eventEnabled: boolean;
  marketingEnabled: boolean;
}

export interface UpdateNotificationSettingsRequest {
  chatEnabled?: boolean;
  eventEnabled?: boolean;
  marketingEnabled?: boolean;
}

export interface DeleteAccountRequest {
  reason?: string;
}
