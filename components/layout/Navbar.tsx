
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, ICONS } from '../../constants';
import Button from '../common/Button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-[var(--color-base-300)] text-[var(--color-base-content)] shadow-md border-b border-[length:var(--border)] border-[var(--color-neutral)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-semibold text-xl">{APP_NAME}</span>
          </div>
          <div className="flex items-center space-x-3">
            {user && (
              <>
                <span className="text-sm hidden sm:block">Welcome, {user.username} ({user.role})</span>
                 <Button 
                    onClick={logout} 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                   <span dangerouslySetInnerHTML={{ __html: ICONS.LOGOUT }} />
                   <span>Logout</span>
                 </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
