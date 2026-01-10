// Meeting related types based on API specification and ERD

export type MeetingStatus = 'RECRUITING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Meeting {
  meeting_id: number;
  title: string;
  description: string;
  image_url?: string;
  location: string;
  latitude: number;
  longitude: number;
  location_detail?: string;
  max_members: number;
  current_members: number;
  meeting_date: string;
  status: MeetingStatus;
  is_approval_required: boolean;
  like_count: number;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

export interface MeetingMember {
  member_id: number;
  meeting_id: number;
  user_id: number;
  role: 'HOST' | 'MEMBER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'LEFT';
  request_message?: string;
  response_message?: string;
  responded_at?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingTag {
  tag_id: number;
  meeting_id: number;
  interest_id: number;
  created_at: string;
}

// UI Model for displaying meetings in frontend
export interface MeetingUI {
  id: number;
  image: string;
  title: string;
  category: string;
  location: string;
  members: number;
  date: string;
  isLiked: boolean;
}