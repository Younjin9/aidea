import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
      aria-label="뒤로가기"
    >
      <ChevronLeft className="w-6 h-6 text-gray-dark" />
    </button>
  );
};

export default BackButton;
