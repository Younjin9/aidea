import apiClient, { buildQueryString, createFormData } from '../client';
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
} from '@/shared/types/Meeting.types';

// ============================================
// 📍 모임 CRUD & 기능
// ============================================

/**
 * 모임 목록 조회
 * GET /api/groups
 */
export const getList = async (params: MeetingListParams): Promise<ApiResponse<PaginatedResponse<Meeting>>> => {
  const queryString = buildQueryString(params);
  return apiClient.get(`/api/groups?${queryString}`);
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
  return apiClient.get(`/api/groups/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
};

/**
 * 인기 모임 조회
 * GET /api/groups/popular
 */
export const getPopular = async (period: 'week' | 'month' = 'week'): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get(`/api/groups/popular?period=${period}`);
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
  return apiClient.get(`/api/groups/search?${queryString}`);
};

/**
 * 모임 상세 조회
 * GET /api/groups/{groupId}
 */
export const getDetail = async (groupId: string): Promise<ApiResponse<MeetingDetail>> => {
  return apiClient.get(`/api/groups/${groupId}`);
};

/**
 * 모임 생성
 * POST /api/groups
 */
export const create = async (data: CreateMeetingRequest): Promise<ApiResponse<MeetingDetail>> => {
  const formData = createFormData(data);
  return apiClient.post('/api/groups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * 모임 정보 수정
 * PATCH /api/groups/{groupId}
 */
export const update = async (
  groupId: string,
  data: UpdateMeetingRequest
): Promise<ApiResponse<MeetingDetail>> => {
  return apiClient.patch(`/api/groups/${groupId}`, data);
};

/**
 * 모임 이미지 업로드 (S3 전용)
 * POST /api/groups/image
 */
export const uploadImage = async (image: File): Promise<ApiResponse<{ imageUrl: string }>> => {
  const formData = new FormData();
  formData.append('image', image);

  return apiClient.post('/api/groups/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * 모임 삭제
 * DELETE /api/groups/{groupId}
 */
export const remove = async (groupId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/api/groups/${groupId}`);
};

/**
 * 모임 참여 요청
 * POST /api/groups/{groupId}/join
 */
export const join = async (
  groupId: string,
  data?: JoinMeetingRequest
): Promise<ApiResponse<JoinMeetingResponse>> => {
  return apiClient.post(`/api/groups/${groupId}/join`, data);
};

/**
 * 모임 탈퇴
 * POST /api/groups/{groupId}/leave
 */
export const leave = async (groupId: string): Promise<ApiResponse<void>> => {
  return apiClient.post(`/api/groups/${groupId}/leave`);
};

/**
 * 모임 좋아요
 * POST /api/groups/{groupId}/like
 */
export const like = async (groupId: string): Promise<ApiResponse<void>> => {
  return apiClient.post(`/api/groups/${groupId}/like`);
};

/**
 * 모임 좋아요 취소
 * DELETE /api/groups/{groupId}/like
 */
export const unlike = async (groupId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/api/groups/${groupId}/like`);
};

/**
 * 내가 좋아요한 모임 목록
 * GET /api/users/me/liked-groups
 */
export const getLiked = async (): Promise<ApiResponse<Meeting[]>> => {
  return apiClient.get('/api/users/me/liked-groups');
};

/**
 * 모임 통계 조회
 * GET /api/groups/{groupId}/stats
 */
export const getStats = async (groupId: string): Promise<ApiResponse<MeetingStats>> => {
  return apiClient.get(`/api/groups/${groupId}/stats`);
};

const meetingApi = {
  getList,
  getNearby,
  getPopular,
  search,
  getDetail,
  create,
  update,
  uploadImage,
  remove,
  join,
  leave,
  like,
  unlike,
  getLiked,
  getStats,
};

export default meetingApi;
