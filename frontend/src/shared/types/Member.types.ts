// ============================================
// 👥 Member Types - 유경님
// 멤버 관리
// ============================================
// Note: 기본 Member 인터페이스는 Meeting.types.ts의 MeetingMember 참조
// 이 파일은 Member 요청 타입들을 정의합니다

export type MemberRole = 'HOST' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'LEFT';

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
