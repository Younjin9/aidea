import apiClient from '../client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Member,
  ApproveMemberRequest,
  RejectMemberRequest,
  TransferHostRequest,
  MemberStats,
  MemberRole,
} from '@/shared/types/member.types';

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

const memberApi = {
  getMembers,
  getPendingMembers,
  approveMember,
  rejectMember,
  removeMember,
  transferHost,
  updateMemberRole,
  getMemberStats,
};

export default memberApi;
