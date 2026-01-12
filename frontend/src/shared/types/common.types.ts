// ============================================
// 📦 공통 타입 (Common Types)
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ============================================
// 🎨 Enum Types
// ============================================

export type Provider = 'LOCAL' | 'KAKAO' | 'GOOGLE' | 'NAVER';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// ============================================
// 📍 Location Types
// ============================================

export interface Location {
  lat: number;
  lng: number;
  region?: string;
  accuracy?: number;
  updatedAt?: string;
}

export interface LocationUpdate {
  lat: number;
  lng: number;
  region: string;
}