import { ReactNode } from 'react';

// Common component prop types

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: ReactNode;
}

export interface ProfileImageProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  onClick?: () => void;
  className?: string;
  showBadge?: boolean;
  badgeContent?: ReactNode;
}

export interface MeetingCardProps {
  meeting: {
    meeting_id: number;
    title: string;
    description: string;
    image_url?: string;
    location: string;
    max_members: number;
    current_members: number;
    meeting_date: string;
    status: 'RECRUITING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    tags?: Array<{ interest_id: number; interest_name: string }>;
    creator?: {
      user_id: number;
      nickname: string;
      profile_image?: string;
    };
  };
  variant?: 'card' | 'list' | 'compact';
  onClick?: (meetingId: number) => void;
  onLike?: (meetingId: number) => void;
  isLiked?: boolean;
  className?: string;
}