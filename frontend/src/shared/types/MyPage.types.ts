// MyPage related types

export interface User {
  user_id: number;
  email: string;
  nickname: string;
  profile_image?: string;
  phone_number?: string;
  birth_date?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  location?: string;
  latitude?: number;
  longitude?: number;
  location_uploaded_at?: string;
  provider: 'LOCAL' | 'KAKAO' | 'GOOGLE' | 'NAVER';
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  interest_id: number;
  interest_name: string;
  category?: string;
  created_at: string;
  updated_at: string;
}
