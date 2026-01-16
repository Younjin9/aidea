import apiClient from '../client';
import type { ApiResponse } from '@/shared/types/common.types';
import type { Report, ReportUserRequest, Block, BlockUserRequest } from '@/shared/types/Safety.types';

// ============================================
// 🛡️ Safety API - 신고 & 차단
// ============================================

/**
 * 사용자 신고
 * POST /api/safety/reports
 */
export const reportUser = async (data: ReportUserRequest): Promise<ApiResponse<Report>> => {
  return apiClient.post('/safety/reports', data);
};

/**
 * 내 신고 내역 조회
 * GET /api/safety/reports
 */
export const getMyReports = async (): Promise<ApiResponse<Report[]>> => {
  return apiClient.get('/safety/reports');
};

/**
 * 사용자 차단
 * POST /api/safety/blocks
 */
export const blockUser = async (data: BlockUserRequest): Promise<ApiResponse<Block>> => {
  return apiClient.post('/safety/blocks', data);
};

/**
 * 사용자 차단 해제
 * DELETE /api/safety/blocks/{userId}
 */
export const unblockUser = async (userId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/safety/blocks/${userId}`);
};

/**
 * 차단한 사용자 목록
 * GET /api/safety/blocks
 */
export const getBlockedUsers = async (): Promise<ApiResponse<Block[]>> => {
  return apiClient.get('/safety/blocks');
};

const safetyApi = {
  reportUser,
  getMyReports,
  blockUser,
  unblockUser,
  getBlockedUsers,
};

export default safetyApi;
