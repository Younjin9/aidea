import React from 'react';
import { NavLink } from 'react-router-dom';
import { Film, Users, MessageCircle, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const navItems = [
    { path: '/shorts', label: 'Shorts', icon: Film },
    { path: '/meetings', label: '모임', icon: Users },
    { path: '/chat', label: '채팅', icon: MessageCircle },
    { path: '/mypage', label: '마이', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-[60px] max-w-[430px] mx-auto z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? 'text-gray-dark' : 'text-gray-light'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={isActive ? 'text-gray-dark' : 'text-gray-light'}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;
