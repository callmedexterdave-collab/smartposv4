import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Package, Scan, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/admin-main' },
    { id: 'inventory', icon: Package, label: 'Inventory', path: '/inventory' },
    { id: 'scanner', icon: Scan, label: '', path: '/scanner', isScanner: true },
    { id: 'staff', icon: Users, label: 'Staff', path: '/staff' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-end">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            if (item.isScanner) {
              return (
                <button
                  key={item.id}
                  onClick={() => setLocation(item.path)}
                  data-testid={`nav-${item.id}`}
                  className="relative -top-4"
                >
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg touch-feedback">
                    <Icon className="w-6 h-6 text-white" />
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
                  "flex flex-col items-center py-2 px-3 min-w-[74px] touch-feedback",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-1", isActive && "font-bold")} />
                <span className={cn("text-xs", isActive && "font-bold")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
