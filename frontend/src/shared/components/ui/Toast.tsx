import React from 'react';

interface ToastProps {
  message: string;
  isOpen: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60]">
      <div className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm shadow-lg">
        {message}
      </div>
    </div>
  );
};

export default Toast;
