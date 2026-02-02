import apiClient from './client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface ShareCreateResponse {
  shareToken: string;
  shareUrl: string;
  expiresAt: string;
}

/**
 * 공유 링크 생성
 * POST /api/groups/{id}/share
 */
export const createShare = async (groupId: string): Promise<ApiResponse<ShareCreateResponse>> => {
  return apiClient.post(`/api/groups/${groupId}/share`);
};

const shareApi = {
  createShare,
};

export default shareApi;
