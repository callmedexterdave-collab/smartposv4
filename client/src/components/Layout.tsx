import React from 'react';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { WifiOff } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { isOffline } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-warning-500 text-white text-center py-2 text-sm z-50">
          <WifiOff className="w-4 h-4 inline-block mr-2" />
          Offline Mode
        </div>
      )}
      
      {/* Main Content */}
      <main className={cn("min-h-screen", isOffline && "pt-10", showNavigation && isAuthenticated && isAdmin && "pb-20")}>
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {showNavigation && isAuthenticated && <BottomNavigation />}
    </div>
  );
};

export default Layout;
