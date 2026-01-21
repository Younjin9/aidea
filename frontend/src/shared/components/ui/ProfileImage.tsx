import React, { useState } from 'react';
import { UserRound, Camera } from 'lucide-react';
import type { ProfileImageProps } from '@/shared/types/component.types';

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt = 'Profile',
  size = 'md',
  fallback,
  onClick,
  className = '',
  showBadge = false,
  badgeContent,
  showEditIcon = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 이미지가 없거나 로드 실패 시 폴백 표시
  const showFallback = !src || imageError;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          overflow-hidden
          flex items-center justify-center
          ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
          ${showFallback ? 'bg-gray-300 text-gray-400' : 'bg-gray-200'}
        `}
        onClick={onClick}
      >
        {showFallback ? (
          // 폴백 UI (이미지 없을 때) - 기본 사용자 아이콘
          <UserRound size={size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 48} strokeWidth={1.5} />
        ) : (
          <>
            {/* 로딩 스켈레톤 */}
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            {/* 실제 이미지 */}
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        )}
      </div>

      {/* 뱃지 (온라인 상태 등) */}
      {showBadge && badgeContent && (
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
          {badgeContent}
        </div>
      )}

      {/* 편집 아이콘 (사진 변경) - showEditIcon이 true일 때만 표시 */}
      {showEditIcon && (size === 'lg' || size === 'xl') && (
        <button
          className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          aria-label="Edit profile picture"
        >
          <Camera size={16} className="text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default ProfileImage;