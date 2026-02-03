// ============================================
// 👥 Member Types - 유경님
// 멤버 관리
// ============================================

export type MemberRole = 'HOST' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'LEFT';

// ============================================
// Member Interface
// ============================================

export interface Member {
  memberId: string | number;
  userId: string | number;
  nickname: string;
  profileImage?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt?: string;
  requestMessage?: string;
  responseMessage?: string;
}

// ============================================
// Request Types
// ============================================

export interface ApproveMemberRequest {
  memberId: string;
  responseMessage?: string;
}

export interface RejectMemberRequest {
  memberId: string;
  responseMessage: string;
}

export interface TransferHostRequest {
  newHostUserId: string;
}

export interface UpdateMemberRoleRequest {
  role: MemberRole;
}

// ============================================
// Stats Types
// ============================================

export interface MemberStats {
  attendanceRate: number;
  eventCount: number;
  joinedAt: string;
  lastActivityAt: string;
}
