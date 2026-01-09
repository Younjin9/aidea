import React from 'react';
import logo from '@/assets/images/logo.png';
import BackButton from '@/shared/components/ui/BackButton';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, showBackButton }) => {
  return (
    <div className="flex flex-col items-center px-6 pt-6 h-full flex-1 relative">
      {/* Header Area (Back Button) */}
      <div className="w-full flex items-center h-12 mb-4 relative">
        {showBackButton && <BackButton className="absolute left-0" />}
      </div>

      {/* Logo Area */}
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AIMO" className="w-32 h-32 object-contain" />
        </div>
        {!title && (
          <p className="text-gray-light text-base">모든 모임이 다 모이는 공간</p>
        )}
        {title && (
          <h2 className="text-xl font-bold text-gray-dark mt-4">{title}</h2>
        )}
      </div>

      {/* Content */}
      <div className="w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
