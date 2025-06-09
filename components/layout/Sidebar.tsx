
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { APP_ROUTES, ICONS, APP_NAME } from '../../constants';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { path: APP_ROUTES.DASHBOARD, label: 'Dashboard', icon: ICONS.DASHBOARD, roles: [UserRole.Admin, UserRole.HRManager, UserRole.LineManager, UserRole.Employee] },
  { path: APP_ROUTES.PROFILE, label: 'My Profile', icon: ICONS.PROFILE, roles: [UserRole.Admin, UserRole.HRManager, UserRole.LineManager, UserRole.Employee] },
  { path: APP_ROUTES.LEAVE_REQUEST, label: 'Leave Requests', icon: ICONS.LEAVE, roles: [UserRole.Admin, UserRole.HRManager, UserRole.LineManager, UserRole.Employee] },
  { path: APP_ROUTES.ATTENDANCE, label: 'Attendance Overview', icon: ICONS.ATTENDANCE, roles: [UserRole.Admin, UserRole.HRManager, UserRole.LineManager, UserRole.Employee] },
  // Admin specific
  { path: APP_ROUTES.ADMIN_USER_MANAGEMENT, label: 'User Management', icon: ICONS.USERS, roles: [UserRole.Admin] },
  // HR specific
  { path: APP_ROUTES.HR_EMPLOYEE_MANAGEMENT, label: 'Employee Management', icon: ICONS.EMPLOYEES, roles: [UserRole.Admin, UserRole.HRManager] },
  // Manager specific
  { path: APP_ROUTES.MANAGER_TEAM_LEAVE_APPROVAL, label: 'Team Leave Approval', icon: ICONS.LEAVE, roles: [UserRole.Admin, UserRole.LineManager, UserRole.HRManager] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-3 py-2.5 rounded-[var(--radius-selector)] transition-colors duration-200 ease-in-out
     ${isActive 
       ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]' 
       : 'hover:bg-[var(--color-neutral)] hover:text-[var(--color-neutral-content)] text-[var(--color-base-content)]'
     }`;

  return (
    <aside className="w-64 bg-[var(--color-base-100)] text-[var(--color-base-content)] p-4 space-y-2 border-r border-[length:var(--border)] border-[var(--color-neutral)] flex flex-col">
      <div className="text-2xl font-bold mb-6 text-center text-[var(--color-primary-content)] bg-[var(--color-primary)] py-3 rounded-[var(--radius-box)]">Menu</div>
      <nav className="flex-grow">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={navLinkClasses}>
                <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-[length:var(--border)] border-[var(--color-neutral)]">
         {/* Could add a quick profile summary here or settings link */}
         <p className="text-xs text-center">© {new Date().getFullYear()} {APP_NAME}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
