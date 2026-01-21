// ============================================
// 🛡️ Safety Types - 유경님
// 신고 / 차단
// ============================================

export type ReportReason = 'ABUSE' | 'INAPPROPRIATE' | 'SPAM';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED';

// ============================================
// Report Types
// ============================================

export interface Report {
  reportId: string;
  reporterId: string;
  targetUserId: string;
  reason: ReportReason;
  detail: string;
  evidence?: {
    messageIds?: string[];
    screenshots?: string[];
  };
  status: ReportStatus;
  createdAt: string;
}

export interface ReportUserRequest {
  targetUserId: string;
  reason: ReportReason;
  detail: string;
  evidence?: {
    messageIds?: string[];
    screenshots?: string[];
  };
}

// ============================================
// Block Types
// ============================================

export interface Block {
  blocked: boolean;
  targetUserId: string;
  createdAt: string;
}

export interface BlockUserRequest {
  targetUserId: string;
}