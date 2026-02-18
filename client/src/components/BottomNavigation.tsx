import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Package, Scan, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAdmin) return null;

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/admin-main' },
    { id: 'inventory', icon: Package, label: 'Inventory', path: '/inventory' },
    { id: 'scanner', icon: Scan, label: '', path: '/scanner', isScanner: true },
    { id: 'staff', icon: Users, label: 'Staff', path: '/staff' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 bg-[#F5F5F5] shadow-md">
      <div className="w-full max-w-md mx-auto">
        {/* Soft UI Navigation Container */}
        <div
          className="relative bg-[#F5F5F5]/80 rounded-full shadow-lg border border-gray-300/40"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/0 rounded-full" />
          
          <div className="relative flex justify-around items-center py-3 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              if (item.isScanner) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    data-testid={`nav-${item.id}`}
                    className="relative -top-5 z-10"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#7D6C7D] to-[#D89D9D] rounded-full flex items-center justify-center shadow-xl touch-feedback hover:scale-105 transition-all duration-300 transform"
                         style={{
                           boxShadow: '0 10px 28px rgba(125, 108, 125, 0.45), inset 0 2px 4px rgba(255,255,255,0.3)',
                         }}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setLocation(item.path)}
                  data-testid={`nav-${item.id}`}
                  className={cn(
                    "relative flex flex-col items-center py-2 px-3 min-w-[60px] touch-feedback transition-all duration-300 rounded-2xl",
                    isActive 
                      ? "text-[#7D6C7D] bg-white/60 shadow-inner" 
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <div className="relative flex flex-col items-center">
                    <Icon
                      className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 mb-1 transition-all duration-300",
                        isActive
                          ? "text-[#7D6C7D] drop-shadow-sm transform scale-110"
                          : "text-gray-400"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs font-medium transition-all duration-300",
                        isActive ? "text-[#7D6C7D] font-semibold" : "text-gray-400 font-normal"
                      )}
                    >
                      {item.label}
                    </span>
                    {/* Active indicator line positioned beneath text */}
                    {isActive && (
                      <div className="mt-0.5 w-6 h-0.5 bg-[#7D6C7D] rounded-full shadow-sm z-20" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
