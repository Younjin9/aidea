import apiClient, { buildQueryString, createFormData } from './client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';
import type {
  Meeting,
  MeetingDetail,
  MeetingListParams,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  JoinMeetingRequest,
  JoinMeetingResponse,
  MeetingStats,
} from '@/shared/types/meeting.types';
import type {
  Member,
  ApproveMemberRequest,
  RejectMemberRequest,
  TransferHostRequest,
  MemberStats,
  MemberRole,
} from '@/shared/types/member.types';
import type {
  Event,
  EventDetail,
  EventParticipant,
  CreateEventRequest,
  UpdateEventRequest,
  ParticipateResponse,
  AttendanceRecord,
  CheckAttendanceRequest,
} from '@/shared/types/event.types';

// ============================================
// 🎉 Meeting API - 유경님
// 모임 / 멤버 / 일정 통합
// ============================================

// ============================================
// 📍 모임 CRUD
// ============================================

/**
 * 모임 목록 조회
 * GET /api/groups
 */
export const getList = async (params: MeetingListParams): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
  const queryString = buildQueryString(params);
  return apiClient.get(`/groups?${queryString}`);
};

/**
 * 내 근처 모임 조회
 * GET /api/groups/nearby
 */
export const getNearby = async (
  lat: number,
  lng: number,
  radiusKm: number = 5
): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get(`/groups/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
};

/**
 * 인기 모임 조회
 * GET /api/groups/popular
 */
export const getPopular = async (period: 'week' | 'month' = 'week'): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get(`/groups/popular?period=${period}`);
};

/**
 * 모임 검색
 * GET /api/groups/search
 */
export const search = async (
  keyword: string,
  filters?: Omit<MeetingListParams, 'keyword'>
): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
  const params = { keyword, ...filters };
  const queryString = buildQueryString(params);
  return apiClient.get(`/groups/search?${queryString}`);
};

/**
 * 모임 상세 조회
 * GET /api/groups/{groupId}
 */
export const getDetail = async (groupId: string): Promise<ApiResponse<MeetingDetail>> => {
  return apiClient.get(`/groups/${groupId}`);
};

/**
 * 모임 생성
 * POST /api/groups
 */
export const create = async (data: CreateMeetingRequest): Promise<ApiResponse<MeetingDetail>> => {
  if (data.image) {
    const formData = createFormData(data);
    return apiClient.post('/groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  
  return apiClient.post('/groups', data);
};

/**
 * 모임 정보 수정
 * PATCH /api/groups/{groupId}
 */
export const update = async (
  groupId: string,
  data: UpdateMeetingRequest
): Promise<ApiResponse<MeetingDetail>> => {
  return apiClient.patch(`/groups/${groupId}`, data);
};

/**
 * 모임 이미지 변경
 * POST /api/groups/{groupId}/image
 */
export const updateImage = async (groupId: string, image: File): Promise<ApiResponse<{ imageUrl: string }>> => {
  const formData = new FormData();
  formData.append('image', image);
  
  return apiClient.post(`/groups/${groupId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * 모임 삭제
 * DELETE /api/groups/{groupId}
 */
export const remove = async (groupId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/groups/${groupId}`);
};

/**
 * 모임 참여 요청
 * POST /api/groups/{groupId}/join
 */
export const join = async (
  groupId: string,
  data?: JoinMeetingRequest
): Promise<ApiResponse<JoinMeetingResponse>> => {
  return apiClient.post(`/groups/${groupId}/join`, data);
};

/**
 * 모임 탈퇴
 * POST /api/groups/{groupId}/leave
 */
export const leave = async (groupId: string): Promise<ApiResponse<void>> => {
  return apiClient.post(`/groups/${groupId}/leave`);
};

/**
 * 모임 좋아요
 * POST /api/groups/{groupId}/like
 */
export const like = async (groupId: string): Promise<ApiResponse<void>> => {
  return apiClient.post(`/groups/${groupId}/like`);
};

/**
 * 모임 좋아요 취소
 * DELETE /api/groups/{groupId}/like
 */
export const unlike = async (groupId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/groups/${groupId}/like`);
};

/**
 * 내가 좋아요한 모임 목록
 * GET /api/users/me/liked-groups
 */
export const getLiked = async (): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get('/users/me/liked-groups');
};

/**
 * 모임 통계 조회
 * GET /api/groups/{groupId}/stats
 */
export const getStats = async (groupId: string): Promise<ApiResponse<MeetingStats>> => {
  return apiClient.get(`/groups/${groupId}/stats`);
};

// ============================================
// 👥 멤버 관리
// ============================================

/**
 * 모임 멤버 목록 조회
 * GET /api/groups/{groupId}/members
 */
export const getMembers = async (groupId: string): Promise<ApiResponse<Member[]>> => {
  return apiClient.get(`/groups/${groupId}/members`);
};

/**
 * 대기 중인 가입 요청 목록
 * GET /api/groups/{groupId}/members/pending
 */
export const getPendingMembers = async (groupId: string): Promise<ApiResponse<Member[]>> => {
  return apiClient.get(`/groups/${groupId}/members/pending`);
};

/**
 * 가입 요청 승인
 * POST /api/groups/{groupId}/members/{memberId}/approve
 */
export const approveMember = async (
  groupId: string,
  data: ApproveMemberRequest
): Promise<ApiResponse<void>> => {
  return apiClient.post(`/groups/${groupId}/members/${data.memberId}/approve`, {
    responseMessage: data.responseMessage,
  });
};

/**
 * 가입 요청 거절
 * POST /api/groups/{groupId}/members/{memberId}/reject
 */
export const rejectMember = async (
  groupId: string,
  data: RejectMemberRequest
): Promise<ApiResponse<void>> => {
  return apiClient.post(`/groups/${groupId}/members/${data.memberId}/reject`, {
    responseMessage: data.responseMessage,
  });
};

/**
 * 멤버 강제 퇴출
 * DELETE /api/groups/{groupId}/members/{memberId}
 */
export const removeMember = async (groupId: string, memberId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/groups/${groupId}/members/${memberId}`);
};

/**
 * HOST 권한 위임
 * POST /api/groups/{groupId}/transfer-host
 */
export const transferHost = async (groupId: string, data: TransferHostRequest): Promise<ApiResponse<void>> => {
  return apiClient.post(`/groups/${groupId}/transfer-host`, data);
};

/**
 * 멤버 역할 변경
 * PATCH /api/groups/{groupId}/members/{memberId}/role
 */
export const updateMemberRole = async (
  groupId: string,
  memberId: string,
  role: MemberRole
): Promise<ApiResponse<void>> => {
  return apiClient.patch(`/groups/${groupId}/members/${memberId}/role`, { role });
};

/**
 * 멤버별 참여 통계
 * GET /api/groups/{groupId}/members/{memberId}/stats
 */
export const getMemberStats = async (groupId: string, memberId: string): Promise<ApiResponse<MemberStats>> => {
  return apiClient.get(`/groups/${groupId}/members/${memberId}/stats`);
};

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

const meetingApi = {
  // 모임
  getList,
  getNearby,
  getPopular,
  search,
  getDetail,
  create,
  update,
  updateImage,
  remove,
  join,
  leave,
  like,
  unlike,
  getLiked,
  getStats,
  // 멤버
  getMembers,
  getPendingMembers,
  approveMember,
  rejectMember,
  removeMember,
  transferHost,
  updateMemberRole,
  getMemberStats,
  // 일정
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

export default meetingApi;