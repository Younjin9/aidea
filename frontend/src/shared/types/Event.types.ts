// ============================================
// 📅 Event Types - 유경님
// 정모(일정) 관리
// ============================================

import type { Location } from './common.types';

// ============================================
// Event Types
// ============================================

export interface Event {
  eventId: string;
  groupId: string;
  title: string;
  scheduledAt: string;
  placeName: string;
  location: Location;
  participantCount: number;
  maxParticipants: number;
  notes?: string;
  createdAt: string;
}

export interface EventDetail extends Event {
  summary?: string;
  imageUrl?: string;
  cost?: number | string;
  participants: EventParticipant[];
  isParticipating: boolean;
}

export interface EventParticipant {
  userId: string;
  nickname: string;
  profileImage?: string;
  confirmedAt: string;
}

// ============================================
// Request Types
// ============================================

export interface CreateEventRequest {
  title: string;
  summary?: string;
  scheduledAt: string;
  placeName: string;
  location: {
    lat: number;
    lng: number;
  };
  maxParticipants: number;
  cost?: string | number;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateEventRequest {
  title?: string;
  scheduledAt?: string;
  placeName?: string;
  location?: {
    lat: number;
    lng: number;
  };
  maxParticipants?: number;
  cost?: string | number;
  notes?: string;
  imageUrl?: string;
}

export interface ParticipateResponse {
  status: 'confirmed' | 'waiting';
  position?: number;
}

// ============================================
// Attendance Types
// ============================================

export interface AttendanceRecord {
  userId: string;
  attended: boolean;
  checkedAt?: string;
}

export interface CheckAttendanceRequest {
  attendees: Array<{
    userId: string;
    attended: boolean;
  }>;
}