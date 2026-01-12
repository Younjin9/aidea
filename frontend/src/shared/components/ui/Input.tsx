import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  rightElement,
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-dark mb-1 ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          className={`
            w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-gray-dark placeholder-gray-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all
            ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default Input;
