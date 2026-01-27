import type { ReactNode } from 'react';

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
  showEditIcon?: boolean;
}

export interface MeetingCardProps {
  meeting: {
    groupId: string;
    title: string;
    description: string;
    imageUrl?: string;
    location: string;
    maxMembers: number;
    memberCount: number;
    meetingDate?: string;
    status: 'RECRUITING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    tags?: Array<{ interestId: string; interestName: string }>;
    creator?: {
      userId: string;
      nickname: string;
      profileImage?: string;
    };
  };
  variant?: 'card' | 'list' | 'compact';
  onClick?: (meetingId: string) => void;
  onLike?: (meetingId: string) => void;
  isLiked?: boolean;
  className?: string;
}