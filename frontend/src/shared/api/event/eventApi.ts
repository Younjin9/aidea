import apiClient from '../client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Event,
  EventDetail,
  EventParticipant,
  CreateEventRequest,
  UpdateEventRequest,
  ParticipateResponse,
  AttendanceRecord,
  CheckAttendanceRequest,
} from '@/shared/types/Event.types';

// ============================================
// 📅 일정(정모) 관리
// ============================================

/**
 * 모임 일정 목록 조회
 * GET /api/groups/{groupId}/events
 */
export const getEvents = async (
  groupId: string,
  filter?: 'upcoming' | 'past' | 'all'
): Promise<ApiResponse<Event[]>> => {
  const params = filter ? `?filter=${filter}` : '';
  return apiClient.get(`/groups/${groupId}/events${params}`);
};

/**
 * 일정 상세 조회
 * GET /api/groups/{groupId}/events/{eventId}
 */
export const getEventDetail = async (groupId: string, eventId: string): Promise<ApiResponse<EventDetail>> => {
  return apiClient.get(`/groups/${groupId}/events/${eventId}`);
};

/**
 * 일정 생성 (정모 개설)
 * POST /api/groups/{groupId}/events
 */
export const createEvent = async (groupId: string, data: CreateEventRequest): Promise<ApiResponse<EventDetail>> => {
  return apiClient.post(`/groups/${groupId}/events`, data);
};

/**
 * 일정 수정
 * PATCH /api/groups/{groupId}/events/{eventId}
 */
export const updateEvent = async (
  groupId: string,
  eventId: string,
  data: UpdateEventRequest
): Promise<ApiResponse<EventDetail>> => {
  return apiClient.patch(`/groups/${groupId}/events/${eventId}`, data);
};

/**
 * 일정 취소
 * DELETE /api/groups/{groupId}/events/{eventId}
 */
export const cancelEvent = async (groupId: string, eventId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/groups/${groupId}/events/${eventId}`);
};

/**
 * 일정 참가 신청
 * POST /api/groups/{groupId}/events/{eventId}/participate
 */
export const participateEvent = async (groupId: string, eventId: string): Promise<ApiResponse<ParticipateResponse>> => {
  return apiClient.post(`/groups/${groupId}/events/${eventId}/participate`);
};

/**
 * 일정 참가 취소
 * DELETE /api/groups/{groupId}/events/{eventId}/participate
 */
export const cancelParticipation = async (groupId: string, eventId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/groups/${groupId}/events/${eventId}/participate`);
};

/**
 * 일정 참가자 목록 조회
 * GET /api/groups/{groupId}/events/{eventId}/participants
 */
export const getEventParticipants = async (groupId: string, eventId: string): Promise<ApiResponse<EventParticipant[]>> => {
  return apiClient.get(`/groups/${groupId}/events/${eventId}/participants`);
};

/**
 * 참가 확정 (HOST)
 * POST /api/groups/{groupId}/events/{eventId}/participants/{userId}/confirm
 */
export const confirmParticipant = async (
  groupId: string,
  eventId: string,
  userId: string
): Promise<ApiResponse<void>> => {
  return apiClient.post(`/groups/${groupId}/events/${eventId}/participants/${userId}/confirm`);
};

/**
 * 출석 체크 (HOST)
 * POST /api/groups/{groupId}/events/{eventId}/attendance
 */
export const checkAttendance = async (
  groupId: string,
  eventId: string,
  data: CheckAttendanceRequest
): Promise<ApiResponse<void>> => {
  return apiClient.post(`/groups/${groupId}/events/${eventId}/attendance`, data);
};

/**
 * 출석 기록 조회
 * GET /api/groups/{groupId}/events/{eventId}/attendance
 */
export const getAttendance = async (groupId: string, eventId: string): Promise<ApiResponse<AttendanceRecord[]>> => {
  return apiClient.get(`/groups/${groupId}/events/${eventId}/attendance`);
};

const eventApi = {
  getEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  cancelEvent,
  participateEvent,
  cancelParticipation,
  getEventParticipants,
  confirmParticipant,
  checkAttendance,
  getAttendance,
};

export default eventApi;
